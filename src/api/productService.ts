import { apiClient, publicClient } from "./httpClients";
import type {
  PaginatedProductsResponse,
  Product,
  ProductInput,
} from "../types/product";

export const productService = {
  async getProducts(
    page = 1,
    limit = 20,
    signal?: AbortSignal,
  ): Promise<PaginatedProductsResponse> {
    const response = await publicClient.get<PaginatedProductsResponse>(
      "/products",
      {
        params: { page, limit },
        signal,
      },
    );

    return response.data;
  },

  async getProduct(id: string, signal?: AbortSignal): Promise<Product> {
    const response = await publicClient.get<Product>(`/products/${id}`, {
      signal,
    });

    return response.data;
  },

  async createProduct(input: ProductInput): Promise<Product> {
    const response = await apiClient.post<Product>("/products", input);
    return response.data;
  },

  async updateProduct(id: string, input: ProductInput): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, input);
    return response.data;
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/products/${id}`,
    );

    return response.data;
  },
};
