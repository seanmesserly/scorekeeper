import { StoredUser, storedUserSchema } from "@lib/types";
import { useState } from "react";

type ReturnType = {
  user: StoredUser | null;
  updateUser: (user: StoredUser) => void;
  logout: () => void;
};

const LS_KEY = "user";

// useUser allows working with a user session
export const useUser = (): ReturnType => {
  const [user, setUser] = useState<StoredUser | null>(loadUser());

  const updateUser = (user: StoredUser): void => {
    localStorage.setItem(LS_KEY, JSON.stringify(user));
    setUser(user);
  };
  const logout = (): void => {
    localStorage.removeItem(LS_KEY);
    setUser(null);
  };

  return {
    user,
    updateUser,
    logout,
  };
};

const loadUser = (): StoredUser | null => {
  const userString = localStorage.getItem(LS_KEY);
  if (!userString) {
    return null;
  }
  const result = storedUserSchema.safeParse(JSON.parse(userString));
  if (!result.success) {
    return null;
  }
  return result.data;
};
