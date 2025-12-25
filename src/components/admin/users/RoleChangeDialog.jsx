import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "./UserBadges";
import { useState, useEffect } from "react";

/**
 * Role Change Dialog Component
 * Modal for updating user role
 */
export const RoleChangeDialog = ({
    open,
    onOpenChange,
    user,
    onConfirm,
    isUpdating,
}) => {
    const [selectedRole, setSelectedRole] = useState(user?.role || "");

    // Update selected role when user changes
    useEffect(() => {
        if (user?.role) {
            setSelectedRole(user.role);
        }
    }, [user]);

    const handleConfirm = () => {
        if (selectedRole && selectedRole !== user?.role) {
            onConfirm(selectedRole);
        }
    };

    if (!user) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-Quattrocento_Sans">
                        Kullanıcı Rolünü Değiştir
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-Barlow">
                        {user.name} {user.surname} kullanıcısının rolünü değiştirin
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <div className="mb-4">
                        <p className="text-sm font-medium mb-2 font-Barlow">Mevcut Rol</p>
                        <RoleBadge role={user.role} />
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-2 font-Barlow">Yeni Rol</p>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-full font-Barlow">
                                <SelectValue placeholder="Rol seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="PERSONAL">Personel</SelectItem>
                                <SelectItem value="CUSTOMER">Müşteri</SelectItem>
                                <SelectItem value="GUEST">Misafir</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel className="font-Barlow">İptal</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isUpdating || selectedRole === user.role}
                        onClick={handleConfirm}
                        className="bg-red hover:bg-yellow hover:text-red font-Barlow"
                    >
                        {isUpdating ? "Değiştiriliyor..." : "Değiştir"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
