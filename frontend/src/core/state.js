function initialRoute() {
  if (location.pathname === "/admin") return "admin";
  if (location.pathname === "/auth") return "auth";
  return "shop";
}

export const state = {
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  lang: localStorage.getItem("lang") || "ru",
  user: null,
  products: [],
  meta: { categories: [], brands: [] },
  cart: { items: [], subtotal_cents: 0 },
  orders: [],
  filters: { q: "", category: "", brand: "" },
  cartOpen: false,
  route: initialRoute(),
  admin: {
    dashboard: null,
    products: [],
    users: [],
    orders: [],
    statuses: [],
  },
};
