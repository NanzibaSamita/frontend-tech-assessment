const RETURNING_CUSTOMER_KEY = "ecommerce_has_placed_order";

export const customerStorage = {
  isReturningCustomer(): boolean {
    return localStorage.getItem(RETURNING_CUSTOMER_KEY) === "true";
  },

  markReturningCustomer(): void {
    localStorage.setItem(RETURNING_CUSTOMER_KEY, "true");
  },
};
