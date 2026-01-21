import { User } from "lucide-react";
import { StatusBadge, RoleBadge } from "./UserBadges";
import { UserActionsCell } from "./UserActionsCell";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

/**
 * Users Table Component
 * Displays all users in table format (desktop) and cards (mobile)
 */
export const UsersTable = ({
    users,
    onApprove,
    onReject,
    onRoleChange,
    isUpdating,
    loading,
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return "Hiç giriş yapmadı";
        return new Date(dateString).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return <TableSkeleton rowCount={8} columnCount={5} />;
    }

    if (!users || users.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-lightgray">
                <p className="text-gray-500 font-Barlow">Kullanıcı bulunamadı</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block bg-white shadow-sm rounded-xl overflow-hidden border border-lightgray">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                    Kullanıcı
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                    Durum
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                    Son Giriş
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-gray-500" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 font-Barlow">
                                                    {user.name} {user.surname}
                                                </div>
                                                <div className="text-sm text-gray-500 font-Barlow">
                                                    {user.email}
                                                </div>
                                                {user.phoneNumber && (
                                                    <div className="text-xs text-gray-400 font-Barlow">
                                                        {user.phoneNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={user.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-Barlow">
                                        {formatDate(user.lastLoginAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <UserActionsCell
                                            user={user}
                                            onApprove={onApprove}
                                            onReject={onReject}
                                            onRoleChange={onRoleChange}
                                            isUpdating={isUpdating}
                                            isPending={user.status === "PENDING"}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View - Hidden on desktop */}
            <div className="md:hidden space-y-4">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="bg-white rounded-xl shadow-sm border border-lightgray p-4"
                    >
                        {/* User Info */}
                        <div className="flex items-start space-x-3 mb-3">
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-7 w-7 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 font-Barlow truncate">
                                    {user.name} {user.surname}
                                </h3>
                                <p className="text-xs text-gray-500 font-Barlow truncate">
                                    {user.email}
                                </p>
                                {user.phoneNumber && (
                                    <p className="text-xs text-gray-400 font-Barlow">
                                        {user.phoneNumber}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Status and Role */}
                        <div className="flex items-center space-x-2 mb-3">
                            <StatusBadge status={user.status} />
                            <RoleBadge role={user.role} />
                        </div>

                        {/* Last Login */}
                        <div className="text-xs text-gray-500 font-Barlow mb-3">
                            <span className="font-medium">Son Giriş:</span>{" "}
                            {formatDate(user.lastLoginAt)}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-3 border-t border-gray-100">
                            <UserActionsCell
                                user={user}
                                onApprove={onApprove}
                                onReject={onReject}
                                onRoleChange={onRoleChange}
                                isUpdating={isUpdating}
                                isPending={user.status === "PENDING"}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};
