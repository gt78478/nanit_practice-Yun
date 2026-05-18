"use client";

import { useShopApp } from "../hooks/useShopApp.js";
import { AdminPage } from "./pages/AdminPage.js";
import { AuthPage } from "./pages/AuthPage.js";
import { CatalogPage } from "./pages/CatalogPage.js";
import { ErrorPage } from "./pages/ErrorPage.js";
import { OrdersPage } from "./pages/OrdersPage.js";
import { StorefrontPage } from "./pages/StorefrontPage.js";

export function ShopApp() {
  const app = useShopApp();

  if (app.error) {
    return <ErrorPage error={app.error} t={app.t} />;
  }

  if (app.route === "auth") {
    return <AuthPage handleAuthSubmit={app.handleAuthSubmit} router={app.router} t={app.t} />;
  }

  if (app.route === "admin" && app.user?.role === "admin") {
    return <AdminPage {...app} />;
  }

  if (app.route === "catalog") {
    return <CatalogPage {...app} />;
  }

  if (app.route === "orders") {
    return <OrdersPage {...app} />;
  }

  return <StorefrontPage {...app} />;
}
