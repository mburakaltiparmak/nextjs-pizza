"use client";

import { GlobalLoadingOverlay } from "@/components/ui/GlobalLoadingOverlay";
import { useState, useEffect } from "react";
import Loading from "@/app/loading";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { userRoles } from "@/lib/store/constants";
import { useMobileDetection } from "@/lib/hooks/useMobileDetection";
import { AdminLayoutProvider, useAdminLayout } from "@/lib/contexts/AdminLayoutContext";
import AdminNavbar from "@/components/layout/AdminNavbar";
import AdminSidebar from "@/components/layout/AdminSidebar";

function AdminLayoutContent({ children }) {
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { isLogin, role } = useSelector((state) => state.user);
    const isMobile = useMobileDetection(768);
    const { openModal } = useAdminLayout();

    const getActivePageFromPath = (path) => {
        if (path.includes("/dashboard")) return "dashboard";
        if (path.includes("/category")) return "category";
        if (path.includes("/product")) return "product";
        if (path.includes("/orders-admin")) return "orders-admin";
        if (path.includes("/users")) return "users";
        if (path.includes("/settings")) return "settings";
        return "dashboard";
    };

    const activePage = getActivePageFromPath(pathname);

    const getPageConfig = (path) => {
        const configs = {
            "/dashboard": {
                title: "Dashboard",
                showAddButton: false,
            },
            "/category": {
                title: "Kategoriler",
                showAddButton: true,
                addButtonText: "Yeni Kategori",
            },
            "/product": {
                title: "Ürünler",
                showAddButton: true,
                addButtonText: "Yeni Ürün",
            },
            "/orders-admin": {
                title: "Siparişler",
                showAddButton: false,
            },
            "/users": {
                title: "Kullanıcılar",
                showAddButton: false,
            },
            "/settings": {
                title: "Ayarlar",
                showAddButton: false,
            },
        };

        for (const [route, config] of Object.entries(configs)) {
            if (path.includes(route)) {
                return config;
            }
        }

        return { title: "Admin Panel", showAddButton: false };
    };

    const pageConfig = getPageConfig(pathname);

    useEffect(() => {
        setIsMounted(true);

        if (!isLogin) {
            router.push("/login");
            return;
        }

        const allowedRoles = [userRoles.ADMIN, userRoles.PERSONAL];
        if (!allowedRoles.includes(role)) {
            router.push("/");
            return;
        }
    }, [isLogin, role, router]);

    if (!isMounted || !isLogin || ![userRoles.ADMIN, userRoles.PERSONAL].includes(role)) {
        return <Loading />;
    }

    return (
        <div className="flex flex-col md:flex-row h-screen font-Barlow bg-lightgray">
            <GlobalLoadingOverlay />
            <AdminSidebar activePage={activePage} isMobile={isMobile} />

            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <AdminNavbar
                    title={pageConfig.title}
                    showAddButton={pageConfig.showAddButton}
                    addButtonText={pageConfig.addButtonText || "Yeni Ekle"}
                    onAddButtonClick={openModal}
                    isMobile={isMobile}
                />

                <main className="flex-1 overflow-y-auto p-3 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayoutClient({ children }) {
    return (
        <AdminLayoutProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminLayoutProvider>
    );
}


