import { CartDrawer } from "../cart/CartDrawer.js";
import { Catalog } from "../catalog/Catalog.js";
import { LangSelect } from "../common/LangSelect.js";
import { Orders } from "../orders/Orders.js";
import { clp } from "../../lib/format.js";

export function StorefrontPage({
  addCart,
  cart,
  cartOpen,
  changeLang,
  checkout,
  demoLogin,
  filters,
  lang,
  logout,
  meta,
  orders,
  pay,
  products,
  removeCart,
  router,
  setCartOpen,
  setFilters,
  t,
  user,
}) {
  return (
    <>
      <div className="announce">
        {t("announce")} {clp(4500000)} {lang === "ru" ? "по Чили" : lang === "pt" ? "no Chile" : "in Chile"}
      </div>
      <header className="topbar">
        <nav>
          <a href="#catalog">{t("catalog")}</a>
          <a href="#orders">{t("orders")}</a>
          {user?.role === "admin" && <button className="nav-button" onClick={() => router.push("/admin")}>{t("adminPanel")}</button>}
        </nav>
        <button className="brand" onClick={() => router.push("/")}>
          БьютиШоп <span>Чили</span>
        </button>
        <div className="actions">
          <LangSelect lang={lang} changeLang={changeLang} />
          {user && <span className="user">{user.email}</span>}
          {user ? <button className="ghost" onClick={logout}>{t("logout")}</button> : <button className="ghost" onClick={() => router.push("/auth")}>{t("login")}</button>}
          <button className="cart-pill" onClick={() => setCartOpen(true)}>{t("bag")} {cart.items.length}</button>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="hero-media" role="img" aria-label="Cosmetica premium" />
          <div className="hero-copy">
            <p className="eyebrow">{t("heroEyebrow")}</p>
            <h1>БьютиШоп Чили</h1>
            <p>{t("heroCopy")}</p>
            <div className="hero-actions">
              <a className="primary" href="#catalog">{t("shopNow")}</a>
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
        <Catalog products={products} meta={meta} filters={filters} setFilters={setFilters} t={t} addCart={addCart} />
        <Orders user={user} orders={orders} t={t} pay={pay} />
      </main>
      <CartDrawer cart={cart} cartOpen={cartOpen} setCartOpen={setCartOpen} t={t} removeCart={removeCart} checkout={checkout} user={user} />
    </>
  );
}
