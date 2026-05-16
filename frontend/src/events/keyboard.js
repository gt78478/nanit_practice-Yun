import { render } from "../core/render.js";
import { state } from "../core/state.js";

export function registerKeyboardHandler() {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !state.cartOpen) return;
    state.cartOpen = false;
    render();
  });
}
