import { StoreLayout } from "../common/StoreLayout.js";

export function StorefrontPage({
  cart,
  cartOpen,
  changeLang,
  checkout,
  demoLogin,
  lang,
  logout,
  removeCart,
  router,
  setCartOpen,
  t,
  user,
}) {
  return (
    <StoreLayout cart={cart} cartOpen={cartOpen} changeLang={changeLang} checkout={checkout} lang={lang} logout={logout} removeCart={removeCart} router={router} setCartOpen={setCartOpen} t={t} user={user}>
      <main>
        <section className="hero">
          <div className="hero-media" role="img" aria-label="Cosmetica premium" />
          <div className="hero-copy">
            <p className="eyebrow">{t("heroEyebrow")}</p>
            <h1>БьютиШоп Чили</h1>
            <p>{t("heroCopy")}</p>
            <div className="hero-actions">
              <button className="primary" onClick={() => router.push("/catalog")}>{t("shopNow")}</button>
              <button className="secondary" onClick={demoLogin}>{t("demoLogin")}</button>
            </div>
          </div>
        </section>
        <section className="strip">
          <span>{t("benefitDelivery")}</span>
          <span>{t("benefitCurrency")}</span>
          <span>{t("benefitCare")}</span>
          <span>{t("benefitCheckout")}</span>
        </section>
      </main>
    </StoreLayout>
  );
}
