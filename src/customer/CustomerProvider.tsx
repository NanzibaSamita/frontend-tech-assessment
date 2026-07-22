import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { customerStorage } from "../utils/customerStorage";
import { CustomerContext } from "./CustomerContext";

export function CustomerProvider({ children }: PropsWithChildren) {
  const [isReturningCustomer, setIsReturningCustomer] = useState(() =>
    customerStorage.isReturningCustomer(),
  );

  const markOrderPlaced = useCallback(() => {
    customerStorage.markReturningCustomer();
    setIsReturningCustomer(true);
  }, []);

  const value = useMemo(
    () => ({ isReturningCustomer, markOrderPlaced }),
    [isReturningCustomer, markOrderPlaced],
  );

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}
