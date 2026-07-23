import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { orderService } from "../api/orderService";
import { useCart } from "../cart/useCart";
import { ProductImage } from "../components/ProductImage";
import { useCustomer } from "../customer/useCustomer";
import type { CheckoutCustomer, Order } from "../types/order";
import { getApiErrorMessage } from "../utils/apiError";
import { formatCurrency } from "../utils/currency";

const initialCustomer: CheckoutCustomer = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { isReturningCustomer, markOrderPlaced } = useCustomer();
  const [customer, setCustomer] = useState(initialCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (items.length === 0) return;

    setIsSubmitting(true);
    setError("");

    try {
      const order = await orderService.placeOrder({
        products: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        recurring_customer: isReturningCustomer,
      });

      setCompletedOrder(order);
      markOrderPlaced();
      clearCart();
      setCustomer(initialCustomer);
    } catch (checkoutError) {
      setError(
        getApiErrorMessage(
          checkoutError,
          "Order placement failed. Your cart is still saved, so you can retry.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <main className="store-main">
        <section className="checkout-success">
          <div className="success-icon" aria-hidden="true">✓</div>
          <p className="eyebrow">Order placed</p>
          <h1>Thank you, {completedOrder.name}.</h1>
          <p>
            Your order <strong>#{completedOrder._id.slice(-8)}</strong> was
            placed successfully. This browser will now identify you as a
            returning customer on future visits.
          </p>
          <Link className="primary-button button-link" to="/products">
            Continue shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="store-main">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Shopping cart</p>
          <h1>Your cart</h1>
          <p>{itemCount} item{itemCount === 1 ? "" : "s"} ready for checkout.</p>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="empty-state cart-empty-state">
          <h2>Your cart is empty</h2>
          <p>Add products from the catalog. Your cart will survive page refreshes.</p>
          <Link className="primary-button button-link" to="/products">
            Browse products
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section aria-label="Cart products" className="cart-items">
            {items.map((item) => (
              <article className="cart-item" key={item.product._id}>
                <ProductImage
                  className="cart-item-image"
                  imageUrl={item.product.imageUrl}
                  name={item.product.name}
                />

                <div className="cart-item-info">
                  <h2>{item.product.name}</h2>
                  <p>{formatCurrency(item.product.price)} each</p>
                  <button
                    className="text-button danger-text"
                    onClick={() => removeItem(item.product._id)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>

                <div className="quantity-control" aria-label={`Quantity for ${item.product.name}`}>
                  <button
                    aria-label="Decrease quantity"
                    onClick={() =>
                      updateQuantity(item.product._id, item.quantity - 1)
                    }
                    type="button"
                  >
                    −
                  </button>
                  <input
                    aria-label="Quantity"
                    max={Math.max(item.product.quantity, 1)}
                    min="1"
                    onChange={(event) =>
                      updateQuantity(item.product._id, Number(event.target.value))
                    }
                    type="number"
                    value={item.quantity}
                  />
                  <button
                    aria-label="Increase quantity"
                    disabled={item.quantity >= item.product.quantity}
                    onClick={() =>
                      updateQuantity(item.product._id, item.quantity + 1)
                    }
                    type="button"
                  >
                    +
                  </button>
                </div>

                <strong className="cart-line-total">
                  {formatCurrency(item.product.price * item.quantity)}
                </strong>
              </article>
            ))}
          </section>

          <aside className="checkout-panel">
            <div className="checkout-summary">
              <div>
                <span>Items</span>
                <strong>{itemCount}</strong>
              </div>
              <div className="subtotal-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
            </div>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <div>
                <p className="eyebrow">Customer details</p>
                <h2>Place your order</h2>
                <p className="form-helper">
                  These details are required by the order API. Returning-customer
                  status is detected automatically from successful orders in this browser.
                </p>
              </div>

              <label>
                Full name
                <input
                  autoComplete="name"
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                  value={customer.name}
                />
              </label>

              <label>
                Email
                <input
                  autoComplete="email"
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                  type="email"
                  value={customer.email}
                />
              </label>

              <label>
                Phone
                <input
                  autoComplete="tel"
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  required
                  type="tel"
                  value={customer.phone}
                />
              </label>

              <label>
                Address
                <textarea
                  autoComplete="street-address"
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  required
                  rows={3}
                  value={customer.address}
                />
              </label>

              {error && (
                <div className="checkout-error" role="alert">
                  <strong>Order was not placed.</strong>
                  <p>{error}</p>
                  <small>
                    The assessment API intentionally fails about 50% of checkout
                    attempts. Your cart has not been cleared.
                  </small>
                </div>
              )}

              <button className="primary-button checkout-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Placing order…" : `Place order · ${formatCurrency(subtotal)}`}
              </button>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}
