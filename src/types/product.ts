export interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface PaginatedProductsResponse {
  products: Product[];
  page: number;
  limit: number;
  totalPages: number;
  totalProducts: number;
}
