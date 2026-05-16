export function AuthPage({ handleAuthSubmit, router, t }) {
  return (
    <main className="auth-page">
      <section className="auth-hero">
        <button className="brand" onClick={() => router.push("/")}>
          БьютиШоп <span>Чили</span>
        </button>
        <div>
          <p className="eyebrow">{t("account")}</p>
          <h1>{t("authTitle")}</h1>
          <p>{t("authSubtitle")}</p>
        </div>
        <button className="ghost" onClick={() => router.push("/")}>
          {t("backToShop")}
        </button>
      </section>
      <section className="auth-panel" id="auth">
        <form className="panel" onSubmit={(event) => handleAuthSubmit(event, "login")}>
          <h2>{t("authTitle")}</h2>
          <input name="email" type="email" placeholder={t("email")} defaultValue="demo@beautyshop.cl" required />
          <input name="password" type="password" placeholder={t("password")} defaultValue="demo1234" required />
          <button className="primary">{t("login")}</button>
        </form>
        <form className="panel" onSubmit={(event) => handleAuthSubmit(event, "register")}>
          <h2>{t("createAccount")}</h2>
          <input name="email" type="email" placeholder={t("email")} required />
          <input name="password" type="password" placeholder={t("minPassword")} minLength="6" required />
          <input name="password_confirm" type="password" placeholder={t("password")} minLength="6" required />
          <button className="secondary">{t("register")}</button>
        </form>
      </section>
    </main>
  );
}
