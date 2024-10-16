"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

type sessionProps = {
  children: React.ReactNode;
};

function NextAuthSessionProvider({ children }: sessionProps) {
  return (
    <SessionProvider refetchOnWindowFocus={true}>{children}</SessionProvider>
  );
}

export default NextAuthSessionProvider;
