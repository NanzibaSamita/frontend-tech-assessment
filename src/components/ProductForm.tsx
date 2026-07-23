import { useState, type FormEvent } from "react";
import type { Product, ProductInput } from "../types/product";

interface ProductFormProps {
  product?: Product | null;
  isSubmitting: boolean;
  error: string;
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel?: () => void;
}

export function ProductForm({
  product,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [quantity, setQuantity] = useState(
    product ? String(product.quantity) : "",
  );
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError("");

    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);

    if (!name.trim()) {
      setValidationError("Product name is required.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setValidationError("Price must be a valid non-negative number.");
      return;
    }

    if (!Number.isInteger(numericQuantity) || numericQuantity < 0) {
      setValidationError("Quantity must be a non-negative whole number.");
      return;
    }

    await onSubmit({
      name: name.trim(),
      price: numericPrice,
      quantity: numericQuantity,
      imageUrl: imageUrl.trim(),
    });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Product editor</p>
          <h2>{product ? "Update product" : "Create product"}</h2>
        </div>
        {product && onCancel && (
          <button className="ghost-button" onClick={onCancel} type="button">
            Cancel edit
          </button>
        )}
      </div>

      <div className="form-grid">
        <label>
          Product name
          <input
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            placeholder="Wireless headphones"
            required
            value={name}
          />
        </label>

        <label>
          Price
          <input
            min="0"
            onChange={(event) => setPrice(event.target.value)}
            placeholder="99.99"
            required
            step="0.01"
            type="number"
            value={price}
          />
        </label>

        <label>
          Stock quantity
          <input
            min="0"
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="25"
            required
            step="1"
            type="number"
            value={quantity}
          />
        </label>

        <label className="form-field-wide">
          Image URL
          <input
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://example.com/product.jpg"
            required
            type="url"
            value={imageUrl}
          />
        </label>
      </div>

      {(validationError || error) && (
        <p className="form-error" role="alert">
          {validationError || error}
        </p>
      )}

      <button className="primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting
          ? product
            ? "Updating…"
            : "Creating…"
          : product
            ? "Update product"
            : "Create product"}
      </button>
    </form>
  );
}
