import type { Product } from "./product";

export interface OrderProductInput {
  product: string;
  quantity: number;
}

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface PlaceOrderInput extends CheckoutCustomer {
  products: OrderProductInput[];
  recurring_customer: boolean;
}

export interface OrderProductLine {
  product: string | Product;
  quantity: number;
}

export interface Order {
  _id: string;
  products: OrderProductLine[];
  name: string;
  email: string;
  phone: string;
  address: string;
  recurring_customer: boolean;
  createdAt: string;
  updatedAt: string;
}
