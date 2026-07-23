import { useContext } from "react";
import {
  CustomerContext,
  type CustomerContextValue,
} from "./CustomerContext";

export function useCustomer(): CustomerContextValue {
  const context = useContext(CustomerContext);

  if (!context) {
    throw new Error("useCustomer must be used inside CustomerProvider.");
  }

  return context;
}
