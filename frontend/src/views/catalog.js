import { state } from "../core/state.js";
import { t } from "../i18n/index.js";
import { clp } from "../utils/format.js";

export function catalog() {
  return `
    <section class="section" id="catalog">
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("catalog")}</p>
          <h2>${t("productTitle")}</h2>
        </div>
        <form class="filters" data-form="filters">
          <input name="q" placeholder="${t("searchPlaceholder")}" value="${state.filters.q}" />
          <select name="category">
            <option value="">${t("category")}</option>
            ${state.meta.categories.map((item) => `<option ${item === state.filters.category ? "selected" : ""}>${item}</option>`).join("")}
          </select>
          <select name="brand">
            <option value="">${t("brand")}</option>
            ${state.meta.brands.map((item) => `<option ${item === state.filters.brand ? "selected" : ""}>${item}</option>`).join("")}
          </select>
          <button class="icon" title="${t("searchPlaceholder")}">⌕</button>
        </form>
      </div>
      <div class="product-grid">
        ${state.products.map(productCard).join("") || `<p class="muted">${t("noProducts")}</p>`}
      </div>
    </section>
  `;
}

function productCard(product) {
  return `
    <article class="product">
      <div class="product-media">
        <img src="${product.image_url}" alt="${product.name}" />
      </div>
      <div class="product-body">
        <div class="meta-row">
          <span>${product.category?.name || "Beauty"}</span>
          <span>${product.brand?.name || ""}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description || ""}</p>
        <div class="buy-row">
          <strong>${clp(product.price_cents)}</strong>
          <div class="card-actions">
            <button class="primary small" data-action="add-cart" data-id="${product.id}">${t("add")}</button>
          </div>
        </div>
      </div>
    </article>
  `;
}
