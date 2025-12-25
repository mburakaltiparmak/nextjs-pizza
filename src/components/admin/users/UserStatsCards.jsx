import { Users, UserCheck, UserX, Shield } from "lucide-react";

/**
 * User Statistics Cards Component
 * Displays overview statistics for users
 */
export const UserStatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Users */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-lightgray">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 font-Barlow">
                            Toplam Kullanıcı
                        </p>
                        <p className="text-2xl font-bold text-darkgray font-Quattrocento_Sans mt-1">
                            {stats.total}
                        </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-lightgray">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 font-Barlow">
                            Aktif Kullanıcı
                        </p>
                        <p className="text-2xl font-bold text-green-600 font-Quattrocento_Sans mt-1">
                            {stats.active}
                        </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                        <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Pending Users */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-lightgray">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 font-Barlow">
                            Onay Bekleyen
                        </p>
                        <p className="text-2xl font-bold text-yellow-600 font-Quattrocento_Sans mt-1">
                            {stats.pending}
                        </p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                        <UserX className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* Admin Users */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-lightgray">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 font-Barlow">
                            Admin Kullanıcı
                        </p>
                        <p className="text-2xl font-bold text-purple-600 font-Quattrocento_Sans mt-1">
                            {stats.byRole.ADMIN}
                        </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                        <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};
