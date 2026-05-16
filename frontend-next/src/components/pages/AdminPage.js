import { useState } from "react";
import { AdminOrdersTable, AdminProductsTable, AdminUsersTable } from "../admin/AdminTables.js";
import { LangSelect } from "../common/LangSelect.js";
import { clp } from "../../lib/format.js";

const adminTabs = [
  { id: "overview", label: "Общие данные" },
  { id: "inventory", label: "Склад" },
  { id: "orders", label: "Заказы" },
  { id: "customers", label: "Клиенты" },
];

export function AdminPage({
  admin,
  changeLang,
  createAdminProduct,
  deleteProduct,
  lang,
  logout,
  router,
  t,
  updateAdminProduct,
  updateOrderStatus,
  user,
}) {
  const dashboard = admin.dashboard || {};
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <button className="brand admin-brand" onClick={() => router.push("/")}>
          БьютиШоп <span>Чили</span>
        </button>
        <div className="admin-tabs" role="tablist" aria-label={t("adminPanel")}>
          {adminTabs.map((tab) => (
            <button
              className={`admin-nav ${activeTab === tab.id ? "active" : ""}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="admin-nav admin-store-link" onClick={() => router.push("/")}>
          В магазин -&gt;
        </button>
      </aside>
      <main className="admin-main">
        <header className="admin-top">
          <div>
            <p className="eyebrow">{t("operations")}</p>
            <h1>{t("adminPanel")}</h1>
          </div>
          <div className="actions">
            <LangSelect lang={lang} changeLang={changeLang} />
            <span className="user">{user.email}</span>
            <button className="ghost" onClick={logout}>
              {t("logout")}
            </button>
          </div>
        </header>
        {activeTab === "overview" && <section className="admin-section" id="overview" role="tabpanel">
          <div className="admin-metrics">
            <div><span>{t("revenue")}</span><strong>{clp(dashboard.revenue_cents || 0)}</strong></div>
            <div><span>{t("orders")}</span><strong>{dashboard.orders || 0}</strong></div>
            <div><span>{t("active")}</span><strong>{dashboard.active_products || 0}</strong></div>
            <div><span>{t("lowStock")}</span><strong>{dashboard.low_stock || 0}</strong></div>
            <div><span>{t("customers")}</span><strong>{dashboard.users || 0}</strong></div>
            <div><span>{t("hidden")}</span><strong>{dashboard.hidden_products || 0}</strong></div>
          </div>
        </section>}
        {activeTab === "inventory" && <section className="admin-section admin-two-col" id="inventory" role="tabpanel">
          <form className="admin-form" onSubmit={createAdminProduct}>
            <h2>{t("newProduct")}</h2>
            <input name="name" placeholder={t("name")} required />
            <input name="category" placeholder={t("category")} required />
            <input name="brand" placeholder={t("brand")} required />
            <input name="price" type="number" min="1" placeholder={t("price")} required />
            <input name="amount" type="number" min="0" placeholder={t("stockInput")} defaultValue="10" required />
            <input name="image_url" placeholder={t("imageUrl")} />
            <textarea name="description" placeholder={t("description")} />
            <button className="primary">{t("addProduct")}</button>
          </form>
          <div className="admin-card">
            <div className="admin-card-head"><div><p className="eyebrow">{t("inventory")}</p><h2>{t("productManagement")}</h2></div></div>
            <AdminProductsTable products={admin.products} t={t} updateAdminProduct={updateAdminProduct} deleteProduct={deleteProduct} />
          </div>
        </section>}
        {activeTab === "orders" && <section className="admin-section" id="orders-admin" role="tabpanel">
          <div className="admin-card">
            <div className="admin-card-head"><div><p className="eyebrow">{t("recentOrders")}</p><h2>{t("orders")}</h2></div></div>
            <AdminOrdersTable orders={admin.orders} statuses={admin.statuses} t={t} updateOrderStatus={updateOrderStatus} />
          </div>
        </section>}
        {activeTab === "customers" && <section className="admin-section" id="customers" role="tabpanel">
          <div className="admin-card">
            <div className="admin-card-head"><div><p className="eyebrow">{t("customers")}</p><h2>{t("users")}</h2></div></div>
            <AdminUsersTable users={admin.users} t={t} lang={lang} />
          </div>
        </section>}
      </main>
    </div>
  );
}
