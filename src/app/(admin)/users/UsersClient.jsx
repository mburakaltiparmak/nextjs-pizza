"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/lib/hooks/useAuthRole";
import { useAdminLayout } from "@/lib/contexts/AdminLayoutContext";
import { RefreshCcw, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
    fetchAllUsers,
    fetchPendingUsers,
    fetchDashboard,
    createUser,
    updateUser,
    deleteUser,
    approveUser,
    rejectUser,
    updateUserRole
} from "@/lib/store/actions/adminActions";
import { Pagination } from "@/components/ui/Pagination";
import { fetchStates } from "@/lib/store/constants";

// Custom Hooks
import { useModal } from "@/lib/hooks/admin/useModal";
import { useAdminCRUD } from "@/lib/hooks/admin/useAdminCRUD";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { TIMEOUTS } from "@/lib/utils/adminConstants";

// Components
import { ConfirmationModal } from "@/components/admin/modals";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { PendingUsersTable } from "@/components/admin/users/PendingUsersTable";
import { RoleChangeDialog } from "@/components/admin/users/RoleChangeDialog";
import { UserFormModal } from "@/components/admin/users/UserFormModal";

const UsersClient = () => {
    const router = useRouter();
    const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
    const { registerModal } = useAdminLayout();
    const dispatch = useAppDispatch();

    // Modals
    const editModal = useModal();
    const deleteModal = useModal();
    const roleDialog = useModal();

    // State
    const [activeTab, setActiveTab] = useState("all-users");
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Debounced search term for server-side search
    const debouncedSearchTerm = useDebounce(searchTerm, TIMEOUTS.DEBOUNCE);

    // Redux selectors
    const users = useAppSelector((state) => state.admin.users.all);
    const pendingUsers = useAppSelector((state) => state.admin.users.pending);
    const pagination = useAppSelector((state) => state.admin.users.pagination);
    const adminFetchState = useAppSelector((state) => state.admin.users.fetchState);
    const globalLoading = useAppSelector((state) => state.global.loading);

    // CRUD operations
    const { create, update, remove } = useAdminCRUD({
        createAction: createUser,
        updateAction: updateUser,
        deleteAction: deleteUser,
        refreshAction: () => refreshUsers()
    });

    // Fetch dashboard data on mount
    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    // Handle tab change & Initial Fetch
    useEffect(() => {
        setIsInitialLoad(true);

        let promise;
        if (activeTab === "pending-users") {
            promise = dispatch(fetchPendingUsers(0));
        } else {
            promise = dispatch(fetchAllUsers(0, 10, searchTerm));
        }

        promise.finally(() => setIsInitialLoad(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, dispatch]);

    // Refresh users
    const refreshUsers = () => {
        if (activeTab === "pending-users") {
            dispatch(fetchPendingUsers(pagination.page));
        } else {
            dispatch(fetchAllUsers(pagination.page, 10, searchTerm));
        }
    };

    // Register modal with AdminLayoutContext
    useEffect(() => {
        registerModal(editModal.open);
    }, [registerModal, editModal.open]);

    // Handlers
    const handleFormSubmit = async (data) => {
        const userData = {
            name: data.name,
            email: data.email,
            role: data.role,
            phoneNumber: data.phoneNumber,
        };

        if (data.password) {
            userData.password = data.password;
        }

        if (editModal.data) {
            await update(editModal.data.id, userData);
        } else {
            await create(userData);
        }

        editModal.close();
    };

    const handleDelete = async () => {
        if (deleteModal.data) {
            await remove(deleteModal.data.id);
            deleteModal.close();
        }
    };

    const handleRoleConfirm = async (newRole) => {
        if (roleDialog.data) {
            await dispatch(updateUserRole(roleDialog.data.id, newRole));
            roleDialog.close();
            refreshUsers();
        }
    };

    const handleApproveUser = async (userId) => {
        await dispatch(approveUser(userId));
        refreshUsers();
    };

    const handleRejectUser = async (userId) => {
        await dispatch(rejectUser(userId));
        refreshUsers();
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setRoleFilter("ALL");
        setStatusFilter("ALL");
    };

    // Search Handler - Server side with debounce
    useEffect(() => {
        if (activeTab === "all-users") {
            dispatch(fetchAllUsers(0, 10, debouncedSearchTerm));
        }
    }, [debouncedSearchTerm, dispatch, activeTab]);

    // Auth check
    if (!isAuthorized) {
        return null;
    }

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
                        <p className="text-sm text-gray-500 mt-1 font-Barlow flex items-center gap-2">
                            {isLoading ? (
                                <span className="h-4 w-48 bg-lightgray animate-pulse rounded inline-block"></span>
                            ) : (
                                <span>
                                    Tümü görüntüleniyor • Toplam: {pagination.size}
                                </span>
                            )}
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
                loading={isLoading}
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
                            {users.length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="pending-users" className="font-Barlow">
                        <AlertTriangle size={16} className="mr-2" />
                        Onay Bekleyenler
                        <span className="ml-2 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
                            {pendingUsers.length}
                        </span>
                    </TabsTrigger>
                </TabsList>

                {/* ALL USERS TAB */}
                <TabsContent value="all-users" className="space-y-4">
                    <UsersTable
                        users={users}
                        onApprove={handleApproveUser}
                        onReject={handleRejectUser}
                        onRoleChange={roleDialog.open}
                        onEdit={editModal.open}
                        onDelete={deleteModal.open}
                        isUpdating={globalLoading}
                        loading={isLoading}
                    />
                </TabsContent>

                {/* PENDING USERS TAB */}
                <TabsContent value="pending-users" className="space-y-4">
                    <PendingUsersTable
                        users={pendingUsers}
                        onApprove={handleApproveUser}
                        onReject={handleRejectUser}
                        isUpdating={globalLoading}
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
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                onSubmit={handleFormSubmit}
                editingUser={editModal.data}
                isUpdating={globalLoading}
            />

            {/* Role Change Dialog */}
            <RoleChangeDialog
                open={roleDialog.isOpen}
                onOpenChange={roleDialog.close}
                user={roleDialog.data}
                onConfirm={handleRoleConfirm}
                isUpdating={globalLoading}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Kullanıcıyı Sil"
                message={`${deleteModal.data?.name} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
            />
        </div>
    );
};

export default UsersClient;
