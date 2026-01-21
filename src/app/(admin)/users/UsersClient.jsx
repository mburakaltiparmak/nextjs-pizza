"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/lib/hooks/useAuthRole";
import { useAdminLayout } from "@/lib/contexts/AdminLayoutContext";
import { RefreshCcw, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom Hooks
// Removed useUsersManager
import { useUserActions } from "@/lib/hooks/useUserActions";

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchAllUsers, fetchPendingUsers, fetchDashboard } from "@/lib/store/actions/adminActions";
import { Pagination } from "@/components/ui/Pagination";
import { fetchStates } from "@/lib/store/constants";

// Components
import { ConfirmationModal } from "@/components/admin/AdminModals";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { PendingUsersTable } from "@/components/admin/users/PendingUsersTable";
import { RoleChangeDialog } from "@/components/admin/users/RoleChangeDialog";
import { UserFormModal } from "@/components/admin/users/UserFormModal"; // Ensure this import exists if used, or remove if not in original page but I added it
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const UsersClient = () => {
    const router = useRouter();
    const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
    const { registerModal } = useAdminLayout();
    const dispatch = useAppDispatch();

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

    const users = useAppSelector((state) => state.admin.allUsers);
    const pendingUsers = useAppSelector((state) => state.admin.pendingUsers);
    const pagination = useAppSelector((state) => state.admin.pagination);
    const adminFetchState = useAppSelector((state) => state.admin.fetchState);
    const dashboardData = useAppSelector((state) => state.admin.dashboardData);

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // Only fetch Dashboard once on mount
        dispatch(fetchDashboard());
    }, [dispatch]);

    // Handle tab change & Initial Fetch
    useEffect(() => {
        // Ensure loading when switching tabs or on initial load
        if (isInitialLoad) setIsInitialLoad(true);

        let promise;
        if (activeTab === "pending-users") {
            promise = dispatch(fetchPendingUsers(0));
        } else {
            promise = dispatch(fetchAllUsers(0, 10, searchTerm));
        }

        if (isInitialLoad) {
            promise.finally(() => setIsInitialLoad(false));
        }
    }, [activeTab, dispatch]); // activeTab changed

    const refreshUsers = () => {
        if (activeTab === "pending-users") {
            dispatch(fetchPendingUsers(pagination.page));
        } else {
            dispatch(fetchAllUsers(pagination.page, 10, searchTerm));
        }
    };

    const { isUpdating, createUser, updateUser, deleteUser, approveUser, rejectUser, updateUserRole } =
        useUserActions({
            onSuccess: refreshUsers,
        });



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
                refreshUsers();
            }
        }
    };

    // Search Handler - Server side
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (activeTab === "all-users") {
                dispatch(fetchAllUsers(0, 10, searchTerm));
            }
        }, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm, dispatch]);

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
            refreshUsers();
        }
    };

    // Auth check
    if (!isAuthorized) {
        return null;
    }

    const currentList = activeTab === "pending-users" ? pendingUsers : users;
    const isLoading = isInitialLoad || adminFetchState === fetchStates.FETCHING || adminFetchState === fetchStates.NOT_FETCHED;

    return (
        <div>
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-lightgray">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-darkgray font-Barlow">
                            Kullanıcı Yönetimi
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-Barlow">
                            Tüm kullanıcıları görüntüleyin ve yönetin
                            <span className="ml-2">
                                • Toplam: {pagination.totalElements}
                            </span>
                        </p>
                    </div>
                    <Button
                        onClick={refreshUsers}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                    >
                        <RefreshCcw
                            className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                        />
                        {isLoading ? "Yenileniyor..." : "Yenile"}
                    </Button>
                </div>
            </div>

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
                        <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                            {activeTab === "all-users" ? pagination.totalElements : ""}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="pending-users" className="font-Barlow">
                        <AlertTriangle size={16} className="mr-2" />
                        Onay Bekleyenler
                        <span className="ml-2 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
                            {activeTab === "pending-users" ? pagination.totalElements : ""}
                        </span>
                    </TabsTrigger>
                </TabsList>

                {/* ALL USERS TAB */}
                <TabsContent value="all-users" className="space-y-4">
                    <UsersTable
                        users={users}
                        onApprove={approveUser}
                        onReject={rejectUser}
                        onRoleChange={handleRoleChange}
                        onEdit={openModal} // Added edit
                        onDelete={openDeleteModal} // Added delete
                        isUpdating={isUpdating}
                        loading={isLoading}
                    />
                </TabsContent>

                {/* PENDING USERS TAB */}
                <TabsContent value="pending-users" className="space-y-4">
                    <PendingUsersTable
                        users={pendingUsers}
                        onApprove={approveUser}
                        onReject={rejectUser}
                        isUpdating={isUpdating}
                        loading={isLoading}
                    />
                </TabsContent>
            </Tabs>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (activeTab === "pending-users") {
                            dispatch(fetchPendingUsers(page));
                        } else {
                            dispatch(fetchAllUsers(page, 10, searchTerm));
                        }
                    }}
                />
            )}

            {/* Add/Edit User Modal */}
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
