"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/hooks/use-auth-role";
import { RefreshCcw, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SecondaryLoading from "@/components/secondaryLoading";

// Custom Hooks
import { useUsersManager } from "@/hooks/use-users-manager";
import { useUserActions } from "@/hooks/use-user-actions";

// User Components
import { UserStatsCards } from "@/components/admin/users/UserStatsCards";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { PendingUsersTable } from "@/components/admin/users/PendingUsersTable";
import { RoleChangeDialog } from "@/components/admin/users/RoleChangeDialog";

const UsersPage = () => {
  // Auth
  const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState("all-users");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // Custom Hooks
  const {
    users,
    pendingUsers,
    loading,
    isRefreshing,
    lastUpdateTime,
    stats,
    refreshUsers,
    updateUserLocally,
    removeUserLocally,
  } = useUsersManager();

  const { isUpdating, approveUser, rejectUser, updateUserRole } =
    useUserActions({
      onSuccess: refreshUsers,
      updateUserLocally,
      removeUserLocally,
    });

  // Filtered users - memoized
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = [...users];

    // Role filter
    if (roleFilter !== "ALL") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((user) => {
        const name = `${user.name} ${user.surname}`.toLowerCase();
        const email = (user.email || "").toLowerCase();
        const phone = (user.phoneNumber || "").toLowerCase();

        return (
          name.includes(search) ||
          email.includes(search) ||
          phone.includes(search)
        );
      });
    }

    return filtered;
  }, [users, roleFilter, statusFilter, searchTerm]);

  // Handlers
  const handleRoleChange = (user) => {
    setSelectedUserForRole(user);
    setRoleDialogOpen(true);
  };

  const handleRoleConfirm = async (newRole) => {
    if (selectedUserForRole) {
      const result = await updateUserRole(
        selectedUserForRole.id,
        newRole,
        `${selectedUserForRole.name} ${selectedUserForRole.surname}`
      );

      if (result?.success) {
        setRoleDialogOpen(false);
        setSelectedUserForRole(null);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Admin layout props
  UsersPage.props = {
    title: "Kullanıcılar",
    activePage: "users",
    showAddButton: false,
  };

  // Loading state
  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return <SecondaryLoading size="fullPage" />;
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-lightgray">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-darkgray font-Quattrocento_Sans">
              Kullanıcı Yönetimi
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-Barlow">
              Tüm kullanıcıları görüntüleyin ve yönetin
              {lastUpdateTime && (
                <span className="ml-2">
                  • Son güncelleme: {formatDate(lastUpdateTime)}
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={refreshUsers}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Yenileniyor..." : "Yenile"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStatsCards stats={stats} />

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
        onReset={handleResetFilters}
      />

      {/* Tabs */}
      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-users" className="font-Barlow">
            <Users size={16} className="mr-2" />
            Tüm Kullanıcılar
            {filteredUsers && filteredUsers.length > 0 && (
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                {filteredUsers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending-users" className="font-Barlow">
            <AlertTriangle size={16} className="mr-2" />
            Onay Bekleyenler
            {pendingUsers && pendingUsers.length > 0 && (
              <span className="ml-2 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ALL USERS TAB */}
        <TabsContent value="all-users" className="space-y-4">
          <UsersTable
            users={filteredUsers}
            onApprove={approveUser}
            onReject={rejectUser}
            onRoleChange={handleRoleChange}
            isUpdating={isUpdating}
            loading={loading}
          />
        </TabsContent>

        {/* PENDING USERS TAB */}
        <TabsContent value="pending-users" className="space-y-4">
          <PendingUsersTable
            users={pendingUsers}
            onApprove={approveUser}
            onReject={rejectUser}
            isUpdating={isUpdating}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Role Change Dialog */}
      <RoleChangeDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        user={selectedUserForRole}
        onConfirm={handleRoleConfirm}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default UsersPage;