import { useEffect, useMemo, useState } from "react";
import { orderService } from "../../api/orderService";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
import { OrderDetailsDialog } from "../../components/OrderDetailsDialog";
import type { Order } from "../../types/order";
import { getApiErrorMessage } from "../../utils/apiError";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadOrders = async () => {
      try {
        const response = await orderService.getOrders(controller.signal);

        if (!controller.signal.aborted) {
          setOrders(response);
          setError("");
        }
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(loadError, "Orders could not be loaded."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadOrders();

    return () => controller.abort();
  }, [reloadToken]);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime(),
      ),
    [orders],
  );

  const returningCustomerCount = orders.filter(
    (order) => order.recurring_customer,
  ).length;

  const handleViewDetails = async (orderId: string) => {
    setIsLoadingDetails(true);
    setDetailsError("");

    try {
      const order = await orderService.getOrder(orderId);
      setSelectedOrder(order);
    } catch (loadError) {
      setDetailsError(
        getApiErrorMessage(loadError, "Order details could not be loaded."),
      );
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Order management</p>
          <h2>Orders</h2>
          <p>Review customers, purchased products, quantities and totals.</p>
        </div>

        <div className="admin-stats-row">
          <div className="admin-stat">
            <strong>{orders.length}</strong>
            <span>Total orders</span>
          </div>
          <div className="admin-stat">
            <strong>{returningCustomerCount}</strong>
            <span>Returning customers</span>
          </div>
        </div>
      </div>

      {detailsError && (
        <p className="form-error" role="alert">
          {detailsError}
        </p>
      )}

      <div className="admin-section-card">
        {isLoading ? (
          <LoadingState message="Loading orders…" />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => setReloadToken((value) => value + 1)}
          />
        ) : sortedOrders.length > 0 ? (
          <div className="table-wrapper">
            <table className="admin-table orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Type</th>
                  <th>Placed</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => {
                  const itemCount = order.products.reduce(
                    (total, product) => total + product.quantity,
                    0,
                  );

                  return (
                    <tr key={order._id}>
                      <td><strong>#{order._id.slice(-8)}</strong></td>
                      <td>
                        <div className="customer-cell">
                          <strong>{order.name}</strong>
                          <small>{order.email}</small>
                        </div>
                      </td>
                      <td>{itemCount}</td>
                      <td>
                        <span
                          className={`customer-type-pill ${
                            order.recurring_customer ? "returning" : "new"
                          }`}
                        >
                          {order.recurring_customer ? "Returning" : "New"}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        <button
                          className="ghost-button"
                          disabled={isLoadingDetails}
                          onClick={() => void handleViewDetails(order._id)}
                          type="button"
                        >
                          {isLoadingDetails ? "Loading…" : "View details"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h2>No orders yet</h2>
            <p>Successfully placed storefront orders will appear here.</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsDialog
          key={selectedOrder._id}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </section>
  );
}
