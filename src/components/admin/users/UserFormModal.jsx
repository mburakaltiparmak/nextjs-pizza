"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/admin/modal";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
    surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır."),
    email: z.string().email("Geçerli bir e-posta adresi giriniz."),
    phoneNumber: z.string().min(10, "Geçerli bir telefon numarası giriniz.").optional().or(z.literal("")),
    role: z.enum(["ADMIN", "PERSONAL", "USER", "GUEST"]),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır.").optional().or(z.literal("")),
});

export const UserFormModal = ({ isOpen, onClose, onSubmit, editingUser, isUpdating }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            surname: "",
            email: "",
            phoneNumber: "",
            role: "USER",
            password: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (editingUser) {
                form.reset({
                    name: editingUser.name || "",
                    surname: editingUser.surname || "",
                    email: editingUser.email || "",
                    phoneNumber: editingUser.phoneNumber || "",
                    role: editingUser.role || "USER",
                    password: "", // Password is cleared on edit
                });
            } else {
                form.reset({
                    name: "",
                    surname: "",
                    email: "",
                    phoneNumber: "",
                    role: "USER",
                    password: "",
                });
            }
        }
    }, [editingUser, isOpen, form]);

    const handleSubmit = async (data) => {
        // If editing and password is empty, remove it from data to prevent overwriting
        // This logic is also handled in UsersClient, but good to be clear here
        await onSubmit(data, editingUser);
        onClose();
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={editingUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
            footer={
                <div className="flex flex-row items-center justify-between space-x-2 p-4">
                    <Button
                        type="button"
                        className="border-gray text-lightgray hover:bg-gray hover:border-darkgray hover:text-lightgray font-Barlow"
                        onClick={handleClose}
                        disabled={isUpdating}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        className="bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                        disabled={isUpdating}
                        onClick={form.handleSubmit(handleSubmit)}
                    >
                        {isUpdating
                            ? "İşleniyor..."
                            : editingUser
                                ? "Güncelle"
                                : "Kaydet"}
                    </Button>
                </div>
            }
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-4 font-Barlow"
                >
                    <div className="flex gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel className="flex flex-row items-center">
                                        <span className="text-darkgray">İsim</span>
                                        <span className="text-red pl-1">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="font-Barlow"
                                            placeholder="İsim"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs text-red" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="surname"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel className="flex flex-row items-center">
                                        <span className="text-darkgray">Soyisim</span>
                                        <span className="text-red pl-1">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="font-Barlow"
                                            placeholder="Soyisim"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs text-red" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex flex-row items-center">
                                    <span className="text-darkgray">E-posta</span>
                                    <span className="text-red pl-1">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="email"
                                        className="font-Barlow"
                                        placeholder="ornek@email.com"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs text-red" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex flex-row items-center">
                                    <span className="text-darkgray">Telefon</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="font-Barlow"
                                        placeholder="05XX XXX XX XX"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs text-red" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex flex-row items-center">
                                    <span className="text-darkgray">Rol</span>
                                    <span className="text-red pl-1">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="font-Barlow">
                                            <SelectValue placeholder="Rol Seçin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="USER">Kullanıcı (User)</SelectItem>
                                        <SelectItem value="PERSONAL">Personel</SelectItem>
                                        <SelectItem value="ADMIN">Yönetici (Admin)</SelectItem>
                                        {/* GUEST rolü genellikle manuel eklenmez ama seçenek olsun */}
                                        <SelectItem value="GUEST">Misafir (Guest)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-xs text-red" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex flex-row items-center">
                                    <span className="text-darkgray">Şifre</span>
                                    {!editingUser && <span className="text-red pl-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="password"
                                        className="font-Barlow"
                                        placeholder={editingUser ? "Değiştirmek için yeni şifre girin" : "Şifre girin"}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs text-red" />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </Modal>
    );
};
