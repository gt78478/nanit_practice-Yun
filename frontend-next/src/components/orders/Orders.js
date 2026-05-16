import { clp } from "../../lib/format.js";

export function Orders({ user, orders, t, pay }) {
  if (!user) return null;

  return (
    <section className="section" id="orders">
      <p className="eyebrow">{t("account")}</p>
      <h2>{t("orderHistory")}</h2>
      <div className="order-grid">
        {orders.length ? orders.map((order) => (
          <article className="order" key={order.id}>
            <div className="meta-row"><span>#{order.id}</span><span>{order.status}</span></div>
            <strong>{clp(order.total_cents)}</strong>
            <p>{order.items.map((item) => `${item.quantity}x ${item.product_name_snapshot}`).join(", ")}</p>
            <button className="secondary small" onClick={() => pay(order.id)}>{t("pay")}</button>
          </article>
        )) : <p className="muted">{t("noOrders")}</p>}
      </div>
    </section>
  );
}
