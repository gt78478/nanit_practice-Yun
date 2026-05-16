"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../api/client.js";
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

export function useShopApp() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState(() => stored("token"));
  const [, setRefreshToken] = useState(() => stored("refreshToken"));
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
        alert(lang === "ru" ? "Пароли не совпадают" : lang === "pt" ? "As senhas nao coincidem" : "Passwords do not match");
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

  return {
    admin,
    addCart,
    cart,
    cartOpen,
    changeLang,
    checkout,
    createAdminProduct,
    deleteProduct,
    demoLogin,
    error,
    filters,
    handleAuthSubmit,
    lang,
    logout,
    meta,
    orders,
    pay,
    products,
    route,
    router,
    setCartOpen,
    setFilters,
    t,
    updateAdminProduct,
    updateOrderStatus,
    user,
    removeCart,
  };
}
