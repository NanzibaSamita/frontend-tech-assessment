import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";


export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <h1>Shop Admin</h1>
          <p>{user?.email}</p>
        </div>

        <nav>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
        </nav>

        <button className="secondary-button" onClick={handleLogout} type="button">
          Logout
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
