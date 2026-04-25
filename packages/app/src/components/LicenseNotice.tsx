/**
 * Shown next to the username input on backup forms.
 * Reminds users that Matters articles are CC-licensed and that this backup
 * is for personal archival — re-publishing/derivative works/AI training have
 * obligations attached.
 */
export function LicenseNotice() {
  return (
    <div className="callout license-notice">
      <div className="license-title">
        📜 關於著作權
      </div>
      <div className="license-body">
        Matters 上的文章預設為{" "}
        <a
          href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hant"
          target="_blank"
          rel="noreferrer"
        >
          CC BY-NC-ND 4.0
        </a>
        （姓名標示-非商業-禁衍生），個別作者也可能採用 CC0 或 All Rights Reserved。
        每篇的實際授權會記在備份檔的 <code>frontmatter.license</code> 與{" "}
        <code>MANIFEST.json</code>。
        <ul style={{ margin: "8px 0 0 0", paddingLeft: 18 }}>
          <li>
            <strong>個人收藏、本機閱讀</strong>：完全沒問題，這就是備份的本意。
          </li>
          <li>
            <strong>對外重新發布原文</strong>：請保留作者署名與來源連結，且不得商用。
          </li>
          <li>
            <strong>改寫、續寫、翻譯、餵 AI 訓練</strong>：CC BY-NC-ND 與 arr 授權的文章
            <strong>禁止</strong>；CC0 不受限。
          </li>
        </ul>
      </div>
    </div>
  );
}
