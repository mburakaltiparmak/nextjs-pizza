import { User, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Pending Users Table Component
 * Specialized table for pending approval users (responsive)
 */
export const PendingUsersTable = ({
    users,
    onApprove,
    onReject,
    isUpdating,
    loading,
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500 font-Barlow">Yükleniyor...</p>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-lightgray">
                <p className="text-gray-500 font-Barlow">
                    Onay bekleyen kullanıcı bulunmamaktadır
                </p>
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
                                    İletişim
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                                    Kayıt Tarihi
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
                                            <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 font-Barlow">
                                                    {user.name} {user.surname}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-Barlow">
                                            {user.email}
                                        </div>
                                        <div className="text-sm text-gray-500 font-Barlow">
                                            {user.phoneNumber || "Telefon yok"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-Barlow">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            <Button
                                                onClick={() =>
                                                    onApprove(user.id, `${user.name} ${user.surname}`)
                                                }
                                                disabled={isUpdating}
                                                className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <UserCheck size={16} className="mr-1" />
                                                Onayla
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    onReject(user.id, `${user.name} ${user.surname}`)
                                                }
                                                disabled={isUpdating}
                                                variant="destructive"
                                                className="inline-flex items-center px-3 py-1 text-xs font-medium"
                                            >
                                                <UserX size={16} className="mr-1" />
                                                Reddet
                                            </Button>
                                        </div>
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
                        className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4"
                    >
                        {/* User Info */}
                        <div className="flex items-start space-x-3 mb-3">
                            <div className="flex-shrink-0 h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <User className="h-7 w-7 text-yellow-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 font-Barlow">
                                    {user.name} {user.surname}
                                </h3>
                                <p className="text-xs text-gray-500 font-Barlow truncate">
                                    {user.email}
                                </p>
                                <p className="text-xs text-gray-400 font-Barlow">
                                    {user.phoneNumber || "Telefon yok"}
                                </p>
                            </div>
                        </div>

                        {/* Registration Date */}
                        <div className="text-xs text-gray-500 font-Barlow mb-3">
                            <span className="font-medium">Kayıt:</span>{" "}
                            {formatDate(user.createdAt)}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <Button
                                onClick={() =>
                                    onApprove(user.id, `${user.name} ${user.surname}`)
                                }
                                disabled={isUpdating}
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium bg-green-600 hover:bg-green-700 text-white"
                            >
                                <UserCheck size={16} className="mr-1" />
                                Onayla
                            </Button>
                            <Button
                                onClick={() =>
                                    onReject(user.id, `${user.name} ${user.surname}`)
                                }
                                disabled={isUpdating}
                                variant="destructive"
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium"
                            >
                                <UserX size={16} className="mr-1" />
                                Reddet
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};
