/**
 * useModal Hook
 * Generic modal management hook for admin panel
 * 
 * @template T - Type of data managed by the modal
 * @param {T|null} initialData - Initial data for the modal
 * @returns {Object} Modal state and controls
 */

import { useState, useCallback } from "react";

export const useModal = (initialData = null) => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState(initialData);

    /**
     * Open modal with optional data
     * @param {*} item - Data to pass to modal (for edit mode)
     */
    const open = useCallback((item = null) => {
        setData(item);
        setIsOpen(true);
    }, []);

    /**
     * Close modal and reset data
     */
    const close = useCallback(() => {
        setIsOpen(false);
        setData(null);
    }, []);

    /**
     * Update modal data without closing
     * @param {*} newData - New data to set
     */
    const updateData = useCallback((newData) => {
        setData(newData);
    }, []);

    /**
     * Toggle modal open/close state
     */
    const toggle = useCallback(() => {
        setIsOpen(prev => !prev);
        if (isOpen) {
            setData(null);
        }
    }, [isOpen]);

    return {
        isOpen,
        data,
        open,
        close,
        updateData,
        toggle
    };
};

/**
 * Usage Example:
 * 
 * const editModal = useModal();
 * const deleteModal = useModal();
 * 
 * // Open for create
 * <Button onClick={() => editModal.open()}>Add New</Button>
 * 
 * // Open for edit
 * <Button onClick={() => editModal.open(user)}>Edit</Button>
 * 
 * // Modal component
 * <UserFormModal
 *   isOpen={editModal.isOpen}
 *   onClose={editModal.close}
 *   editingUser={editModal.data}
 * />
 */
