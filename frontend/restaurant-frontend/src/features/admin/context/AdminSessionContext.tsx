import { createContext, useContext } from "react";

export type AdminSessionContextType = {
  adminKey: string;
  setAdminKey: React.Dispatch<React.SetStateAction<string>>;
};

export const AdminSessionContext = createContext<AdminSessionContextType | null>(null);

export function useAdminSession() {
  const context = useContext(AdminSessionContext);

  if (!context) {
    throw new Error("useAdminSession must be used within AdminLayout.");
  }

  return context;
}