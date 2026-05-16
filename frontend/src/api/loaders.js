import { state } from "../core/state.js";
import { render } from "../core/render.js";
import { clean } from "../utils/html.js";
import { api } from "./client.js";
import { logout } from "./session.js";

export async function loadBase() {
  const [meta, products] = await Promise.all([
    api("/catalog/meta"),
    api(`/products?${new URLSearchParams(clean(state.filters))}`),
  ]);
  state.meta = meta;
  state.products = products.items;
  if (state.token) {
    await loadUser().catch(() => logout());
    await Promise.allSettled([loadCart(), loadOrders()]);
    if (state.route === "admin" && state.user?.role === "admin") {
      await loadAdminData();
    }
  }
  render();
}

export async function loadUser() {
  state.user = await api("/users/me");
}

export async function loadCart() {
  state.cart = await api("/cart");
}

export async function loadOrders() {
  state.orders = await api("/orders");
}

export async function loadAdminData() {
  if (state.user?.role !== "admin") return;
  const [dashboard, products, users, orders, statuses] = await Promise.all([
    api("/admin/dashboard"),
    api("/admin/products"),
    api("/admin/users"),
    api("/admin/orders"),
    api("/admin/order-statuses"),
  ]);
  state.admin = {
    dashboard,
    products,
    users,
    orders,
    statuses: statuses.items,
  };
}
