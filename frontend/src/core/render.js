import { appShell } from "../views/app.js";

export function render() {
  document.querySelector("#app").innerHTML = appShell();
}
