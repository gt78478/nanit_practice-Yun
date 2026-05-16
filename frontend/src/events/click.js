import { api } from "../api/client.js";
import { loadAdminData, loadBase, loadCart } from "../api/loaders.js";
import { logout, setTokens } from "../api/session.js";
import { navigate } from "../core/router.js";
import { render } from "../core/render.js";
import { state } from "../core/state.js";
import { t } from "../i18n/index.js";

export function registerClickHandler() {
  document.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    try {
      if (action === "logout") logout();
      if (action === "go-auth") {
        navigate("/auth");
        render();
      }
      if (action === "go-admin") {
        if (state.user?.role !== "admin") return;
        navigate("/admin");
        await loadAdminData();
        render();
      }
      if (action === "go-shop") {
        navigate("/");
        render();
      }
      if (action === "admin-scroll") {
        document.querySelector(`#${target.dataset.target}`)?.scrollIntoView({ behavior: "smooth" });
      }
      if (action === "open-cart") {
        state.cartOpen = true;
        render();
      }
      if (action === "close-cart") {
        state.cartOpen = false;
        render();
      }
      if (action === "demo-login") {
        setTokens(await api("/auth/login", { method: "POST", body: JSON.stringify({ email: "demo@beautyshop.cl", password: "demo1234" }) }));
        await loadBase();
      }
      if (action === "add-cart") {
        if (!state.user) {
          navigate("/auth");
          return render();
        }
        await api("/cart/items", { method: "POST", body: JSON.stringify({ product_id: Number(target.dataset.id), quantity: 1 }) });
        await loadCart();
        state.cartOpen = true;
        render();
      }
      if (action === "remove-cart") {
        await api(`/cart/items/${target.dataset.id}`, { method: "DELETE" });
        await loadCart();
        state.cartOpen = true;
        render();
      }
      if (action === "pay") {
        const payment = await api("/payments/create", { method: "POST", body: JSON.stringify({ order_id: Number(target.dataset.id) }) });
        alert(`${t("demoCheckout")} ${payment.checkout_url}`);
      }
      if (action === "delete-product") {
        if (!confirm(t("confirmDelete"))) return;
        await api(`/admin/products/${target.dataset.id}`, { method: "DELETE" });
        await Promise.all([loadBase(), loadAdminData()]);
        render();
      }
    } catch (error) {
      alert(error.message);
    }
  });
}
