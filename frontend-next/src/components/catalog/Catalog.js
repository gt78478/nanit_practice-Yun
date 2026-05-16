import { clp } from "../../lib/format.js";

export function Catalog({ products, meta, filters, setFilters, t, addCart }) {
  function submit(event) {
    event.preventDefault();
    setFilters(Object.fromEntries(new FormData(event.currentTarget)));
  }

  return (
    <section className="section" id="catalog">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t("catalog")}</p>
          <h2>{t("productTitle")}</h2>
        </div>
        <form className="filters" onSubmit={submit}>
          <input name="q" placeholder={t("searchPlaceholder")} defaultValue={filters.q} />
          <select name="category" defaultValue={filters.category}>
            <option value="">{t("category")}</option>
            {meta.categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select name="brand" defaultValue={filters.brand}>
            <option value="">{t("brand")}</option>
            {meta.brands.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="icon" title={t("searchPlaceholder")}>⌕</button>
        </form>
      </div>
      <div className="product-grid">
        {products.length ? products.map((product) => (
          <article className="product" key={product.id}>
            <div className="product-media"><img src={product.image_url} alt={product.name} /></div>
            <div className="product-body">
              <div className="meta-row"><span>{product.category?.name || "Beauty"}</span><span>{product.brand?.name || ""}</span></div>
              <h3>{product.name}</h3>
              <p>{product.description || ""}</p>
              <div className="buy-row">
                <strong>{clp(product.price_cents)}</strong>
                <div className="card-actions"><button className="primary small" onClick={() => addCart(product.id)}>{t("add")}</button></div>
              </div>
            </div>
          </article>
        )) : <p className="muted">{t("noProducts")}</p>}
      </div>
    </section>
  );
}
