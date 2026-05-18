import { StoreLayout } from "../common/StoreLayout.js";
import { Orders } from "../orders/Orders.js";

export function OrdersPage(app) {
  return (
    <StoreLayout {...app}>
      <main>
        <Orders user={app.user} orders={app.orders} t={app.t} pay={app.pay} />
      </main>
    </StoreLayout>
  );
}
