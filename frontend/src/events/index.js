import { registerChangeHandler } from "./change.js";
import { registerClickHandler } from "./click.js";
import { registerKeyboardHandler } from "./keyboard.js";
import { registerNavigationHandler } from "./navigation.js";
import { registerSubmitHandler } from "./submit.js";

export function registerEvents() {
  registerSubmitHandler();
  registerClickHandler();
  registerChangeHandler();
  registerKeyboardHandler();
  registerNavigationHandler();
}
