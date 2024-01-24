import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  loggedInUsername: string | null;
  setLoggedInUsername: (username: string | null) => void;
  userGroup: string;
  setUserGroup: (group: string) => void;
  isResearcher: boolean;
  setIsResearcher: (group: boolean) => void;
  researcher: string;
  setResearcher: (group: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  initialState?: {
    username?: string | null;
    group?: string | null;
    researcher?: string | null;
  };
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialState }) => {
  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(initialState?.username || null);
  const [userGroup, setUserGroup] = useState<string>(initialState?.group || 'dev');
  const [isResearcher, setIsResearcher] = useState<boolean>(false);
  const [researcher, setResearcher] = useState<string>(initialState?.researcher || 'r');

  return (
    <AuthContext.Provider value={{ loggedInUsername, setLoggedInUsername, userGroup, setUserGroup, isResearcher, setIsResearcher, researcher, setResearcher }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
