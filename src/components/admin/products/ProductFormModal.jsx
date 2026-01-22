"use client";

import { z } from "zod";
import { Modal } from "@/components/admin/modal";
import ImageUpload from "@/components/admin/imageUpload";
import RatingStars from "@/components/admin/ratingStars";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useFormModal } from "@/lib/hooks/admin/useFormModal";

// Form validation schema
const formSchema = z.object({
    name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır."),
    categoryId: z.string().min(1, "Kategori seçmelisiniz."),
    price: z.coerce.number().positive("Fiyat pozitif bir değer olmalıdır."),
    stock: z.coerce.number().int().nonnegative("Stok negatif olamaz."),
    rating: z.coerce
        .number()
        .min(0, "En düşük puan 0 olabilir.")
        .max(5, "En yüksek puan 5 olabilir."),
    image: z.any().optional(),
    preview: z.any().optional(),
});

/**
 * Product Form Modal Component
 * Handles both creating and editing products
 */
export const ProductFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingProduct,
    categories,
    isUpdating,
}) => {
    const { form, handleImageChange, handleImageError, handleSubmit } = useFormModal({
        schema: formSchema,
        defaultValues: {
            name: "",
            categoryId: "",
            price: 0,
            stock: 0,
            rating: 0,
            image: null,
            preview: null,
        },
        isOpen,
        editingItem: editingProduct ? {
            name: editingProduct.name,
            price: editingProduct.price,
            stock: editingProduct.stock,
            rating: editingProduct.rating,
            categoryId: editingProduct.categoryId?.toString() || "",
            image: null,
            preview: editingProduct.img,
        } : null,
        onSubmit,
        onClose
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
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
                            : editingProduct
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
                                    <p className="text-darkgray">Ürün Adı</p>
                                    <p className="text-red pl-1">*</p>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="w-full p-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent font-Barlow"
                                        placeholder="Ürün adını girin"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-semibold text-red" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex flex-row items-center font-Barlow">
                                    <p className="text-darkgray">Kategori</p>
                                    <p className="text-red pl-1">*</p>
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="font-Barlow">
                                            <SelectValue placeholder="Kategori Seçin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Array.isArray(categories) &&
                                            categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                    className="font-Barlow"
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-xs font-semibold text-red" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex flex-row items-center font-Barlow">
                                        <p className="text-darkgray">Fiyat (₺)</p>
                                        <p className="text-red pl-1">*</p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...field}
                                            className="w-full p-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent font-Barlow"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-semibold text-red" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex flex-row items-center font-Barlow">
                                        <p className="text-darkgray">Stok</p>
                                        <p className="text-red pl-1">*</p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            {...field}
                                            className="w-full p-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent font-Barlow"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-semibold text-red" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex flex-row items-center font-Barlow">
                                    <p className="text-darkgray">Puan (0-5)</p>
                                    <p className="text-red pl-1">*</p>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        {...field}
                                        className="w-full p-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent font-Barlow"
                                    />
                                </FormControl>
                                <div className="py-2">
                                    <RatingStars rating={field.value} />
                                </div>
                                <FormMessage className="text-xs font-semibold text-red" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex flex-row items-center font-Barlow">
                                    <p className="text-darkgray">Ürün Resmi</p>
                                    <p className="text-red pl-1">*</p>
                                </FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        preview={form.getValues("preview")}
                                        onChange={handleImageChange}
                                        onError={handleImageError}
                                        label="Ürün Resmi"
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
