import { CartDrawer } from "../cart/CartDrawer.js";
import { LangSelect } from "./LangSelect.js";
import { clp } from "../../lib/format.js";

export function StoreLayout({
  cart,
  cartOpen,
  changeLang,
  checkout,
  children,
  lang,
  logout,
  removeCart,
  router,
  setCartOpen,
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
          <button className="nav-button" onClick={() => router.push("/catalog")}>{t("catalog")}</button>
          <button className="nav-button" onClick={() => router.push("/orders")}>{t("orders")}</button>
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
      {children}
      <CartDrawer cart={cart} cartOpen={cartOpen} setCartOpen={setCartOpen} t={t} removeCart={removeCart} checkout={checkout} user={user} />
    </>
  );
}
