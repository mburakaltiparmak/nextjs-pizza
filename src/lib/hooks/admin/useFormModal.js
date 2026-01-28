/**
 * useFormModal Hook
 * Reusable hook for form modals with image upload support
 * Handles form initialization, reset, image handling, and submission
 * 
 * @param {Object} config - Configuration object
 * @param {Object} config.schema - Zod validation schema
 * @param {Object} config.defaultValues - Default form values
 * @param {boolean} config.isOpen - Modal open state
 * @param {Object} config.editingItem - Item being edited (null for create)
 * @param {Function} config.onSubmit - Submit handler
 * @param {Function} config.onClose - Close handler
 * @returns {Object} Form utilities
 */

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/lib/hooks/useToast";

export const useFormModal = ({
    schema,
    defaultValues,
    isOpen,
    editingItem,
    onSubmit,
    onClose
}) => {
    const { toast } = useToast();

    // Initialize form with schema and default values
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues
    });

    /**
     * Auto-reset form when modal opens/closes or editingItem changes
     */
    /**
     * Auto-reset form when modal opens/closes or editingItem changes
     * Uses stringified dependencies to avoid infinite loops with unstable objects
     */
    useEffect(() => {
        if (isOpen) {
            // Edit mode: populate with existing data
            if (editingItem) {
                form.reset(editingItem);
            } 
            // Create mode: reset to defaults
            else {
                form.reset(defaultValues);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, JSON.stringify(editingItem), JSON.stringify(defaultValues), form]);

    /**
     * Handle image upload change
     */
    const handleImageChange = useCallback((imageData) => {
        if (imageData?.file) {
            form.setValue("image", imageData.file);
            form.setValue("preview", imageData.preview);
        }
    }, [form]);

    /**
     * Handle image upload error
     */
    const handleImageError = useCallback((errorMessage) => {
        toast({
            title: "Hata",
            description: errorMessage,
            variant: "destructive"
        });
    }, [toast]);

    /**
     * Handle form submission
     */
    const handleSubmit = useCallback(async (data) => {
        const result = await onSubmit(data, editingItem);

        // Close modal if submission was successful
        if (result && !result.error) {
            onClose();
        }

        return result;
    }, [onSubmit, editingItem, onClose]);

    /**
     * Handle modal close with form reset
     */
    const handleClose = useCallback(() => {
        form.reset(defaultValues);
        onClose();
    }, [form, defaultValues, onClose]);

    return {
        form,
        handleImageChange,
        handleImageError,
        handleSubmit,
        handleClose
    };
};

/**
 * Usage Example:
 * 
 * const formSchema = z.object({
 *   name: z.string().min(3),
 *   image: z.any().optional(),
 *   preview: z.any().optional()
 * });
 * 
 * const { form, handleImageChange, handleImageError, handleSubmit, handleClose } = useFormModal({
 *   schema: formSchema,
 *   defaultValues: { name: "", image: null, preview: null },
 *   isOpen,
 *   editingItem: editingCategory,
 *   onSubmit: async (data, item) => {
 *     if (item) {
 *       return await dispatch(updateCategory(item.id, data));
 *     } else {
 *       return await dispatch(createCategory(data));
 *     }
 *   },
 *   onClose
 * });
 */
