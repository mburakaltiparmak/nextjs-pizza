"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
    checkAuthStatus,
    fetchUserProfile,
} from "@/lib/store/actions/userActions";
import {
    clearMessages,
} from "@/lib/store/actions/globalActions";
import { fetchStates } from "@/lib/store/constants";
import { useToast } from "@/lib/hooks/useToast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"; // Updated import
import { ProfileInfoTab } from "@/components/profile/ProfileInfoTab";
import { PasswordChangeDialog } from "@/components/profile/PasswordChangeDialog";
import { AddressManagementTab } from "@/components/profile/AddressManagementTab";
import { OrderHistoryTab } from "@/components/profile/OrderHistoryTab";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"; // Updated hooks

// Helper action that doesn't exist in Redux yet (kept from original)
const setUserFetchState = (state) => ({
    type: "SET_USER_FETCH_STATE",
    payload: state,
});

const ProfilePageClient = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    // Redux state
    const isLogin = useAppSelector((state) => state.user.isLogin);
    const userEmail = useAppSelector((state) => state.user.email);
    const userProfile = useAppSelector((state) => state.user.profile);
    const userFetchState = useAppSelector((state) => state.user.fetchState);
    const error = useAppSelector((state) => state.global.error);

    // Local state
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    // Auth check and profile fetch
    useEffect(() => {
        let isMounted = true;

        const authCheck = async () => {
            if (userFetchState === fetchStates.FETCHING) {
                return;
            }

            if (!isLogin) {
                const authStatus = await dispatch(checkAuthStatus());

                if (!authStatus || !isMounted) {
                    router.push("/login");
                    return;
                }
            }

            if (
                isMounted &&
                (userFetchState === fetchStates.NOT_FETCHED || !userProfile) &&
                userFetchState !== fetchStates.FETCHING
            ) {
                try {
                    dispatch(setUserFetchState(fetchStates.FETCHING));
                    await dispatch(fetchUserProfile());
                    if (isMounted) {
                        dispatch(setUserFetchState(fetchStates.FETCHED));
                    }
                } catch (error) {
                    console.error("Profil bilgileri alınamadı:", error);
                    if (isMounted) {
                        dispatch(setUserFetchState(fetchStates.FAILED));
                    }
                }
            }
        };

        authCheck();

        return () => {
            isMounted = false;
        };
    }, [dispatch, isLogin, userFetchState, router, userProfile]);

    // Toast messages
    useEffect(() => {
        if (error) {
            toast({
                title: "Hata",
                description: error,
                variant: "destructive",
            });

            setTimeout(() => {
                dispatch(clearMessages());
            }, 100);
        }
    }, [error, dispatch, toast]);

    // Loading state
    if (
        userFetchState === fetchStates.FETCHING ||
        (userFetchState === fetchStates.NOT_FETCHED && isLogin)
    ) {
        return <LoadingSpinner size="fullPage" />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-center text-darkgray font-Barlow mb-8">
                    Hesabım
                </h1>

                <Tabs defaultValue="profile" className="w-full font-Barlow">
                    <TabsList className="w-full mb-6 grid grid-cols-3">
                        <TabsTrigger value="profile" className="text-darkgray">
                            Profil Bilgilerim
                        </TabsTrigger>
                        <TabsTrigger value="addresses" className="text-darkgray">
                            Adreslerim
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="text-darkgray">
                            Siparişlerim
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <ProfileInfoTab
                            userProfile={userProfile}
                            userEmail={userEmail}
                            onPasswordChange={() => setPasswordDialogOpen(true)}
                        />
                    </TabsContent>

                    <TabsContent value="addresses">
                        <AddressManagementTab />
                    </TabsContent>

                    <TabsContent value="orders">
                        <OrderHistoryTab />
                    </TabsContent>
                </Tabs>

                <PasswordChangeDialog
                    open={passwordDialogOpen}
                    onOpenChange={setPasswordDialogOpen}
                />
            </div>
        </div>
    );
};

export default ProfilePageClient;
