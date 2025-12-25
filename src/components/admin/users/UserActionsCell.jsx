import { UserCheck, UserX, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * User Actions Cell Component
 * Reusable action buttons for user management
 */
export const UserActionsCell = ({
    user,
    onApprove,
    onReject,
    onRoleChange,
    isUpdating,
    isPending = false,
}) => {
    return (
        <div className="flex justify-end space-x-2">
            {/* Approve/Reject buttons for pending users */}
            {isPending && (
                <>
                    <button
                        onClick={() => onApprove(user.id, `${user.name} ${user.surname}`)}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={isUpdating}
                        title="Kullanıcıyı Onayla"
                    >
                        <UserCheck size={18} />
                    </button>
                    <button
                        onClick={() => onReject(user.id, `${user.name} ${user.surname}`)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={isUpdating}
                        title="Kullanıcıyı Reddet"
                    >
                        <UserX size={18} />
                    </button>
                </>
            )}

            {/* Role change button */}
            <button
                onClick={() => onRoleChange(user)}
                className="text-blue-600 hover:text-blue-900 transition-colors"
                title="Rolü Değiştir"
            >
                <Shield size={18} />
            </button>
        </div>
    );
};
