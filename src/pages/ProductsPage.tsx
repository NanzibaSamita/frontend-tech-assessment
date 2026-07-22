import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { productService } from "../api/productService";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { Pagination } from "../components/Pagination";
import { ProductCard } from "../components/ProductCard";
import type { PaginatedProductsResponse } from "../types/product";
import { getApiErrorMessage } from "../utils/apiError";

const PAGE_SIZE = 20;

function getPageFromSearchParams(searchParams: URLSearchParams): number {
  const requestedPage = Number(searchParams.get("page") ?? "1");
  return Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = getPageFromSearchParams(searchParams);
  const [data, setData] = useState<PaginatedProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        const response = await productService.getProducts(
          currentPage,
          PAGE_SIZE,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        if (response.totalPages > 0 && currentPage > response.totalPages) {
          setSearchParams({ page: String(response.totalPages) }, { replace: true });
          return;
        }

        setData(response);
        setError("");
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          getApiErrorMessage(loadError, "Products could not be loaded."),
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

   
    void loadProducts();

    return () => controller.abort();
  }, [currentPage, reloadToken, setSearchParams]);

  const handlePageChange = useCallback(
  (page: number) => {
    setIsLoading(true);
    setError("");

    setSearchParams(page === 1 ? {} : { page: String(page) });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  },
  [setSearchParams],
);

  return (
    <main className="store-main">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Product catalog</p>
          <h1>Find something worth adding to your cart.</h1>
          <p>
            Browse the API-powered catalog. Each page loads exactly 20 products.
          </p>
        </div>

        <div className="catalog-summary">
          <strong>{data?.totalProducts ?? "—"}</strong>
          <span>Total products</span>
        </div>
      </section>

      <section aria-labelledby="products-heading" className="content-section">
        <div className="section-heading">
          <div>
            <h2 id="products-heading">Products</h2>
            <p>
              Page {data?.page ?? currentPage} of {data?.totalPages || 1}
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Loading products…" />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => setReloadToken((value) => value + 1)}
          />
        ) : data && data.products.length > 0 ? (
          <>
            <div className="product-grid">
              {data.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <Pagination
              currentPage={data.page}
              onPageChange={handlePageChange}
              totalPages={data.totalPages}
            />
          </>
        ) : (
          <div className="empty-state">
            <h2>No products found</h2>
            <p>The catalog is currently empty.</p>
          </div>
        )}
      </section>
    </main>
  );
}
