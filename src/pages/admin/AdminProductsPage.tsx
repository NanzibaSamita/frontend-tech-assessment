import { useEffect, useState } from "react";
import { productService } from "../../api/productService";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
import { Pagination } from "../../components/Pagination";
import { ProductForm } from "../../components/ProductForm";
import { ProductImage } from "../../components/ProductImage";
import type {
  PaginatedProductsResponse,
  Product,
  ProductInput,
} from "../../types/product";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatCurrency } from "../../utils/currency";

const PAGE_SIZE = 20;

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  const [data, setData] =
    useState<PaginatedProductsResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [productToDelete, setProductToDelete] =
    useState<Product | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formVersion, setFormVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const response = await productService.getProducts(
          page,
          PAGE_SIZE,
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }

        setData(response);
        setLoadError("");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(
          getApiErrorMessage(
            error,
            "The product catalog could not be loaded.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchProducts();

    return () => {
      controller.abort();
    };
  }, [page, reloadToken]);

  const refreshProducts = () => {
    setIsLoading(true);
    setLoadError("");
    setReloadToken((value) => value + 1);
  };

  const changePage = (newPage: number) => {
    setIsLoading(true);
    setLoadError("");
    setPage(newPage);
  };

  const handleProductSubmit = async (input: ProductInput) => {
    setIsSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      if (editingProduct) {
        await productService.updateProduct(
          editingProduct._id,
          input,
        );

        setSuccessMessage("Product updated successfully.");
        setEditingProduct(null);
        setFormVersion((value) => value + 1);
        refreshProducts();
      } else {
        await productService.createProduct(input);

        setSuccessMessage("Product created successfully.");
        setFormVersion((value) => value + 1);

        if (page === 1) {
          refreshProducts();
        } else {
          changePage(1);
        }
      }
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          "The product could not be saved.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) {
      return;
    }

    setIsDeleting(true);
    setLoadError("");
    setSuccessMessage("");

    try {
      await productService.deleteProduct(productToDelete._id);

      setProductToDelete(null);
      setSuccessMessage("Product deleted successfully.");

      const isLastProductOnPage = data?.products.length === 1;

      if (isLastProductOnPage && page > 1) {
        changePage(page - 1);
      } else {
        refreshProducts();
      }
    } catch (error) {
      setLoadError(
        getApiErrorMessage(
          error,
          "The product could not be deleted.",
        ),
      );

      setProductToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const startEditing = (product: Product) => {
    setFormError("");
    setSuccessMessage("");
    setEditingProduct(product);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setFormError("");
    setFormVersion((value) => value + 1);
  };

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Catalog management</p>
          <h2>Products</h2>
          <p>Create, update and delete products.</p>
        </div>

        <div className="admin-stat">
          <strong>{data?.totalProducts ?? "—"}</strong>
          <span>Total products</span>
        </div>
      </div>

      <ProductForm
        error={formError}
        isSubmitting={isSubmitting}
        key={`${editingProduct?._id ?? "new"}-${formVersion}`}
        onCancel={editingProduct ? cancelEditing : undefined}
        onSubmit={handleProductSubmit}
        product={editingProduct}
      />

      {successMessage && (
        <p className="success-message" role="status">
          {successMessage}
        </p>
      )}

      <div className="admin-section-card">
        <div className="section-heading compact">
          <div>
            <h2>Product list</h2>
            <p>Showing up to {PAGE_SIZE} products per page.</p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Loading admin products…" />
        ) : loadError ? (
          <ErrorState
            message={loadError}
            onRetry={refreshProducts}
          />
        ) : data && data.products.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {data.products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="table-product">
                          <ProductImage
                            className="table-product-image"
                            imageUrl={product.imageUrl}
                            name={product.name}
                          />

                          <div>
                            <strong>{product.name}</strong>
                            <small>{product._id}</small>
                          </div>
                        </div>
                      </td>

                      <td>{formatCurrency(product.price)}</td>

                      <td>
                        <span
                          className={`stock-pill ${
                            product.quantity > 0
                              ? "available"
                              : "unavailable"
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          product.updatedAt,
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="ghost-button"
                            onClick={() => startEditing(product)}
                            type="button"
                          >
                            Edit
                          </button>

                          <button
                            className="danger-button subtle"
                            onClick={() =>
                              setProductToDelete(product)
                            }
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={data.page}
              onPageChange={changePage}
              totalPages={data.totalPages}
            />
          </>
        ) : (
          <div className="empty-state">
            <h2>No products yet</h2>
            <p>Create the first product using the form above.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        confirmLabel="Delete product"
        isConfirming={isDeleting}
        isOpen={Boolean(productToDelete)}
        message={`Delete “${
          productToDelete?.name ?? "this product"
        }”? This action cannot be undone.`}
        onCancel={() => setProductToDelete(null)}
        onConfirm={() => void handleDelete()}
        title="Delete product"
      />
    </section>
  );
}