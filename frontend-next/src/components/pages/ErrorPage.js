import { API } from "../../api/client.js";

export function ErrorPage({ error, t }) {
  return (
    <main className="error">
      <h1>{t("apiUnavailable")}</h1>
      <p>{error.message}</p>
      <p>
        {t("startBackend")} {API}
      </p>
    </main>
  );
}
