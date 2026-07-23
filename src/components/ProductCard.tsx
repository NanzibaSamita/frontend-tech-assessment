import { useCart } from "../cart/useCart";
import type { Product } from "../types/product";
import { formatCurrency } from "../utils/currency";
import { ProductImage } from "./ProductImage";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const cartItem = items.find((item) => item.product._id === product._id);
  const isOutOfStock = product.quantity <= 0;
  const reachedStockLimit = Boolean(
    cartItem && cartItem.quantity >= product.quantity,
  );

  return (
    <article className="product-card">
      <ProductImage
        className="product-card-image"
        imageUrl={product.imageUrl}
        name={product.name}
      />

      <div className="product-card-content">
        <div className="product-card-heading">
          <h2>{product.name}</h2>
          <strong>{formatCurrency(product.price)}</strong>
        </div>

        <p className="product-description">
          Description unavailable from the provided product API.
        </p>

        <div className="product-card-footer">
          <span className={isOutOfStock ? "stock out" : "stock"}>
            {isOutOfStock ? "Out of stock" : `${product.quantity} in stock`}
          </span>

          <button
            className="primary-button"
            disabled={isOutOfStock || reachedStockLimit}
            onClick={() => addItem(product)}
            type="button"
          >
            {reachedStockLimit
              ? "Stock limit reached"
              : cartItem
                ? "Add another"
                : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
