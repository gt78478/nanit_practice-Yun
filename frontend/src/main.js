import "./styles.css";

import { loadBase } from "./api/loaders.js";
import { API } from "./core/config.js";
import { registerEvents } from "./events/index.js";
import { t } from "./i18n/index.js";

registerEvents();

loadBase().catch((error) => {
  document.querySelector("#app").innerHTML = `<main class="error"><h1>${t("apiUnavailable")}</h1><p>${error.message}</p><p>${t("startBackend")} ${API}</p></main>`;
});
