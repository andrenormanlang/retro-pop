'use client';
// contexts/AvatarContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type AvatarContextType = {
  avatarUrl: string | null;
  setAvatarUrl: (url: string) => void;
};

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider = ({ children }: { children: ReactNode }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  return (
    <AvatarContext.Provider value={{ avatarUrl, setAvatarUrl }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};
