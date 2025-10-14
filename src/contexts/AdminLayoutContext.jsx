"use client";

import { createContext, useContext, useState, useCallback } from "react";

const AdminLayoutContext = createContext(null);

export function AdminLayoutProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    onOpen: null,
  });

  const registerModal = useCallback((onOpen) => {
    setModalState((prev) => ({ ...prev, onOpen }));
  }, []);

  const openModal = useCallback(() => {
    if (modalState.onOpen) {
      modalState.onOpen();
    }
  }, [modalState.onOpen]);

  const value = {
    registerModal,
    openModal,
  };

  return (
    <AdminLayoutContext.Provider value={value}>
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  }
  return context;
}