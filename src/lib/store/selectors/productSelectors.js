import { createSelector } from 'reselect';

// Base product state
const selectProductState = (state) => state.product;

// Memoized Selectors
export const selectProductList = createSelector(
    [selectProductState],
    (product) => product.products
);

export const selectProductPagination = createSelector(
    [selectProductState],
    (product) => product.pagination
);

export const selectProductLoading = createSelector(
    [selectProductState],
    (product) => product.status === 'FETCHING'
);

export const selectSingleProduct = createSelector(
    [selectProductState],
    (product) => product.product
);
