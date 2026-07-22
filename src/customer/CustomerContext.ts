import { createContext } from "react";

export interface CustomerContextValue {
  isReturningCustomer: boolean;
  markOrderPlaced: () => void;
}

export const CustomerContext = createContext<CustomerContextValue | undefined>(
  undefined,
);
