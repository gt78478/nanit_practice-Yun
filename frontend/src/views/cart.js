import { state } from "../core/state.js";
import { t } from "../i18n/index.js";
import { clp } from "../utils/format.js";

export function cartDrawer() {
  return `
    <div class="drawer-backdrop ${state.cartOpen ? "open" : ""}" data-action="close-cart"></div>
    <aside class="cart-drawer ${state.cartOpen ? "open" : ""}" id="cart" aria-hidden="${state.cartOpen ? "false" : "true"}">
      <div class="drawer-head">
        <div>
          <p class="eyebrow">${t("cart")}</p>
          <h2>${t("cartTitle")}</h2>
        </div>
        <button class="icon" title="${t("close")}" data-action="close-cart">×</button>
      </div>
      <div class="drawer-body">
        <div class="cart-list">
          ${state.cart.items.map((item) => `
            <div class="line">
              <img src="${item.product.image_url}" alt="${item.product.name}" />
              <div>
                <strong>${item.product.name}</strong>
                <span>${item.quantity} x ${clp(item.unit_price_cents)}</span>
              </div>
              <button class="icon" title="${t("remove")}" data-action="remove-cart" data-id="${item.id}">×</button>
            </div>
          `).join("") || `<p class="muted">${t("emptyCart")}</p>`}
        </div>
        <div class="summary">
          <span>${t("subtotal")}</span>
          <strong>${clp(state.cart.subtotal_cents)}</strong>
          <span>${t("shipping")}</span>
          <strong>${state.cart.items.length ? clp(399000) : clp(0)}</strong>
        </div>
        ${checkout()}
      </div>
    </aside>
  `;
}

function checkout() {
  if (!state.user || !state.cart.items.length) return "";
  return `
    <section class="checkout">
      <p class="eyebrow">${t("checkout")}</p>
      <h2>${t("deliveryData")}</h2>
      <form class="checkout-form" data-form="checkout">
        <input name="full_name" placeholder="${t("fullName")}" required />
        <input name="rut" placeholder="RUT" required />
        <input name="phone" placeholder="${t("phone")}" />
        <input name="city" placeholder="${t("city")}" value="Santiago" required />
        <input name="commune" placeholder="${t("commune")}" required />
        <input name="address_line1" placeholder="${t("address")}" required />
        <input name="postal_code" placeholder="${t("postalCode")}" />
        <button class="primary">${t("createOrder")}</button>
      </form>
    </section>
  `;
}
