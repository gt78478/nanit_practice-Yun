import { api } from "../api/client.js";
import { loadAdminData, loadBase, loadCart, loadOrders } from "../api/loaders.js";
import { setTokens } from "../api/session.js";
import { navigate } from "../core/router.js";
import { render } from "../core/render.js";
import { state } from "../core/state.js";
import { t } from "../i18n/index.js";

export function registerSubmitHandler() {
  document.addEventListener("submit", async (event) => {
    const form = event.target.closest("form");
    if (!form) return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      if (form.dataset.form === "login" || form.dataset.form === "register") {
        if (form.dataset.form === "register") {
          if (data.password !== data.password_confirm) {
            throw new Error(state.lang === "ru" ? "Пароли не совпадают" : state.lang === "pt" ? "As senhas nao coincidem" : "Passwords do not match");
          }
          delete data.password_confirm;
        }
        setTokens(await api(`/auth/${form.dataset.form}`, { method: "POST", body: JSON.stringify(data) }));
        await loadBase();
        if (state.user?.role === "admin") {
          await loadAdminData();
          navigate("/admin");
          render();
        } else {
          navigate("/");
          render();
        }
      }
      if (form.dataset.form === "filters") {
        state.filters = data;
        await loadBase();
      }
      if (form.dataset.form === "checkout") {
        const order = await api("/orders", {
          method: "POST",
          body: JSON.stringify({
            rut: data.rut,
            address: {
              full_name: data.full_name,
              phone: data.phone,
              city: data.city,
              commune: data.commune,
              address_line1: data.address_line1,
              postal_code: data.postal_code,
            },
          }),
        });
        const payment = await api("/payments/create", {
          method: "POST",
          body: JSON.stringify({ order_id: order.id, provider: "mercado_pago" }),
        });
        alert(`${t("orderCreated")} ${payment.checkout_url}`);
        await Promise.all([loadCart(), loadOrders()]);
        render();
      }
      if (form.dataset.form === "admin-product") {
        await api("/admin/products", {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            category: data.category,
            brand: data.brand,
            description: data.description,
            amount: Number(data.amount || 0),
            price_cents: Number(data.price) * 100,
            image_url: data.image_url || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
          }),
        });
        form.reset();
        await Promise.all([loadBase(), loadAdminData()]);
        render();
      }
      if (form.dataset.form === "admin-product-update") {
        await api(`/admin/products/${form.dataset.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: data.name,
            category: data.category,
            brand: data.brand,
            description: data.description,
            amount: Number(data.amount || 0),
            price_cents: Number(data.price) * 100,
            image_url: data.image_url,
            is_active: data.is_active === "true",
          }),
        });
        await Promise.all([loadBase(), loadAdminData()]);
        render();
      }
    } catch (error) {
      alert(error.message);
    }
  });
}
