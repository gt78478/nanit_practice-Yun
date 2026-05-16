export function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value));
}
