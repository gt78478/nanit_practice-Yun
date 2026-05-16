"use client";

import { useShopApp } from "../hooks/useShopApp.js";
import { AdminPage } from "./pages/AdminPage.js";
import { AuthPage } from "./pages/AuthPage.js";
import { ErrorPage } from "./pages/ErrorPage.js";
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

  return <StorefrontPage {...app} />;
}
