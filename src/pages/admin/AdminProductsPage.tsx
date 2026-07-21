import { apiClient } from "../../api/httpClients";

export function AdminProductsPage() {
  // Example protected request for later:
  // const response = await apiClient.get("/products");
  // Authorization is added automatically by the request interceptor.
  void apiClient;

  return <section><h2>Admin Products</h2><p>You are inside a protected route.</p></section>;
}
