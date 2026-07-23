interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="pagination">
      <button
        disabled={disabled || currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        Previous
      </button>

      <div className="pagination-pages">
        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];
          const showGap = previousPage && page - previousPage > 1;

          return (
            <span className="pagination-item" key={page}>
              {showGap && <span className="pagination-gap">…</span>}
              <button
                aria-current={page === currentPage ? "page" : undefined}
                className={page === currentPage ? "active" : ""}
                disabled={disabled}
                onClick={() => onPageChange(page)}
                type="button"
              >
                {page}
              </button>
            </span>
          );
        })}
      </div>

      <button
        disabled={disabled || currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        Next
      </button>
    </nav>
  );
}
