import { state } from "./state.js";

export function routeFromPath() {
  if (location.pathname === "/admin") return "admin";
  if (location.pathname === "/auth") return "auth";
  return "shop";
}

export function navigate(path) {
  history.pushState({}, "", path);
  state.route = routeFromPath();
}
