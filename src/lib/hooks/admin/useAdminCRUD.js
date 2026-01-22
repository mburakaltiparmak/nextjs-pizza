/**
 * useAdminCRUD Hook
 * Generic CRUD operations hook for admin panel
 * Handles create, update, delete operations with Redux
 * 
 * @param {Object} config - Configuration object
 * @param {Function} config.createAction - Redux action for create
 * @param {Function} config.updateAction - Redux action for update
 * @param {Function} config.deleteAction - Redux action for delete
 * @param {Function} config.refreshAction - Optional action to refresh data after operations
 * @param {Function} config.onSuccess - Optional callback on successful operation
 * @param {Function} config.onError - Optional callback on error
 * @returns {Object} CRUD operations and loading state
 */

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

export const useAdminCRUD = ({
    createAction,
    updateAction,
    deleteAction,
    refreshAction,
    onSuccess,
    onError
}) => {
    const dispatch = useAppDispatch();
    const isLoading = useAppSelector(state => state.global.loading);

    /**
     * Create new item
     */
    const create = useCallback(async (data) => {
        try {
            const result = await dispatch(createAction(data));

            if (result.success) {
                if (refreshAction) {
                    await dispatch(refreshAction());
                }
                if (onSuccess) {
                    onSuccess(result, 'create');
                }
            } else {
                if (onError) {
                    onError(result.error, 'create');
                }
            }

            return result;
        } catch (error) {
            if (onError) {
                onError(error, 'create');
            }
            return { success: false, error };
        }
    }, [dispatch, createAction, refreshAction, onSuccess, onError]);

    /**
     * Update existing item
     */
    const update = useCallback(async (id, data) => {
        try {
            const result = await dispatch(updateAction(id, data));

            if (result.success) {
                if (refreshAction) {
                    await dispatch(refreshAction());
                }
                if (onSuccess) {
                    onSuccess(result, 'update');
                }
            } else {
                if (onError) {
                    onError(result.error, 'update');
                }
            }

            return result;
        } catch (error) {
            if (onError) {
                onError(error, 'update');
            }
            return { success: false, error };
        }
    }, [dispatch, updateAction, refreshAction, onSuccess, onError]);

    /**
     * Delete item
     */
    const remove = useCallback(async (id) => {
        try {
            const result = await dispatch(deleteAction(id));

            if (result.success) {
                if (refreshAction) {
                    await dispatch(refreshAction());
                }
                if (onSuccess) {
                    onSuccess(result, 'delete');
                }
            } else {
                if (onError) {
                    onError(result.error, 'delete');
                }
            }

            return result;
        } catch (error) {
            if (onError) {
                onError(error, 'delete');
            }
            return { success: false, error };
        }
    }, [dispatch, deleteAction, refreshAction, onSuccess, onError]);

    /**
     * Batch delete items
     */
    const batchRemove = useCallback(async (ids) => {
        try {
            const results = await Promise.all(
                ids.map(id => dispatch(deleteAction(id)))
            );

            const allSuccess = results.every(r => r.success);

            if (allSuccess) {
                if (refreshAction) {
                    await dispatch(refreshAction());
                }
                if (onSuccess) {
                    onSuccess({ success: true, count: ids.length }, 'batchDelete');
                }
            }

            return { success: allSuccess, results };
        } catch (error) {
            if (onError) {
                onError(error, 'batchDelete');
            }
            return { success: false, error };
        }
    }, [dispatch, deleteAction, refreshAction, onSuccess, onError]);

    return {
        create,
        update,
        remove,
        batchRemove,
        isLoading
    };
};

/**
 * Usage Example:
 * 
 * const { create, update, remove, isLoading } = useAdminCRUD({
 *   createAction: createUser,
 *   updateAction: updateUser,
 *   deleteAction: deleteUser,
 *   refreshAction: () => fetchAllUsers(currentPage),
 *   onSuccess: (result, operation) => {
 *     console.log(`${operation} successful:`, result);
 *   },
 *   onError: (error, operation) => {
 *     console.error(`${operation} failed:`, error);
 *   }
 * });
 * 
 * // In handlers
 * const handleSubmit = async (data) => {
 *   if (editingUser) {
 *     await update(editingUser.id, data);
 *   } else {
 *     await create(data);
 *   }
 *   closeModal();
 * };
 * 
 * const handleDelete = async (userId) => {
 *   await remove(userId);
 * };
 */
