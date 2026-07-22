import { Link, NavLink, Outlet } from "react-router";
import { useCart } from "../cart/useCart";
import { useCustomer } from "../customer/useCustomer";

export function PublicLayout() {
  const { itemCount } = useCart();
  const { isReturningCustomer } = useCustomer();

  return (
    <div className="store-shell">
      <header className="store-header">
        <div className="store-header-inner">
          <Link className="store-brand" to="/products">
            <span className="brand-mark" aria-hidden="true">S</span>
            <span>
              <strong>Snap Shop</strong>
              <small>Assessment storefront</small>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="store-nav">
            <NavLink to="/products">Products</NavLink>
            <NavLink className="cart-nav-link" to="/cart">
              Cart
              <span aria-label={`${itemCount} cart items`} className="cart-count">
                {itemCount}
              </span>
            </NavLink>
            <Link to="/login">Admin</Link>
          </nav>

          <span
            className={`customer-badge ${
              isReturningCustomer ? "returning" : "new"
            }`}
          >
            <span aria-hidden="true">●</span>
            {isReturningCustomer ? "Returning Customer" : "New Customer"}
          </span>
        </div>
      </header>

      <Outlet />

      <footer className="store-footer">
        <p>Frontend Tech Associate take-home assessment.</p>
      </footer>
    </div>
  );
}
