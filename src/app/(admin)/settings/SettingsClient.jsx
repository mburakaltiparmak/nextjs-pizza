"use client";

import { useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { reindexOrders, reindexProducts, reindexCategories, reindexUsers } from "@/lib/store/actions/adminActions";
import { useToast } from "@/lib/hooks/useToast";
import { Database, RefreshCw, AlertTriangle, Info, Package, ListOrdered, User, ShoppingCart } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/admin/AdminModals";

export default function SettingsClient() {
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    const [loadingState, setLoadingState] = useState({
        orders: false,
        products: false,
        categories: false,
        users: false
    });

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null,
        title: "",
        message: ""
    });

    const handleReindexClick = (type, label) => {
        setConfirmModal({
            isOpen: true,
            type,
            title: `${label} İndekslensin mi?`,
            message: `${label} veritabanından okunup arama motoruna yeniden yazılacak. Bu işlem zaman alabilir.`
        });
    };

    const performReindex = async () => {
        const type = confirmModal.type;
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setLoadingState(prev => ({ ...prev, [type]: true }));

        try {
            let action;
            switch (type) {
                case 'orders': action = reindexOrders(); break;
                case 'products': action = reindexProducts(); break;
                case 'categories': action = reindexCategories(); break;
                case 'users': action = reindexUsers(); break;
                default: throw new Error("Unknown reindex type");
            }

            const result = await dispatch(action);

            if (result && result.success) {
                toast({
                    title: "İşlem Başlatıldı",
                    description: "İndeksleme işlemi arka planda devam ediyor.",
                    variant: "default",
                    className: "bg-green-50 border-green-200 text-green-900"
                });
            }
        } catch (error) {
            console.error("Reindex error:", error);
            // Error is already handled by action middleware but we can show extra info if needed
        } finally {
            setLoadingState(prev => ({ ...prev, [type]: false }));
        }
    };

    const ReindexButton = ({ type, label, icon: Icon }) => (
        <Button
            onClick={() => handleReindexClick(type, label)}
            disabled={loadingState[type]}
            variant="outline"
            className="w-full justify-start h-12 border-lightgray hover:bg-gray-50 hover:text-red transition-colors"
        >
            {loadingState[type] ? (
                <>
                    <LoadingSpinner size="sm" color="currentColor" />
                    <span className="ml-2">İşleniyor...</span>
                </>
            ) : (
                <>
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="ml-2">{label} Re-Index</span>
                </>
            )}
        </Button>
    );

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold font-Barlow text-darkgray">Sistem Ayarları</h2>
                <p className="text-gray-500">Uygulama genel yapılandırması ve bakım araçları.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Search Index Card */}
                <Card className="border-lightgray shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-red" />
                            <CardTitle className="text-lg font-Barlow">Arama İndeksi Yönetimi</CardTitle>
                        </div>
                        <CardDescription>
                            Elasticsearch arama motoru indekslerini manuel olarak tetikleyebilirsiniz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
                            <div className="flex gap-2">
                                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                <p className="text-sm text-blue-700">
                                    Veritabanı ile arama sonuçları arasında tutarsızlık olduğunda ilgili modülü yeniden indeksleyin.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ReindexButton type="orders" label="Siparişler" icon={ShoppingCart} />
                            <ReindexButton type="products" label="Ürünler" icon={Package} />
                            <ReindexButton type="categories" label="Kategoriler" icon={ListOrdered} />
                            <ReindexButton type="users" label="Kullanıcılar" icon={User} />
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for other settings */}
                <Card className="border-lightgray shadow-sm opacity-60">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow" />
                            <CardTitle className="text-lg font-Barlow">Diğer Ayarlar</CardTitle>
                        </div>
                        <CardDescription>
                            Gelecek özellikler için ayrılmış alan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">
                            Bildirim ayarları, e-posta şablonları ve diğer sistem yapılandırmaları burada yer alacak.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={performReindex}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
}
