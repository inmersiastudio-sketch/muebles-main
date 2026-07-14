"use client";

import { ReactNode } from "react";
import { ToastProvider } from "../../context/ToastContext";
import { ToastContainer } from "../ui/ToastContainer";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
