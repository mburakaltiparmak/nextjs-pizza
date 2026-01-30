import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/lib/hooks"; // Ensure this path is correct based on project
import { instance } from "@/lib/hooks"; // Ensure this path is correct
import { useToast } from "@/lib/hooks/useToast";
import { addressSchema } from "@/lib/validations/order";
import { selectIsAuthenticated, selectUserRole } from "@/lib/store/selectors/userSelectors";

export const useAddressForm = ({
    initialData = {},
    existingAddressId = null,
    isGuest = false,
    onSubmitSuccess
}) => {
    const { success, error } = useToast();
    const isAuthenticated = useAppSelector(selectIsAuthenticated) || false;
    const role = useAppSelector(selectUserRole);
    const isGuestUser = role === "GUEST" || isGuest;
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullAddress: initialData.fullAddress || "",
            city: initialData.city || "",
            district: initialData.district || "",
            postalCode: initialData.postalCode || "",
            addressTitle: initialData.addressTitle || "",
            phoneNumber: initialData.phoneNumber || "",
            recipientName: initialData.recipientName || "",
            saveAddress: existingAddressId ? true : (initialData.saveAddress || false),
            isDefault: initialData.isDefault || false
        }
    });

    const handleFormSubmit = async (data) => {
        try {
            // Misafir kullanıcı kontrolü
            if (isGuestUser) {
                const guestAddressData = {
                    ...data,
                    id: null,
                    saveAddress: false
                };
                
                if (onSubmitSuccess) onSubmitSuccess(guestAddressData);

                success("Adres bilgileri alındı", {
                    title: "Adres Kaydedildi",
                    message: "Siparişiniz için kullanılacak."
                });
                return;
            }

            // Kayıtlı kullanıcı için adres kaydetme
            if (isAuthenticated && data.saveAddress) {
                setIsSaving(true);
                const isNewAddress = !existingAddressId;

                try {
                    let response;
                    const addressPayload = {
                        fullAddress: data.fullAddress,
                        city: data.city,
                        district: data.district,
                        postalCode: data.postalCode || "",
                        addressTitle: data.addressTitle || `Adres ${new Date().toLocaleDateString()}`,
                        phoneNumber: data.phoneNumber || "",
                        recipientName: data.recipientName,
                        isDefault: data.isDefault || false
                    };

                    if (isNewAddress) {
                        response = await instance.post("user/addresses", addressPayload);
                    } else {
                        response = await instance.put(`user/addresses/${existingAddressId}`, addressPayload);
                    }

                    setIsSaving(false);

                    if (response.data) {
                        const finalData = {
                            ...data,
                            id: isNewAddress ? response.data.id : existingAddressId,
                            saveAddress: false
                        };

                        if (onSubmitSuccess) onSubmitSuccess(finalData);

                        success(isNewAddress ? "Adres başarıyla kaydedildi" : "Adres başarıyla güncellendi", {
                            title: "İşlem Başarılı",
                            message: data.isDefault ? "Varsayılan adresiniz olarak ayarlandı." : ""
                        });
                    }
                } catch (apiError) {
                    setIsSaving(false);
                    console.error("Adres kaydedilirken hata:", apiError);
                    error(apiError.response?.data?.message || "Adres kaydedilemedi", {
                        title: "Hata"
                    });
                    // Still pass data up even if save failed? Usually yes for checkout flow but context dependent.
                    // If this is strict profile management, maybe not.
                    // But matching original logic: original logic called onSubmit even on error?
                    // Original: onSubmit(data) in catch block. 
                    if (onSubmitSuccess) onSubmitSuccess(data);
                }
            } else {
                // Authenticated but chosen not to save
                if (onSubmitSuccess) onSubmitSuccess(data);
            }
        } catch (err) {
            setIsSaving(false);
            console.error("Adres işleminde hata:", err);
            error("Lütfen daha sonra tekrar deneyin", {
                title: "Adres kaydedilemedi"
            });
            if (onSubmitSuccess) onSubmitSuccess(data);
        }
    };

    return {
        form,
        isSaving,
        handleFormSubmit: form.handleSubmit(handleFormSubmit),
        isGuestUser,
        isAuthenticated
    };
};
