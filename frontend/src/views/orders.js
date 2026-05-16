import { state } from "../core/state.js";
import { t } from "../i18n/index.js";
import { clp } from "../utils/format.js";

export function orders() {
  if (!state.user) return "";
  return `
    <section class="section" id="orders">
      <p class="eyebrow">${t("account")}</p>
      <h2>${t("orderHistory")}</h2>
      <div class="order-grid">
        ${state.orders.map((order) => `
          <article class="order">
            <div class="meta-row"><span>#${order.id}</span><span>${order.status}</span></div>
            <strong>${clp(order.total_cents)}</strong>
            <p>${order.items.map((item) => `${item.quantity}x ${item.product_name_snapshot}`).join(", ")}</p>
            <button class="secondary small" data-action="pay" data-id="${order.id}">${t("pay")}</button>
          </article>
        `).join("") || `<p class="muted">${t("noOrders")}</p>`}
      </div>
    </section>
  `;
}
