import { t } from "../i18n/index.js";

export function authShell() {
  return `
    <main class="auth-page">
      <section class="auth-hero">
        <button class="brand" data-action="go-shop">БьютиШоп <span>Чили</span></button>
        <div>
          <p class="eyebrow">${t("account")}</p>
          <h1>${t("authTitle")}</h1>
          <p>${t("authSubtitle")}</p>
        </div>
        <button class="ghost" data-action="go-shop">${t("backToShop")}</button>
      </section>
      <section class="auth-panel" id="auth">
      <form class="panel" data-form="login">
        <h2>${t("authTitle")}</h2>
        <input name="email" type="email" placeholder="${t("email")}" value="demo@beautyshop.cl" required />
        <input name="password" type="password" placeholder="${t("password")}" value="demo1234" required />
        <button class="primary">${t("login")}</button>
      </form>
      <form class="panel" data-form="register">
        <h2>${t("createAccount")}</h2>
        <input name="email" type="email" placeholder="${t("email")}" required />
        <input name="password" type="password" placeholder="${t("minPassword")}" minlength="6" required />
        <input name="password_confirm" type="password" placeholder="${t("password")}" minlength="6" required />
        <button class="secondary">${t("register")}</button>
      </form>
      </section>
    </main>
  `;
}
