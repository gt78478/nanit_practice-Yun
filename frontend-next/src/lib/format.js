const money = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function clp(cents) {
  return money.format(Math.round(cents / 100));
}

export function roleLabel(role, lang) {
  if (lang === "ru") {
    return role === "admin" ? "администратор" : "покупатель";
  }
  if (lang === "pt") {
    return role === "admin" ? "administrador" : "cliente";
  }
  return role === "admin" ? "administrator" : "customer";
}
