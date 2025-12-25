import { useState, useCallback, useRef, useEffect } from "react";
import { instance } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";

/**
 * Kullanıcı işlemleri için hook
 * - Approve user
 * - Reject user
 * - Update user role
 * Memory leak koruması ve optimistic updates içerir
 */
export const useUserActions = ({ onSuccess, updateUserLocally, removeUserLocally }) => {
    const { toast } = useToast();

    // State
    const [isUpdating, setIsUpdating] = useState(false);

    // Refs
    const mountedRef = useRef(true);
    const updateInProgressRef = useRef(false);

    /**
     * Kullanıcıyı onayla
     */
    const approveUser = useCallback(
        async (userId, userName) => {
            // Eşzamanlı güncelleme engelleme
            if (updateInProgressRef.current) {
                console.log("⚠️ Update already in progress, skipping");
                return;
            }

            updateInProgressRef.current = true;
            setIsUpdating(true);

            // Optimistic update
            updateUserLocally(userId, { status: "ACTIVE" });

            try {
                console.log(`✅ Approving user: ${userName} (${userId})`);
                await instance.post(`/admin/users/${userId}/approve`);

                if (!mountedRef.current) return;

                console.log("✅ User approved successfully");
                toast({
                    title: "Başarılı",
                    description: `${userName} kullanıcısı onaylandı`,
                });

                // Backend'den güncel veriyi al
                if (onSuccess) {
                    onSuccess();
                }
            } catch (error) {
                if (!mountedRef.current) return;

                console.error("❌ Approve user error:", error);

                // Rollback optimistic update
                updateUserLocally(userId, { status: "PENDING" });

                toast({
                    title: "Hata",
                    description: "Kullanıcı onaylanamadı",
                    variant: "destructive",
                });
            } finally {
                if (mountedRef.current) {
                    setIsUpdating(false);
                }
                updateInProgressRef.current = false;
            }
        },
        [updateUserLocally, toast, onSuccess]
    );

    /**
     * Kullanıcıyı reddet
     */
    const rejectUser = useCallback(
        async (userId, userName) => {
            if (updateInProgressRef.current) {
                console.log("⚠️ Update already in progress, skipping");
                return;
            }

            // Onay iste
            const confirmed = window.confirm(
                `${userName} kullanıcısını reddetmek istediğinizden emin misiniz?`
            );
            if (!confirmed) return;

            updateInProgressRef.current = true;
            setIsUpdating(true);

            // Optimistic update
            updateUserLocally(userId, { status: "REJECTED" });

            try {
                console.log(`❌ Rejecting user: ${userName} (${userId})`);
                await instance.post(`/admin/users/${userId}/reject`);

                if (!mountedRef.current) return;

                console.log("✅ User rejected successfully");
                toast({
                    title: "Başarılı",
                    description: `${userName} kullanıcısı reddedildi`,
                });

                if (onSuccess) {
                    onSuccess();
                }
            } catch (error) {
                if (!mountedRef.current) return;

                console.error("❌ Reject user error:", error);

                // Rollback
                updateUserLocally(userId, { status: "PENDING" });

                toast({
                    title: "Hata",
                    description: "Kullanıcı reddedilemedi",
                    variant: "destructive",
                });
            } finally {
                if (mountedRef.current) {
                    setIsUpdating(false);
                }
                updateInProgressRef.current = false;
            }
        },
        [updateUserLocally, toast, onSuccess]
    );

    /**
     * Kullanıcı rolünü güncelle
     */
    const updateUserRole = useCallback(
        async (userId, newRole, userName) => {
            if (updateInProgressRef.current) {
                console.log("⚠️ Update already in progress, skipping");
                return;
            }

            updateInProgressRef.current = true;
            setIsUpdating(true);

            // Önceki rolü sakla (rollback için)
            const previousRole = null; // Bu değer component'ten gelecek

            // Optimistic update
            updateUserLocally(userId, { role: newRole });

            try {
                console.log(`🔄 Updating user ${userId} role to ${newRole}`);
                await instance.put(`/admin/users/${userId}/role?role=${newRole}`);

                if (!mountedRef.current) return;

                console.log("✅ User role updated successfully");
                toast({
                    title: "Başarılı",
                    description: `${userName || "Kullanıcı"} rolü güncellendi`,
                });

                if (onSuccess) {
                    onSuccess();
                }

                return { success: true };
            } catch (error) {
                if (!mountedRef.current) return { success: false };

                console.error("❌ Update user role error:", error);

                // Rollback
                if (previousRole) {
                    updateUserLocally(userId, { role: previousRole });
                }

                toast({
                    title: "Hata",
                    description: "Kullanıcı rolü güncellenemedi",
                    variant: "destructive",
                });

                return { success: false };
            } finally {
                if (mountedRef.current) {
                    setIsUpdating(false);
                }
                updateInProgressRef.current = false;
            }
        },
        [updateUserLocally, toast, onSuccess]
    );

    // Cleanup
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            updateInProgressRef.current = false;
        };
    }, []);

    return {
        isUpdating,
        approveUser,
        rejectUser,
        updateUserRole,
    };
};
