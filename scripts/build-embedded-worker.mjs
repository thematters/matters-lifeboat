import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";

const root = resolve(new URL("../", import.meta.url).pathname);
const publicDir = resolve(root, "tmp/deploy/matters-lifeboat-public");
const outFile = resolve(root, "tmp/deploy/matters-lifeboat-proxy-embedded.js");
const version = "0.1.5";

rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });

copyDir(resolve(root, "packages/landing/dist"), publicDir);
copyDir(resolve(root, "packages/app/dist"), join(publicDir, "app"));

const assets = {};
for (const file of walk(publicDir)) {
  const relPath = relative(publicDir, file).split("/").join("/");
  const urlPath = "/" + relPath;
  assets[relPath.endsWith("index.html") ? indexKey(relPath) : urlPath] = encodeAsset(file);
}
assets["/app"] = { redirect: "/app/" };

const worker = `/**
 * Matters Lifeboat combined proxy + static UI.
 * Generated from local landing/app builds.
 */

const UPSTREAM = "https://server.matters.town/graphql";
const MATTERS_ORIGIN = "https://matters.town";

const ORIGIN_ALLOWLIST = [
  /^https:\\/\\/lifeboat\\.matters\\.(town|news)$/,
  /^https:\\/\\/([a-z0-9-]+\\.)?matters-lifeboat\\.pages\\.dev$/,
  /^https:\\/\\/([a-z0-9-]+\\.)?matters-lifeboat-app\\.pages\\.dev$/,
  /^http:\\/\\/localhost(:\\d+)?$/,
  /^http:\\/\\/127\\.0\\.0\\.1(:\\d+)?$/,
];

const ASSETS = ${JSON.stringify(assets)};

function allowOrigin(origin) {
  if (!origin) return null;
  for (const re of ORIGIN_ALLOWLIST) if (re.test(origin)) return origin;
  return null;
}

function corsHeaders(origin) {
  const allowed = allowOrigin(origin);
  const h = {
    "access-control-allow-methods": "POST, GET, OPTIONS",
    "access-control-allow-headers": "content-type, apollo-require-preflight, x-apollo-operation-name",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
  if (allowed) h["access-control-allow-origin"] = allowed;
  return h;
}

export default {
  async fetch(req) {
    const url = new URL(req.url);
    const origin = req.headers.get("origin");

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (req.method === "GET" && url.pathname === "/status") {
      return json({
        service: "matters-lifeboat-proxy",
        version: "${version}",
        upstream: UPSTREAM,
        landing: "embedded-static-assets",
        purpose: "Static Matters Lifeboat UI and CORS-rewriting GraphQL proxy for matters.town. Forwards JSON payload only. No cookies, no storage.",
        source: "https://github.com/thematters/matters-lifeboat",
        allowedOrigins: ORIGIN_ALLOWLIST.map((r) => r.source),
      }, 200, corsHeaders(origin));
    }

    if (req.method === "GET" && url.pathname === "/ai.txt") {
      return new Response([
        "# matters-lifeboat-proxy",
        "",
        "purpose: Static Matters Lifeboat UI and CORS-rewriting GraphQL proxy for matters.town",
        "landing: embedded-static-assets",
        "primary-flows: backup download, Pinata extra copy, Cloudflare static site",
        "optional: article address book",
        "upstream: https://server.matters.town/graphql",
        "usage: GET pages from /, POST JSON GraphQL body to /",
        "source: https://github.com/thematters/matters-lifeboat",
        "",
      ].join("\\n"), { status: 200, headers: { "content-type": "text/plain; charset=utf-8", ...corsHeaders(origin) } });
    }

    if (req.method === "GET" || req.method === "HEAD") {
      if ((url.pathname === "/app" || url.pathname === "/app/") && !url.searchParams.has("flow")) {
        return new Response(null, { status: 302, headers: { location: "/", ...corsHeaders(origin) } });
      }
      if (url.pathname === "/app" && url.searchParams.has("flow")) {
        return new Response(null, { status: 301, headers: { location: "/app/" + url.search, ...corsHeaders(origin) } });
      }
      return serveAsset(url.pathname, req.method, origin);
    }

    if (!allowOrigin(origin)) {
      return json({ error: "origin not allowed", origin }, 403, corsHeaders(origin));
    }
    if (req.method !== "POST") {
      return json({ error: "method not allowed" }, 405, corsHeaders(origin));
    }

    const body = await req.text();
    const upstreamRes = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "apollo-require-preflight": "true",
        "x-apollo-operation-name": extractOpName(body) ?? "Anon",
        origin: MATTERS_ORIGIN,
        referer: MATTERS_ORIGIN + "/",
        "user-agent": "matters-lifeboat-proxy/0.1",
      },
      body,
    });

    const upstreamBody = await upstreamRes.text();
    return new Response(upstreamBody, {
      status: upstreamRes.status,
      headers: {
        "content-type": upstreamRes.headers.get("content-type") ?? "application/json",
        ...corsHeaders(origin),
      },
    });
  },
};

function serveAsset(pathname, method, origin) {
  let key = pathname;
  if (ASSETS[key]?.redirect) {
    return new Response(null, { status: 301, headers: { location: ASSETS[key].redirect } });
  }
  let asset = ASSETS[key];
  if (!asset && pathname.startsWith("/app/")) asset = ASSETS["/app/"];
  if (!asset && pathname === "/") asset = ASSETS["/"];
  if (!asset) return new Response("Not found", { status: 404, headers: corsHeaders(origin) });

  const headers = {
    "content-type": asset.contentType,
    "cache-control": pathname.includes("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=300",
    "x-matters-lifeboat-proxy": "embedded",
    ...corsHeaders(origin),
  };
  if (method === "HEAD") return new Response(null, { status: 200, headers });
  const body = asset.type === "base64" ? base64ToBytes(asset.body) : asset.body;
  return new Response(body, { status: 200, headers });
}

function base64ToBytes(encoded) {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function extractOpName(rawBody) {
  try {
    const p = JSON.parse(rawBody);
    if (p.operationName) return p.operationName;
    if (p.query) {
      const m = p.query.match(/\\b(?:query|mutation)\\s+(\\w+)/);
      if (m) return m[1] ?? null;
    }
  } catch {
    /* ignore */
  }
  return null;
}
`;

writeFileSync(outFile, worker);
console.log(`embedded ${version} -> ${outFile}`);

function copyDir(source, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(source)) {
    const from = join(source, name);
    const to = join(dest, name);
    if (statSync(from).isDirectory()) copyDir(from, to);
    else copyFileSync(from, to);
  }
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) out.push(...walk(file));
    else out.push(file);
  }
  return out;
}

function encodeAsset(file) {
  const ext = extname(file);
  const contentType = typeFor(ext, basename(file));
  if (isText(ext)) {
    return { type: "text", contentType, body: readFileSync(file, "utf8") };
  }
  return { type: "base64", contentType, body: readFileSync(file).toString("base64") };
}

function indexKey(relPath) {
  const dir = relPath.slice(0, -"index.html".length);
  return dir ? `/${dir}` : "/";
}

function isText(ext) {
  return [".html", ".css", ".js", ".svg", ".json", ".txt", ".md"].includes(ext);
}

function typeFor(ext, name) {
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (name === "ai.txt") return "text/plain; charset=utf-8";
  return "application/octet-stream";
}
