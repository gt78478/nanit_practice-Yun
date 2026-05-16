import { clp } from "../../lib/format.js";

export function CartDrawer({ cart, cartOpen, setCartOpen, t, removeCart, checkout, user }) {
  return (
    <>
      <div className={`drawer-backdrop ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`} id="cart" aria-hidden={cartOpen ? "false" : "true"}>
        <div className="drawer-head">
          <div><p className="eyebrow">{t("cart")}</p><h2>{t("cartTitle")}</h2></div>
          <button className="icon" title={t("close")} onClick={() => setCartOpen(false)}>×</button>
        </div>
        <div className="drawer-body">
          <div className="cart-list">
            {cart.items.length ? cart.items.map((item) => (
              <div className="line" key={item.id}>
                <img src={item.product.image_url} alt={item.product.name} />
                <div><strong>{item.product.name}</strong><span>{item.quantity} x {clp(item.unit_price_cents)}</span></div>
                <button className="icon" title={t("remove")} onClick={() => removeCart(item.id)}>×</button>
              </div>
            )) : <p className="muted">{t("emptyCart")}</p>}
          </div>
          <div className="summary">
            <span>{t("subtotal")}</span><strong>{clp(cart.subtotal_cents)}</strong>
            <span>{t("shipping")}</span><strong>{cart.items.length ? clp(399000) : clp(0)}</strong>
          </div>
          {user && cart.items.length > 0 && (
            <section className="checkout">
              <p className="eyebrow">{t("checkout")}</p>
              <h2>{t("deliveryData")}</h2>
              <form className="checkout-form" onSubmit={checkout}>
                <input name="full_name" placeholder={t("fullName")} required />
                <input name="rut" placeholder="RUT" required />
                <input name="phone" placeholder={t("phone")} />
                <input name="city" placeholder={t("city")} defaultValue="Santiago" required />
                <input name="commune" placeholder={t("commune")} required />
                <input name="address_line1" placeholder={t("address")} required />
                <input name="postal_code" placeholder={t("postalCode")} />
                <button className="primary">{t("createOrder")}</button>
              </form>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}
