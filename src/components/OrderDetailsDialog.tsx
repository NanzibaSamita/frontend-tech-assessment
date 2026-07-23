import { useEffect, useMemo, useState } from "react";
import { productService } from "../api/productService";
import type { Order } from "../types/order";
import type { Product } from "../types/product";
import { formatCurrency } from "../utils/currency";
import { ProductImage } from "./ProductImage";

interface OrderDetailsDialogProps {
  order: Order;
  onClose: () => void;
}

interface ResolvedLine {
  productId: string;
  name: string;
  imageUrl: string;
  unitPrice: number | null;
  quantity: number;
}

function isProduct(value: string | Product): value is Product {
  return typeof value !== "string";
}

export function OrderDetailsDialog({
  order,
  onClose,
}: OrderDetailsDialogProps) {
  const [lines, setLines] = useState<ResolvedLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const resolveProducts = async () => {
      const resolvedLines = await Promise.all(
        order.products.map(async (line): Promise<ResolvedLine> => {
          if (isProduct(line.product)) {
            return {
              productId: line.product._id,
              name: line.product.name,
              imageUrl: line.product.imageUrl,
              unitPrice: line.product.price,
              quantity: line.quantity,
            };
          }

          try {
            const product = await productService.getProduct(
              line.product,
              controller.signal,
            );

            return {
              productId: product._id,
              name: product.name,
              imageUrl: product.imageUrl,
              unitPrice: product.price,
              quantity: line.quantity,
            };
          } catch {
            return {
              productId: line.product,
              name: "Product unavailable",
              imageUrl: "",
              unitPrice: null,
              quantity: line.quantity,
            };
          }
        }),
      );

      if (!controller.signal.aborted) {
        setLines(resolvedLines);
        setIsLoading(false);
      }
    };

    void resolveProducts();

    return () => controller.abort();
  }, [order]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const calculatedTotal = useMemo(() => {
    if (lines.some((line) => line.unitPrice === null)) return null;

    return lines.reduce(
      (total, line) => total + (line.unitPrice ?? 0) * line.quantity,
      0,
    );
  }, [lines]);

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        aria-labelledby="order-details-title"
        aria-modal="true"
        className="dialog-card order-dialog"
        role="dialog"
      >
        <div className="dialog-header">
          <div>
            <p className="eyebrow">Order details</p>
            <h2 id="order-details-title">#{order._id.slice(-8)}</h2>
          </div>
          <button aria-label="Close order details" className="icon-button" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <dl className="customer-details">
          <div><dt>Name</dt><dd>{order.name}</dd></div>
          <div><dt>Email</dt><dd>{order.email}</dd></div>
          <div><dt>Phone</dt><dd>{order.phone}</dd></div>
          <div><dt>Address</dt><dd>{order.address}</dd></div>
          <div><dt>Customer type</dt><dd>{order.recurring_customer ? "Returning" : "New"}</dd></div>
          <div><dt>Placed</dt><dd>{new Date(order.createdAt).toLocaleString()}</dd></div>
        </dl>

        <div className="order-lines">
          <h3>Purchased products</h3>
          {isLoading ? (
            <p>Loading product details…</p>
          ) : (
            lines.map((line) => (
              <article className="order-line" key={`${line.productId}-${line.quantity}`}>
                <ProductImage
                  className="order-line-image"
                  imageUrl={line.imageUrl}
                  name={line.name}
                />
                <div>
                  <strong>{line.name}</strong>
                  <span>Product ID: {line.productId}</span>
                </div>
                <span>Qty: {line.quantity}</span>
                <strong>
                  {line.unitPrice === null
                    ? "Price unavailable"
                    : formatCurrency(line.unitPrice * line.quantity)}
                </strong>
              </article>
            ))
          )}
        </div>

        <div className="order-total-row">
          <div>
            <strong>Calculated order total</strong>
            <small>Based on current catalog prices because the API does not return historical prices.</small>
          </div>
          <strong>
            {isLoading
              ? "Calculating…"
              : calculatedTotal === null
                ? "Unavailable"
                : formatCurrency(calculatedTotal)}
          </strong>
        </div>
      </section>
    </div>
  );
}
