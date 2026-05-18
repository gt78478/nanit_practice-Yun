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
            <div className="product-media">
              <div className="product-badges" aria-hidden="true">
                <span className="flash-badge">↯</span>
                <span className="hit-badge">HIT</span>
              </div>
              <button className="favorite-button" type="button" aria-label={t("favorite")}>♡</button>
              <img src={product.image_url} alt={product.name} />
              <button className="quick-cart" type="button" onClick={() => addCart(product.id)} aria-label={t("add")}>
                <span aria-hidden="true">▢</span>
              </button>
            </div>
            <div className="product-body">
              <div className="shade-row" aria-hidden="true">
                <span className="shade warm" />
                <span className="shade taupe" />
                <span className="shade slate" />
                <strong>+2</strong>
              </div>
              <div className="meta-row"><span>{product.category?.name || "Beauty"}</span></div>
              <h3>{product.name}</h3>
              <div className="buy-row">
                <strong>{t("fromPrice")} {clp(product.price_cents)}</strong>
              </div>
            </div>
          </article>
        )) : <p className="muted">{t("noProducts")}</p>}
      </div>
    </section>
  );
}
