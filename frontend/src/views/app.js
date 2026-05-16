import { state } from "../core/state.js";
import { t } from "../i18n/index.js";
import { clp } from "../utils/format.js";
import { adminShell } from "./admin.js";
import { authShell } from "./auth.js";
import { cartDrawer } from "./cart.js";
import { catalog } from "./catalog.js";
import { orders } from "./orders.js";

export function appShell() {
  if (state.route === "auth") {
    return authShell();
  }
  if (state.route === "admin" && state.user?.role === "admin") {
    return adminShell();
  }
  return `
    <div class="announce">${t("announce")} ${clp(4500000)} ${state.lang === "ru" ? "по Чили" : state.lang === "pt" ? "no Chile" : "in Chile"}</div>
    <header class="topbar">
      <nav>
        <a href="#catalog">${t("catalog")}</a>
        <a href="#orders">${t("orders")}</a>
        ${state.user?.role === "admin" ? `<button class="nav-button" data-action="go-admin">${t("adminPanel")}</button>` : ""}
      </nav>
      <button class="brand" data-action="home">БьютиШоп <span>Чили</span></button>
      <div class="actions">
        <select class="lang-select" data-action="change-lang" aria-label="Language">
          <option value="en" ${state.lang === "en" ? "selected" : ""}>EN</option>
          <option value="pt" ${state.lang === "pt" ? "selected" : ""}>PT</option>
          <option value="ru" ${state.lang === "ru" ? "selected" : ""}>RU</option>
        </select>
        ${state.user ? `<span class="user">${state.user.email}</span>` : ""}
        ${state.user ? `<button class="ghost" data-action="logout">${t("logout")}</button>` : `<button class="ghost" data-action="go-auth">${t("login")}</button>`}
        <button class="cart-pill" data-action="open-cart">${t("bag")} ${state.cart.items.length}</button>
      </div>
    </header>
    <main>
      <section class="hero">
        <div class="hero-media" role="img" aria-label="Cosmetica premium"></div>
        <div class="hero-copy">
          <p class="eyebrow">${t("heroEyebrow")}</p>
          <h1>БьютиШоп Чили</h1>
          <p>${t("heroCopy")}</p>
          <div class="hero-actions">
            <a class="primary" href="#catalog">${t("shopNow")}</a>
            <button class="secondary" data-action="demo-login">${t("demoLogin")}</button>
          </div>
        </div>
      </section>
      <section class="strip">
        <span>${t("benefitDelivery")}</span>
        <span>${t("benefitCurrency")}</span>
        <span>${t("benefitCare")}</span>
        <span>${t("benefitCheckout")}</span>
      </section>
      ${catalog()}
      ${orders()}
    </main>
    ${cartDrawer()}
  `;
}
