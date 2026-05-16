"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, API } from "../api/client.js";
import { clp, roleLabel } from "../lib/format.js";
import { i18n } from "../lib/translations.js";

const emptyCart = { items: [], subtotal_cents: 0 };
const emptyAdmin = { dashboard: null, products: [], users: [], orders: [], statuses: [] };

function stored(key) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function routeFromPath(pathname) {
  if (pathname === "/admin") return "admin";
  if (pathname === "/auth") return "auth";
  return "shop";
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value));
}

export function ShopApp() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState(() => stored("token"));
  const [refreshToken, setRefreshToken] = useState(() => stored("refreshToken"));
  const [lang, setLang] = useState(() => stored("lang") || "ru");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ categories: [], brands: [] });
  const [cart, setCart] = useState(emptyCart);
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ q: "", category: "", brand: "" });
  const [cartOpen, setCartOpen] = useState(false);
  const [admin, setAdmin] = useState(emptyAdmin);
  const [error, setError] = useState(null);
  const route = routeFromPath(pathname);
  const t = useMemo(() => (key) => i18n[lang]?.[key] || i18n.en[key] || key, [lang]);

  async function request(path, options = {}) {
    return api(path, token, options);
  }

  async function loadUser(currentToken = token) {
    const profile = await api("/users/me", currentToken);
    setUser(profile);
    return profile;
  }

  async function loadCart(currentToken = token) {
    const payload = await api("/cart", currentToken);
    setCart(payload);
    return payload;
  }

  async function loadOrders(currentToken = token) {
    const payload = await api("/orders", currentToken);
    setOrders(payload);
    return payload;
  }

  async function loadAdminData(currentToken = token, currentUser = user) {
    if (currentUser?.role !== "admin") return;
    const [dashboard, adminProducts, adminUsers, adminOrders, statuses] = await Promise.all([
      api("/admin/dashboard", currentToken),
      api("/admin/products", currentToken),
      api("/admin/users", currentToken),
      api("/admin/orders", currentToken),
      api("/admin/order-statuses", currentToken),
    ]);
    setAdmin({ dashboard, products: adminProducts, users: adminUsers, orders: adminOrders, statuses: statuses.items });
  }

  async function loadBase(currentToken = token) {
    const [catalogMeta, catalogProducts] = await Promise.all([
      api("/catalog/meta", currentToken),
      api(`/products?${new URLSearchParams(clean(filters))}`, currentToken),
    ]);
    setMeta(catalogMeta);
    setProducts(catalogProducts.items);
    if (currentToken) {
      try {
        const profile = await loadUser(currentToken);
        await Promise.allSettled([loadCart(currentToken), loadOrders(currentToken)]);
        if (route === "admin" && profile?.role === "admin") {
          await loadAdminData(currentToken, profile);
        }
      } catch {
        logout();
      }
    }
  }

  function saveTokens(payload) {
    setToken(payload.access_token);
    setRefreshToken(payload.refresh_token);
    localStorage.setItem("token", payload.access_token);
    localStorage.setItem("refreshToken", payload.refresh_token);
  }

  function logout() {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setCart(emptyCart);
    setOrders([]);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    router.push("/");
  }

  useEffect(() => {
    loadBase().catch(setError);
  }, [filters]);

  useEffect(() => {
    if (route === "admin" && user?.role === "admin") {
      loadAdminData().catch(setError);
    }
  }, [route, user?.role]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") setCartOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  async function handleAuthSubmit(event, mode) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (mode === "register") {
      if (data.password !== data.password_confirm) {
        alert(lang === "ru" ? "Пароли не совпадают" : "Passwords do not match");
        return;
      }
      delete data.password_confirm;
    }
    try {
      const payload = await api(`/auth/${mode}`, null, { method: "POST", body: JSON.stringify(data) });
      saveTokens(payload);
      const profile = await loadUser(payload.access_token);
      await loadBase(payload.access_token);
      router.push(profile?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      alert(err.message);
    }
  }

  async function demoLogin() {
    try {
      const payload = await api("/auth/login", null, {
        method: "POST",
        body: JSON.stringify({ email: "demo@beautyshop.cl", password: "demo1234" }),
      });
      saveTokens(payload);
      await loadUser(payload.access_token);
      await loadBase(payload.access_token);
    } catch (err) {
      alert(err.message);
    }
  }

  async function addCart(productId) {
    if (!user) {
      router.push("/auth");
      return;
    }
    try {
      await request("/cart/items", { method: "POST", body: JSON.stringify({ product_id: Number(productId), quantity: 1 }) });
      await loadCart();
      setCartOpen(true);
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeCart(itemId) {
    try {
      await request(`/cart/items/${itemId}`, { method: "DELETE" });
      await loadCart();
      setCartOpen(true);
    } catch (err) {
      alert(err.message);
    }
  }

  async function checkout(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const order = await request("/orders", {
        method: "POST",
        body: JSON.stringify({
          rut: data.rut,
          address: {
            full_name: data.full_name,
            phone: data.phone,
            city: data.city,
            commune: data.commune,
            address_line1: data.address_line1,
            postal_code: data.postal_code,
          },
        }),
      });
      const payment = await request("/payments/create", {
        method: "POST",
        body: JSON.stringify({ order_id: order.id, provider: "mercado_pago" }),
      });
      alert(`${t("orderCreated")} ${payment.checkout_url}`);
      await Promise.all([loadCart(), loadOrders()]);
    } catch (err) {
      alert(err.message);
    }
  }

  async function pay(orderId) {
    try {
      const payment = await request("/payments/create", { method: "POST", body: JSON.stringify({ order_id: Number(orderId) }) });
      alert(`${t("demoCheckout")} ${payment.checkout_url}`);
    } catch (err) {
      alert(err.message);
    }
  }

  async function createAdminProduct(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await request("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          brand: data.brand,
          description: data.description,
          amount: Number(data.amount || 0),
          price_cents: Number(data.price) * 100,
          image_url: data.image_url || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
        }),
      });
      event.currentTarget.reset();
      await Promise.all([loadBase(), loadAdminData()]);
    } catch (err) {
      alert(err.message);
    }
  }

  async function updateAdminProduct(event, productId) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await request(`/admin/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          brand: data.brand,
          description: data.description,
          amount: Number(data.amount || 0),
          price_cents: Number(data.price) * 100,
          image_url: data.image_url,
          is_active: data.is_active === "true",
        }),
      });
      await Promise.all([loadBase(), loadAdminData()]);
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteProduct(productId) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await request(`/admin/products/${productId}`, { method: "DELETE" });
      await Promise.all([loadBase(), loadAdminData()]);
    } catch (err) {
      alert(err.message);
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      await request(`/admin/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  function changeLang(value) {
    setLang(value);
    localStorage.setItem("lang", value);
  }

  if (error) {
    return (
      <main className="error">
        <h1>{t("apiUnavailable")}</h1>
        <p>{error.message}</p>
        <p>
          {t("startBackend")} {API}
        </p>
      </main>
    );
  }

  if (route === "auth") {
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

  if (route === "admin" && user?.role === "admin") {
    const dashboard = admin.dashboard || {};
    return (
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button className="brand admin-brand" onClick={() => router.push("/")}>
            БьютиШоп <span>Чили</span>
          </button>
          <button className="admin-nav active" onClick={() => document.querySelector("#overview")?.scrollIntoView({ behavior: "smooth" })}>
            {t("dashboard")}
          </button>
          <button className="admin-nav" onClick={() => document.querySelector("#inventory")?.scrollIntoView({ behavior: "smooth" })}>
            {t("inventory")}
          </button>
          <button className="admin-nav" onClick={() => document.querySelector("#orders-admin")?.scrollIntoView({ behavior: "smooth" })}>
            {t("orders")}
          </button>
          <button className="admin-nav" onClick={() => document.querySelector("#customers")?.scrollIntoView({ behavior: "smooth" })}>
            {t("customers")}
          </button>
          <button className="admin-nav" onClick={() => router.push("/")}>
            {t("storefront")}
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
          <section className="admin-section" id="overview">
            <div className="admin-metrics">
              <div><span>{t("revenue")}</span><strong>{clp(dashboard.revenue_cents || 0)}</strong></div>
              <div><span>{t("orders")}</span><strong>{dashboard.orders || 0}</strong></div>
              <div><span>{t("active")}</span><strong>{dashboard.active_products || 0}</strong></div>
              <div><span>{t("lowStock")}</span><strong>{dashboard.low_stock || 0}</strong></div>
              <div><span>{t("customers")}</span><strong>{dashboard.users || 0}</strong></div>
              <div><span>{t("hidden")}</span><strong>{dashboard.hidden_products || 0}</strong></div>
            </div>
          </section>
          <section className="admin-section admin-two-col" id="inventory">
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
          </section>
          <section className="admin-section" id="orders-admin">
            <div className="admin-card">
              <div className="admin-card-head"><div><p className="eyebrow">{t("recentOrders")}</p><h2>{t("orders")}</h2></div></div>
              <AdminOrdersTable orders={admin.orders} statuses={admin.statuses} t={t} updateOrderStatus={updateOrderStatus} />
            </div>
          </section>
          <section className="admin-section" id="customers">
            <div className="admin-card">
              <div className="admin-card-head"><div><p className="eyebrow">{t("customers")}</p><h2>{t("users")}</h2></div></div>
              <AdminUsersTable users={admin.users} t={t} lang={lang} />
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="announce">
        {t("announce")} {clp(4500000)} {lang === "ru" ? "по Чили" : "in Chile"}
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

function LangSelect({ lang, changeLang }) {
  return (
    <select className="lang-select" value={lang} onChange={(event) => changeLang(event.target.value)} aria-label="Language">
      <option value="en">EN</option>
      <option value="pt">PT</option>
      <option value="ru">RU</option>
    </select>
  );
}

function Catalog({ products, meta, filters, setFilters, t, addCart }) {
  function submit(event) {
    event.preventDefault();
    setFilters(Object.fromEntries(new FormData(event.currentTarget)));
  }
  return (
    <section className="section" id="catalog">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t("catalog")}</p>
          <h2>{t("productTitle")}</h2>
        </div>
        <form className="filters" onSubmit={submit}>
          <input name="q" placeholder={t("searchPlaceholder")} defaultValue={filters.q} />
          <select name="category" defaultValue={filters.category}>
            <option value="">{t("category")}</option>
            {meta.categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select name="brand" defaultValue={filters.brand}>
            <option value="">{t("brand")}</option>
            {meta.brands.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="icon" title={t("searchPlaceholder")}>⌕</button>
        </form>
      </div>
      <div className="product-grid">
        {products.length ? products.map((product) => (
          <article className="product" key={product.id}>
            <div className="product-media"><img src={product.image_url} alt={product.name} /></div>
            <div className="product-body">
              <div className="meta-row"><span>{product.category?.name || "Beauty"}</span><span>{product.brand?.name || ""}</span></div>
              <h3>{product.name}</h3>
              <p>{product.description || ""}</p>
              <div className="buy-row">
                <strong>{clp(product.price_cents)}</strong>
                <div className="card-actions"><button className="primary small" onClick={() => addCart(product.id)}>{t("add")}</button></div>
              </div>
            </div>
          </article>
        )) : <p className="muted">{t("noProducts")}</p>}
      </div>
    </section>
  );
}

function CartDrawer({ cart, cartOpen, setCartOpen, t, removeCart, checkout, user }) {
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

function Orders({ user, orders, t, pay }) {
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

function AdminProductsTable({ products, t, updateAdminProduct, deleteProduct }) {
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

function AdminOrdersTable({ orders, statuses, t, updateOrderStatus }) {
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

function AdminUsersTable({ users, t, lang }) {
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
