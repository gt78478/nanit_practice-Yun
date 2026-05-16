import { state } from "../core/state.js";
import { roleLabel, t } from "../i18n/index.js";
import { clp } from "../utils/format.js";
import { escapeAttr } from "../utils/html.js";

export function adminShell() {
  const dashboard = state.admin.dashboard || {};
  return `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <button class="brand admin-brand" data-action="go-shop">БьютиШоп <span>Чили</span></button>
        <button class="admin-nav active" data-action="admin-scroll" data-target="overview">${t("dashboard")}</button>
        <button class="admin-nav" data-action="admin-scroll" data-target="inventory">${t("inventory")}</button>
        <button class="admin-nav" data-action="admin-scroll" data-target="orders-admin">${t("orders")}</button>
        <button class="admin-nav" data-action="admin-scroll" data-target="customers">${t("customers")}</button>
        <button class="admin-nav" data-action="go-shop">${t("storefront")}</button>
      </aside>
      <main class="admin-main">
        <header class="admin-top">
          <div>
            <p class="eyebrow">${t("operations")}</p>
            <h1>${t("adminPanel")}</h1>
          </div>
          <div class="actions">
            <select class="lang-select" data-action="change-lang" aria-label="Language">
              <option value="en" ${state.lang === "en" ? "selected" : ""}>EN</option>
              <option value="pt" ${state.lang === "pt" ? "selected" : ""}>PT</option>
              <option value="ru" ${state.lang === "ru" ? "selected" : ""}>RU</option>
            </select>
            <span class="user">${state.user.email}</span>
            <button class="ghost" data-action="logout">${t("logout")}</button>
          </div>
        </header>

        <section class="admin-section" id="overview">
          <div class="admin-metrics">
            <div><span>${t("revenue")}</span><strong>${clp(dashboard.revenue_cents || 0)}</strong></div>
            <div><span>${t("orders")}</span><strong>${dashboard.orders || 0}</strong></div>
            <div><span>${t("active")}</span><strong>${dashboard.active_products || 0}</strong></div>
            <div><span>${t("lowStock")}</span><strong>${dashboard.low_stock || 0}</strong></div>
            <div><span>${t("customers")}</span><strong>${dashboard.users || 0}</strong></div>
            <div><span>${t("hidden")}</span><strong>${dashboard.hidden_products || 0}</strong></div>
          </div>
        </section>

        <section class="admin-section admin-two-col" id="inventory">
          <form class="admin-form" data-form="admin-product">
            <h2>${t("newProduct")}</h2>
            <input name="name" placeholder="${t("name")}" required />
            <input name="category" placeholder="${t("category")}" required />
            <input name="brand" placeholder="${t("brand")}" required />
            <input name="price" type="number" min="1" placeholder="${t("price")}" required />
            <input name="amount" type="number" min="0" placeholder="${t("stockInput")}" value="10" required />
            <input name="image_url" placeholder="${t("imageUrl")}" />
            <textarea name="description" placeholder="${t("description")}"></textarea>
            <button class="primary">${t("addProduct")}</button>
          </form>
          <div class="admin-card">
            <div class="admin-card-head">
              <div>
                <p class="eyebrow">${t("inventory")}</p>
                <h2>${t("productManagement")}</h2>
              </div>
            </div>
            ${adminProductsTable()}
          </div>
        </section>

        <section class="admin-section" id="orders-admin">
          <div class="admin-card">
            <div class="admin-card-head">
              <div>
                <p class="eyebrow">${t("recentOrders")}</p>
                <h2>${t("orders")}</h2>
              </div>
            </div>
            ${adminOrdersTable()}
          </div>
        </section>

        <section class="admin-section" id="customers">
          <div class="admin-card">
            <div class="admin-card-head">
              <div>
                <p class="eyebrow">${t("customers")}</p>
                <h2>${t("users")}</h2>
              </div>
            </div>
            ${adminUsersTable()}
          </div>
        </section>
      </main>
    </div>
  `;
}

function adminProductsTable() {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${t("name")}</th>
            <th>${t("category")}</th>
            <th>${t("brand")}</th>
            <th>${t("price")}</th>
            <th>${t("stockInput")}</th>
            <th>${t("imageUrl")}</th>
            <th>${t("description")}</th>
            <th>${t("status")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${state.admin.products.map((product) => `
            <tr class="${product.is_active ? "" : "muted-row"}">
              <td><input class="table-input" name="name" form="product-${product.id}" value="${escapeAttr(product.name)}" required /></td>
              <td><input class="table-input" name="category" form="product-${product.id}" value="${escapeAttr(product.category?.name || "")}" required /></td>
              <td><input class="table-input" name="brand" form="product-${product.id}" value="${escapeAttr(product.brand?.name || "")}" required /></td>
              <td><input class="table-input compact" name="price" form="product-${product.id}" type="number" min="1" value="${Math.round(product.price_cents / 100)}" required /></td>
              <td><input class="table-input compact" name="amount" form="product-${product.id}" type="number" min="0" value="${product.amount}" required /></td>
              <td><input class="table-input wide" name="image_url" form="product-${product.id}" value="${escapeAttr(product.image_url || "")}" /></td>
              <td><input class="table-input wide" name="description" form="product-${product.id}" value="${escapeAttr(product.description || "")}" /></td>
              <td>
                <select class="status-select" name="is_active" form="product-${product.id}">
                  <option value="true" ${product.is_active ? "selected" : ""}>${t("active")}</option>
                  <option value="false" ${!product.is_active ? "selected" : ""}>${t("hidden")}</option>
                </select>
              </td>
              <td class="row-actions">
                <form id="product-${product.id}" data-form="admin-product-update" data-id="${product.id}"></form>
                <button class="secondary small" type="submit" form="product-${product.id}">${t("save")}</button>
                <button class="danger small" data-action="delete-product" data-id="${product.id}">${t("delete")}</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function adminOrdersTable() {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${t("order")}</th>
            <th>${t("customer")}</th>
            <th>${t("items")}</th>
            <th>${t("total")}</th>
            <th>${t("status")}</th>
          </tr>
        </thead>
        <tbody>
          ${state.admin.orders.map((order) => `
            <tr>
              <td><strong>#${order.id}</strong></td>
              <td>#${order.user_id}</td>
              <td>${order.items.map((item) => `${item.quantity}x ${item.product_name_snapshot}`).join(", ")}</td>
              <td>${clp(order.total_cents)}</td>
              <td>
                <select class="status-select" data-action="order-status" data-id="${order.id}">
                  ${state.admin.statuses.map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
                </select>
              </td>
            </tr>
          `).join("") || `<tr><td colspan="5">${t("noOrders")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function adminUsersTable() {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>${t("email")}</th>
            <th>${t("role")}</th>
            <th>${t("status")}</th>
          </tr>
        </thead>
        <tbody>
          ${state.admin.users.map((user) => `
            <tr>
              <td>${user.id}</td>
              <td><strong>${user.email}</strong></td>
              <td>${roleLabel(user.role)}</td>
              <td><span class="status ${user.is_active ? "ok" : "off"}">${user.is_active ? t("active") : t("hidden")}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
