import { useEffect, useState } from "react";
import { FlowA } from "./flows/FlowA";
import { FlowB } from "./flows/FlowB";
import { FlowC } from "./flows/FlowC";
import { FlowD } from "./flows/FlowD";
import type { ZipResult } from "@matters/lifeboat-core";
import type { MattersUser } from "@matters/lifeboat-core";

export type Flow = "pick" | "a" | "b" | "c" | "d";

export interface SharedSession {
  user?: MattersUser;
  zip?: ZipResult;
}

export function App() {
  const [flow, setFlow] = useState<Flow>(() => pickFromUrl());
  const [session, setSession] = useState<SharedSession>({});

  useEffect(() => {
    if (flow === "pick") {
      window.location.replace("/");
      return;
    }
    const u = new URL(window.location.href);
    u.searchParams.set("flow", flow);
    window.history.replaceState({}, "", u.toString());
  }, [flow]);

  if (flow === "pick") return null;

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <div className="app-title">
            <img
              src="/app/matters-wordmark.svg"
              alt="Matters"
              className="brand-wordmark"
            />
            <span className="brand-divider" aria-hidden="true">·</span>
            <span className="lifeboat-mark" aria-hidden="true">🛟</span>
            <span className="lifeboat-name">救生艇</span>
          </div>
          <div className="app-subtitle">
            你的文字，你自己收著 · Your writing, in your own hands
          </div>
        </div>
        <a
          href="https://github.com/thematters/matters-lifeboat"
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost"
        >
          Source ↗
        </a>
      </header>

      {flow === "d" && <FlowD onBack={() => setFlow("pick")} />}
      {flow === "a" && (
        <FlowA
          session={session}
          setSession={setSession}
          onDone={() => setFlow("pick")}
          onGotoB={() => setFlow("b")}
          onGotoC={() => setFlow("c")}
          onBack={() => setFlow("pick")}
        />
      )}
      {flow === "b" && (
        <FlowB
          session={session}
          setSession={setSession}
          onBack={() => setFlow("pick")}
        />
      )}
      {flow === "c" && (
        <FlowC
          session={session}
          setSession={setSession}
          onBack={() => setFlow("pick")}
        />
      )}

      <footer className="app-footer">
        Matters 救生艇 · MIT ·
        <a href="https://github.com/thematters/matters-lifeboat" target="_blank" rel="noreferrer">
          &nbsp;source
        </a>
        &nbsp;·&nbsp;Made by the Matters community
      </footer>
    </div>
  );
}

function pickFromUrl(): Flow {
  const p = new URL(window.location.href).searchParams.get("flow");
  if (p === "a" || p === "b" || p === "c" || p === "d") return p;
  return "pick";
}
