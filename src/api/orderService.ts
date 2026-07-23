import { apiClient, publicClient } from "./httpClients";
import type { Order, PlaceOrderInput } from "../types/order";

export const orderService = {
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    const response = await publicClient.post<Order>("/orders", input);
    return response.data;
  },

  async getOrders(signal?: AbortSignal): Promise<Order[]> {
    const response = await apiClient.get<Order[]>("/orders", { signal });
    return response.data;
  },

  async getOrder(id: string, signal?: AbortSignal): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`, { signal });
    return response.data;
  },
};
