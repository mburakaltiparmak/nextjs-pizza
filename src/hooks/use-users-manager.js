import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { instance } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";

/**
 * Users sayfası için optimize edilmiş veri yönetimi hook'u
 * Data fetching, caching, ve memory leak koruması içerir
 */
export const useUsersManager = () => {
    const { toast } = useToast();

    // State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);

    // Refs
    const mountedRef = useRef(true);
    const abortControllerRef = useRef(null);
    const initialFetchDoneRef = useRef(false);

    /**
     * API'den kullanıcıları getir
     */
    const fetchUsersFromAPI = useCallback(async (signal) => {
        try {
            const response = await instance.get("/admin/users", {
                signal,
            });
            return response.data;
        } catch (error) {
            // Abort veya cancel hataları sessizce geç
            if (error.name === "AbortError" || error.name === "CanceledError") {
                return null;
            }
            throw error;
        }
    }, []);

    /**
     * Kullanıcıları yükle
     */
    const fetchUsers = useCallback(
        async (silent = false) => {
            // Önceki isteği iptal et
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Yeni AbortController
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            // Loading state
            if (!silent) {
                if (initialFetchDoneRef.current) {
                    setIsRefreshing(true);
                } else {
                    setLoading(true);
                }
            }

            try {
                console.log("🔄 Fetching users...");
                const data = await fetchUsersFromAPI(abortController.signal);

                // Component unmount olduysa state güncelleme
                if (!mountedRef.current || data === null) return;

                setUsers(data);
                setLastUpdateTime(new Date());
                initialFetchDoneRef.current = true;

                console.log(`✅ Users fetched: ${data.length} items`);
            } catch (error) {
                if (!mountedRef.current) return;

                console.error("❌ Fetch users error:", error);
                toast({
                    title: "Hata",
                    description: "Kullanıcılar yüklenirken bir sorun oluştu",
                    variant: "destructive",
                });
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                    setIsRefreshing(false);
                }
                abortControllerRef.current = null;
            }
        },
        [fetchUsersFromAPI, toast]
    );

    /**
     * Manuel yenileme
     */
    const refreshUsers = useCallback(() => {
        console.log("🔄 Manual refresh triggered");
        fetchUsers(false);
    }, [fetchUsers]);

    /**
     * Local state'te kullanıcıyı güncelle
     */
    const updateUserLocally = useCallback((userId, updates) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId ? { ...user, ...updates } : user
            )
        );
    }, []);

    /**
     * Local state'ten kullanıcıyı kaldır
     */
    const removeUserLocally = useCallback((userId) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    }, []);

    /**
     * İstatistikler - memoized
     */
    const stats = useMemo(() => {
        if (!users || users.length === 0) {
            return {
                total: 0,
                active: 0,
                pending: 0,
                rejected: 0,
                locked: 0,
                byRole: {
                    ADMIN: 0,
                    PERSONAL: 0,
                    CUSTOMER: 0,
                    GUEST: 0,
                },
            };
        }

        return {
            total: users.length,
            active: users.filter((u) => u.status === "ACTIVE").length,
            pending: users.filter((u) => u.status === "PENDING").length,
            rejected: users.filter((u) => u.status === "REJECTED").length,
            locked: users.filter((u) => u.status === "LOCKED").length,
            byRole: {
                ADMIN: users.filter((u) => u.role === "ADMIN").length,
                PERSONAL: users.filter((u) => u.role === "PERSONAL").length,
                CUSTOMER: users.filter((u) => u.role === "CUSTOMER").length,
                GUEST: users.filter((u) => u.role === "GUEST").length,
            },
        };
    }, [users]);

    /**
     * Pending users - memoized
     */
    const pendingUsers = useMemo(() => {
        return users.filter((u) => u.status === "PENDING");
    }, [users]);

    // Initial fetch - sadece bir kere
    useEffect(() => {
        const initialFetch = async () => {
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            setLoading(true);

            try {
                console.log("🔄 Initial user fetch...");
                const response = await instance.get("/admin/users", {
                    signal: abortController.signal,
                });

                if (!mountedRef.current) return;

                setUsers(response.data);
                setLastUpdateTime(new Date());
                initialFetchDoneRef.current = true;

                console.log(`✅ Initial users loaded: ${response.data.length} items`);
            } catch (error) {
                if (!mountedRef.current) return;

                if (error.name === "AbortError" || error.name === "CanceledError") {
                    console.log("⏹️ Initial fetch aborted");
                    return;
                }

                console.error("❌ Initial fetch error:", error);
                toast({
                    title: "Hata",
                    description: "Kullanıcılar yüklenirken bir sorun oluştu",
                    variant: "destructive",
                });
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                }
                abortControllerRef.current = null;
            }
        };

        initialFetch();

        // Cleanup
        return () => {
            console.log("🧹 Cleanup: unmounting useUsersManager");
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty array - sadece mount'ta çalış

    return {
        users,
        pendingUsers,
        loading,
        isRefreshing,
        lastUpdateTime,
        stats,
        refreshUsers,
        updateUserLocally,
        removeUserLocally,
    };
};
