"use client";
import Navbar from "@/components/admin/Navbar";
import { ErrorMessage, LoadingSpinner, NotificationManager } from "@/components/admin/notify";
import Sidebar from "@/components/admin/Sidebar";
import { useState } from "react";

// Ana Layout bileşeni
const AdminLayout = ({
  children,
  title,
  activePage,
  loading = false,
  error = null,
  notifications = [],
  onNotificationClose,
  showAddButton = false,
  addButtonText = "Yeni Ekle",
  onAddButtonClick
}) => {
  return (
    <div className="flex h-screen font-Quattrocento_Sans bg-gray-50">
      {/* Sidebar */}
      <Sidebar activePage={activePage} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          title={title} 
          showAddButton={showAddButton} 
          addButtonText={addButtonText} 
          onAddButtonClick={onAddButtonClick} 
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Bildirimler */}
          {notifications && notifications.length > 0 && (
            <NotificationManager
              notifications={notifications} 
              onClose={onNotificationClose} 
            />
          )}

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;