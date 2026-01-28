"use client";

import { z } from "zod";
import { Modal } from "@/components/admin/modals";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useFormModal } from "@/lib/hooks/admin/useFormModal";

// Form validation schema
const formSchema = z.object({
    code: z.string()
        .min(3, "Kod en az 3 karakter olmalıdır.")
        .regex(/^[A-Z0-9]+$/, "Kod sadece büyük harf ve rakam içermelidir (Boşluk içeremez)."),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discountValue: z.coerce.number().positive("İndirim değeri pozitif olmalıdır."),
    minOrderAmount: z.coerce.number().nonnegative("Minimum sipariş tutarı negatif olamaz.").optional(),
    maxDiscountAmount: z.coerce.number().nonnegative("Maksimum indirim tutarı negatif olamaz.").optional(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
    usageLimit: z.coerce.number().int().nonnegative().optional(),
    perUserLimit: z.coerce.number().int().nonnegative().optional(),
    isActive: z.boolean().default(true),
}).refine((data) => {
    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
        return false;
    }
    return true;
}, {
    message: "Yüzdelik indirim 100'den büyük olamaz.",
    path: ["discountValue"],
}).refine((data) => {
    if (data.validFrom && data.validUntil) {
        return new Date(data.validFrom) <= new Date(data.validUntil);
    }
    return true;
}, {
    message: "Geçerlilik bitiş tarihi başlangıç tarihinden önce olamaz.",
    path: ["validUntil"],
});

import { useMemo } from "react";

// ... existing imports ...

export const PromoCodeFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingItem,
    isUpdating,
}) => {
    // Memoize the transformed editing item to prevent infinite loop in useFormModal useEffect
    const processedEditingItem = useMemo(() => {
        if (!editingItem) return null;
        
        return {

            ...editingItem,
            // Map backend 'active' to frontend 'isActive'
            isActive: editingItem.active,
            // Ensure dates are formatted for input type="datetime-local" if needed, or simple date
            // Assuming backend sends ISO string, input type="datetime-local" needs "YYYY-MM-DDThh:mm"
            validFrom: editingItem.validFrom ? new Date(editingItem.validFrom).toISOString().slice(0, 16) : "",
            validUntil: editingItem.validUntil ? new Date(editingItem.validUntil).toISOString().slice(0, 16) : "",
        };
    }, [editingItem]);

    const { form, handleSubmit } = useFormModal({
        schema: formSchema,
        defaultValues: {
            code: "",
            discountType: "FIXED_AMOUNT",
            discountValue: 0,
            minOrderAmount: 0,
            maxDiscountAmount: 0,
            validFrom: "",
            validUntil: "",
            usageLimit: 0,
            perUserLimit: 0,
            isActive: true,
        },
        isOpen,
        editingItem: processedEditingItem,
        onSubmit: (data, item) => {
            const payload = {
                ...data,
                active: data.isActive
            };
            return onSubmit(payload, item);
        },
        onClose
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingItem ? "Promo Kodunu Düzenle" : "Yeni Promo Kodu Ekle"}
            footer={
                <div className="flex flex-row items-center justify-between space-x-2 p-4">
                    <Button
                        type="button"
                        className="border-gray text-lightgray hover:bg-gray hover:text-lightgray font-Barlow"
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        className="bg-red text-lightgray hover:text-red hover:bg-yellow font-Barlow"
                        disabled={isUpdating}
                        onClick={form.handleSubmit(handleSubmit)}
                    >
                        {isUpdating
                            ? "İşleniyor..."
                            : editingItem
                                ? "Güncelle"
                                : "Kaydet"}
                    </Button>
                </div>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-Barlow text-darkgray">Kod *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Örn: YAZ2025" className="font-Barlow uppercase" />
                                    </FormControl>
                                    <FormMessage className="text-red" />
                                </FormItem>
                            )}
                        />
                        
                         <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-col justify-end pb-2">
                                    <div className="flex items-center space-x-2">
                                        <FormControl>
                                            <Switch
                                                checked={!!field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-Barlow text-darkgray font-normal cursor-pointer">
                                            {field.value ? "Aktif" : "Pasif"}
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="discountType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-Barlow text-darkgray">İndirim Tipi *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="font-Barlow">
                                                <SelectValue placeholder="Seçiniz" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="FIXED_AMOUNT">Sabit Tutar</SelectItem>
                                            <SelectItem value="PERCENTAGE">Yüzde (%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-red" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="discountValue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-Barlow text-darkgray">Değer *</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} className="font-Barlow" />
                                    </FormControl>
                                    <FormMessage className="text-red" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="minOrderAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-Barlow text-darkgray">Min. Sipariş Tutarı</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} className="font-Barlow" />
                                    </FormControl>
                                    <FormDescription className="text-xs">Opsiyonel</FormDescription>
                                    <FormMessage className="text-red" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maxDiscountAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-Barlow text-darkgray">Max. İndirim Tutarı</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} className="font-Barlow" />
                                    </FormControl>
                                    <FormDescription className="text-xs">Yüzdelik indirim için (Opsiyonel)</FormDescription>
                                    <FormMessage className="text-red" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="validFrom"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-Barlow text-darkgray">Başlangıç Tarihi</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} className="font-Barlow" />
                                    </FormControl>
                                    <FormMessage className="text-red" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="validUntil"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-Barlow text-darkgray">Bitiş Tarihi</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} className="font-Barlow" />
                                    </FormControl>
                                    <FormMessage className="text-red" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="usageLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-Barlow text-darkgray">Toplam Kullanım Limiti</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} className="font-Barlow" placeholder="0 = Limitsiz" />
                                    </FormControl>
                                    <FormDescription className="text-xs">0 = Limitsiz</FormDescription>
                                    <FormMessage className="text-red" />
                                </FormItem>
                            )}
                        />

                         <FormField
                            control={form.control}
                            name="perUserLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-Barlow text-darkgray">Kişi Başı Limit</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} className="font-Barlow" placeholder="0 = Limitsiz" />
                                    </FormControl>
                                    <FormDescription className="text-xs">0 = Limitsiz</FormDescription>
                                    <FormMessage className="text-red" />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
        </Modal>
    );
};
