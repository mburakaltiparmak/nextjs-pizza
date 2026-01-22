"use client";

import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { createCategory, updateCategory } from "@/lib/store/actions/categoryActions";
import { Modal } from "@/components/admin/modal";
import ImageUpload from "@/components/admin/imageUpload";
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
import { useFormModal } from "@/lib/hooks/admin/useFormModal";

const formSchema = z.object({
    name: z.string().min(3, "Kategori adı en az 3 karakter olmalıdır."),
    image: z.any().optional(),
    preview: z.any().optional(),
});

export const CategoryFormModal = ({ open, onClose, editingCategory }) => {
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.global.loading);
    const token = useSelector((state) => state.user.token);

    const { form, handleImageChange, handleImageError, handleSubmit, handleClose } = useFormModal({
        schema: formSchema,
        defaultValues: {
            name: "",
            image: null,
            preview: null,
        },
        isOpen: open,
        editingItem: editingCategory ? {
            name: editingCategory.name,
            image: null,
            preview: editingCategory.img,
        } : null,
        onSubmit: async (data) => {
            const categoryData = {
                name: data.name,
                image: data.image,
            };

            let result;
            if (editingCategory) {
                result = await dispatch(
                    updateCategory(editingCategory.id, categoryData, token)
                );
            } else {
                result = await dispatch(createCategory(categoryData, token));
            }

            return result;
        },
        onClose
    });

    return (
        <Modal
            isOpen={open}
            onClose={handleClose}
            title={editingCategory ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
            footer={
                <div className="flex flex-row items-center justify-between space-x-2 p-4">
                    <Button
                        type="button"
                        className="border-gray text-lightgray hover:bg-gray hover:border-darkgray hover:text-lightgray font-Barlow"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        className="bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                        disabled={loading}
                        onClick={form.handleSubmit(handleSubmit)}
                    >
                        {loading
                            ? "İşleniyor..."
                            : editingCategory
                                ? "Güncelle"
                                : "Kaydet"}
                    </Button>
                </div>
            }
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex flex-row items-center font-Barlow">
                                    <p className="text-darkgray">Kategori Adı</p>
                                    <p className="text-red pl-1">*</p>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="w-full p-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent font-Barlow"
                                        placeholder="Kategori adını girin"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-semibold text-red" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel className="flex flex-row items-center font-Barlow">
                                    <p className="text-darkgray">Kategori Logo</p>
                                    <p className="text-red pl-1">*</p>
                                </FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        preview={form.getValues("preview")}
                                        onChange={handleImageChange}
                                        onError={handleImageError}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-semibold text-red" />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </Modal>
    );
};
