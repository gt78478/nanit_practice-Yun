import { state } from "../core/state.js";
import { navigate } from "../core/router.js";
import { render } from "../core/render.js";

export function setTokens(payload) {
  state.token = payload.access_token;
  state.refreshToken = payload.refresh_token;
  localStorage.setItem("token", state.token);
  localStorage.setItem("refreshToken", state.refreshToken);
}

export function logout() {
  state.token = null;
  state.refreshToken = null;
  state.user = null;
  state.cart = { items: [], subtotal_cents: 0 };
  state.orders = [];
  navigate("/");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  render();
}
