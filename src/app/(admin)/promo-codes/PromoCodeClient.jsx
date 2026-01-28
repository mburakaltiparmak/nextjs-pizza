"use client";

import { useState, useEffect } from "react";
import useAuthRoute from "@/lib/hooks/useAuthRole";
import { useAdminLayout } from "@/lib/contexts/AdminLayoutContext";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
    fetchPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode
} from "@/lib/store/actions/promoCodeActions";
import { fetchStates } from "@/lib/store/constants";

// Custom Hooks
import { useModal } from "@/lib/hooks/admin/useModal";
import { useAdminCRUD } from "@/lib/hooks/admin/useAdminCRUD";

// Components
import { ConfirmationModal } from "@/components/admin/modals";
import { PromoCodesTable } from "@/components/admin/promo-codes/PromoCodesTable";
import { PromoCodeFormModal } from "@/components/admin/promo-codes/PromoCodeFormModal";

const PromoCodeClient = () => {
    const { isAuthorized } = useAuthRoute(["ADMIN"], "/");
    const { registerModal } = useAdminLayout();
    const dispatch = useAppDispatch();

    // Modals
    const editModal = useModal();
    const deleteModal = useModal();

    // Redux selectors
    const promoCodes = useAppSelector((state) => state.promoCode.promoCodes);
    const fetchState = useAppSelector((state) => state.promoCode.fetchState);
    const globalLoading = useAppSelector((state) => state.global.loading);

    // CRUD operations
    const { create, update, remove } = useAdminCRUD({
        createAction: createPromoCode,
        updateAction: updatePromoCode,
        deleteAction: deletePromoCode,
        refreshAction: () => dispatch(fetchPromoCodes())
    });

    // Initial fetch
    useEffect(() => {
        dispatch(fetchPromoCodes());
    }, [dispatch]);

    // Register modal with AdminLayoutContext
    useEffect(() => {
        registerModal(editModal.open);
    }, [registerModal, editModal.open]);

    // Handlers
    const handleFormSubmit = async (data) => {
        if (editModal.data) {
            await update(editModal.data.id, data);
        } else {
            await create(data);
        }
        editModal.close();
    };

    const handleDelete = async () => {
        if (deleteModal.data) {
            await remove(deleteModal.data.id);
            deleteModal.close();
        }
    };

    // Auth check
    if (!isAuthorized) {
        return null;
    }

    const isLoading = fetchState === fetchStates.FETCHING || fetchState === fetchStates.NOT_FETCHED;

    return (
        <div>
            {/* Promo Codes Table */}
            <PromoCodesTable
                promoCodes={promoCodes}
                onEdit={editModal.open}
                onDelete={deleteModal.open}
                onAddNew={() => editModal.open()}
                loading={isLoading}
            />

            {/* Add/Edit Modal */}
            <PromoCodeFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                onSubmit={handleFormSubmit}
                editingItem={editModal.data}
                isUpdating={globalLoading}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Promo Kodu Sil"
                message={`${deleteModal.data?.code} kodunu silmek istediğinizden emin misiniz?`}
            />
        </div>
    );
};

export default PromoCodeClient;
