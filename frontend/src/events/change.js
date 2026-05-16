import { api } from "../api/client.js";
import { loadAdminData } from "../api/loaders.js";
import { render } from "../core/render.js";
import { state } from "../core/state.js";

export function registerChangeHandler() {
  document.addEventListener("change", async (event) => {
    const target = event.target.closest("[data-action='change-lang']");
    const statusTarget = event.target.closest("[data-action='order-status']");
    try {
      if (target) {
        state.lang = target.value;
        localStorage.setItem("lang", state.lang);
        render();
      }
      if (statusTarget) {
        await api(`/admin/orders/${statusTarget.dataset.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: statusTarget.value }),
        });
        await loadAdminData();
        render();
      }
    } catch (error) {
      alert(error.message);
    }
  });
}
