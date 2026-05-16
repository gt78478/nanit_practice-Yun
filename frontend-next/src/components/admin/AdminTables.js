import { clp, roleLabel } from "../../lib/format.js";

export function AdminProductsTable({ products, t, updateAdminProduct, deleteProduct }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>{t("name")}</th><th>{t("category")}</th><th>{t("brand")}</th><th>{t("price")}</th><th>{t("stockInput")}</th><th>{t("imageUrl")}</th><th>{t("description")}</th><th>{t("status")}</th><th /></tr></thead>
        <tbody>
          {products.map((product) => (
            <tr className={product.is_active ? "" : "muted-row"} key={product.id}>
              <td colSpan="9">
                <form className="admin-row-form" onSubmit={(event) => updateAdminProduct(event, product.id)}>
                  <input className="table-input" name="name" defaultValue={product.name} required />
                  <input className="table-input" name="category" defaultValue={product.category?.name || ""} required />
                  <input className="table-input" name="brand" defaultValue={product.brand?.name || ""} required />
                  <input className="table-input compact" name="price" type="number" min="1" defaultValue={Math.round(product.price_cents / 100)} required />
                  <input className="table-input compact" name="amount" type="number" min="0" defaultValue={product.amount} required />
                  <input className="table-input wide" name="image_url" defaultValue={product.image_url || ""} />
                  <input className="table-input wide" name="description" defaultValue={product.description || ""} />
                  <select className="status-select" name="is_active" defaultValue={String(product.is_active)}>
                    <option value="true">{t("active")}</option>
                    <option value="false">{t("hidden")}</option>
                  </select>
                  <span className="row-actions">
                    <button className="secondary small">{t("save")}</button>
                    <button className="danger small" type="button" onClick={() => deleteProduct(product.id)}>{t("delete")}</button>
                  </span>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminOrdersTable({ orders, statuses, t, updateOrderStatus }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>{t("order")}</th><th>{t("customer")}</th><th>{t("items")}</th><th>{t("total")}</th><th>{t("status")}</th></tr></thead>
        <tbody>
          {orders.length ? orders.map((order) => (
            <tr key={order.id}>
              <td><strong>#{order.id}</strong></td>
              <td>#{order.user_id}</td>
              <td>{order.items.map((item) => `${item.quantity}x ${item.product_name_snapshot}`).join(", ")}</td>
              <td>{clp(order.total_cents)}</td>
              <td>
                <select className="status-select" defaultValue={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)}>
                  {statuses.map((status) => <option value={status} key={status}>{status}</option>)}
                </select>
              </td>
            </tr>
          )) : <tr><td colSpan="5">{t("noOrders")}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function AdminUsersTable({ users, t, lang }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>{t("email")}</th><th>{t("role")}</th><th>{t("status")}</th></tr></thead>
        <tbody>
          {users.map((adminUser) => (
            <tr key={adminUser.id}>
              <td>{adminUser.id}</td>
              <td><strong>{adminUser.email}</strong></td>
              <td>{roleLabel(adminUser.role, lang)}</td>
              <td><span className={`status ${adminUser.is_active ? "ok" : "off"}`}>{adminUser.is_active ? t("active") : t("hidden")}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
