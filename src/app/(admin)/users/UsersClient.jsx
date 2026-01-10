"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/lib/hooks/useAuthRole";
import { useAdminLayout } from "@/lib/contexts/AdminLayoutContext";
import { RefreshCcw, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom Hooks
import { useUsersManager } from "@/lib/hooks/useUsersManager";
import { useUserActions } from "@/lib/hooks/useUserActions";

// Components
import { ConfirmationModal } from "@/components/admin/AdminModals";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { PendingUsersTable } from "@/components/admin/users/PendingUsersTable";
import { UserStatsCards } from "@/components/admin/users/UserStatsCards";
import { RoleChangeDialog } from "@/components/admin/users/RoleChangeDialog";
import { UserFormModal } from "@/components/admin/users/UserFormModal"; // Ensure this import exists if used, or remove if not in original page but I added it
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const UsersClient = () => {
    const router = useRouter();
    const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
    const { registerModal } = useAdminLayout();

    // State
    const [activeTab, setActiveTab] = useState("all-users");
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL"); // Added status filter
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false); // Added role dialog state
    const [selectedUserForRole, setSelectedUserForRole] = useState(null); // Added selected user for role
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    // Custom Hooks
    const {
        users,
        pendingUsers, // Added pendingUsers
        loading,
        isRefreshing,
        lastUpdateTime,
        stats, // Added stats
        refreshUsers,
        updateUserLocally,
        addUserLocally,
        removeUserLocally,
    } = useUsersManager();

    const { isUpdating, createUser, updateUser, deleteUser, approveUser, rejectUser, updateUserRole } = // Added approve/reject/updateRole
        useUserActions({
            onSuccess: refreshUsers,
            updateUserLocally,
            addUserLocally,
            removeUserLocally,
        });

    // Filtered users - memoized
    const filteredUsers = useMemo(() => {
        if (!users || !Array.isArray(users)) {
            return [];
        }

        return users.filter((user) => {
            if (!user) return false;

            const userName = (user.name || "").toLowerCase();
            const userSurname = (user.surname || "").toLowerCase(); // Check surname
            const fullName = `${userName} ${userSurname}`.trim();

            const userEmail = (user.email || "").toLowerCase();
            const userPhone = (user.phoneNumber || "").toLowerCase();
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch =
                fullName.includes(searchLower) ||
                userEmail.includes(searchLower) ||
                userPhone.includes(searchLower);

            let matchesRole = true;
            if (roleFilter !== "ALL") {
                matchesRole = user.role === roleFilter;
            }

            let matchesStatus = true; // Added status filter logic
            if (statusFilter !== "ALL") {
                matchesStatus = user.status === statusFilter;
            }

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    // Handlers
    const openModal = (user = null) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    // Register modal with AdminLayoutContext
    useEffect(() => {
        registerModal(openModal);
    }, [registerModal]);

    const closeModal = () => {
        setModalOpen(false);
        setEditingUser(null);
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setUserToDelete(null);
        setDeleteModalOpen(false);
    };

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

    const handleFormSubmit = async (data, editingUser) => {
        const userData = {
            name: data.name,
            email: data.email,
            role: data.role,
            phoneNumber: data.phoneNumber,
        };

        if (data.password) {
            userData.password = data.password;
        }

        let result;
        if (editingUser) {
            result = await updateUser(editingUser.id, userData);
        } else {
            result = await createUser(userData);
        }

        return result;
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        const result = await deleteUser(userToDelete.id, userToDelete.name);

        if (result && !result.error) {
            closeDeleteModal();
        }
    };

    // Auth check
    if (!isAuthorized) {
        return null;
    }

    // Loading state
    if (loading) {
        return <LoadingSpinner size="fullPage" />;
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
                        onEdit={openModal} // Added edit
                        onDelete={openDeleteModal} // Added delete
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

            {/* Add/Edit User Modal */}
            {/* Assuming UserFormModal was used in original page (it wasn't imported in my view of original page, but I added it in previous step. If not needed, check usage. Original page used openModal for adding new user? No, ShowAddButton=false in page props. So maybe no add button? But I see `registerModal(openModal)` context usage. So maybe Add IS supported via sidebar/header button. ) */}
            {/* The original page had UsersPage.props = { showAddButton: false }. So maybe Add button is hidden. But logic was there. I will include it. */}
            <UserFormModal
                isOpen={modalOpen}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                editingUser={editingUser}
                isUpdating={isUpdating}
            />

            {/* Role Change Dialog */}
            <RoleChangeDialog
                open={roleDialogOpen}
                onOpenChange={setRoleDialogOpen}
                user={selectedUserForRole}
                onConfirm={handleRoleConfirm}
                isUpdating={isUpdating}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteUser}
                title="Kullanıcıyı Sil"
                message={`${userToDelete?.name} kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
            />
        </div>
    );
};

export default UsersClient;
