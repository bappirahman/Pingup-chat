"use client";

import { User } from "@/types";
import { createContext, ReactNode, useState } from "react";

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AppProviderProps {
  children: ReactNode;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  return (
    <AppContext.Provider value={{ user, setUser, isAuth, setIsAuth, loading }}>
      {children}
    </AppContext.Provider>
  );
};
