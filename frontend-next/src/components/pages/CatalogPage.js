import { Catalog } from "../catalog/Catalog.js";
import { StoreLayout } from "../common/StoreLayout.js";

export function CatalogPage(app) {
  return (
    <StoreLayout {...app}>
      <main>
        <Catalog products={app.products} meta={app.meta} filters={app.filters} setFilters={app.setFilters} t={app.t} addCart={app.addCart} />
      </main>
    </StoreLayout>
  );
}
