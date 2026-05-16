import { loadAdminData } from "../api/loaders.js";
import { render } from "../core/render.js";
import { routeFromPath } from "../core/router.js";
import { state } from "../core/state.js";

export function registerNavigationHandler() {
  window.addEventListener("popstate", async () => {
    state.route = routeFromPath();
    if (state.route === "admin" && state.user?.role === "admin") {
      await loadAdminData();
    }
    render();
  });
}
