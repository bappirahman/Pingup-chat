"use client";

import { Chats, User } from "@/types";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import {
  CHAT_ALL_URL,
  USER_ALL_URL,
  USER_PROFILE_URL,
} from "@/lib/apiEndPoints";
import toast from "react-hot-toast";

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchChats: () => Promise<void>;
  chats: Chats[] | null;
  users: User[] | null;
  setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
}

interface AppProviderProps {
  children: ReactNode;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, skipping API call");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(USER_PROFILE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data.user);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  async function logoutUser() {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    toast.success("Logout succesfully");
  }

  const [chats, setChats] = useState<Chats[] | null>(null);
  async function fetchChats() {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("user is not logged in");
      return;
    }
    try {
      const { data } = await axios.get(CHAT_ALL_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChats(data.chats);
    } catch (error) {
      console.error(error);
    }
  }

  const [users, setUsers] = useState<User[] | null>(null);
  async function fetchUsers() {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("user is not logged in");
      return;
    }
    try {
      const { data } = await axios.get(USER_ALL_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(data.users);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchUser();
    fetchChats();
    fetchUsers();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        fetchChats,
        fetchUsers,
        users,
        chats,
        setChats,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(
      "useAppData must be wrapped within an AppProvider to access the context"
    );
  }
  return context;
};
