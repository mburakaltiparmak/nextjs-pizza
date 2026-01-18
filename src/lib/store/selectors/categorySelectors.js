import { createSelector } from 'reselect';

// Base category state
const selectCategoryState = (state) => state.category;

// Memoized Selectors
export const selectAllCategories = createSelector(
    [selectCategoryState],
    (category) => category.categories
);

export const selectCategoryLoading = createSelector(
    [selectCategoryState],
    (category) => category.fetchState === 'FETCHING'
);
