import { createSelector } from 'reselect';

// Base user state
const selectUserState = (state) => state.user;

// Memoized Selectors
export const selectUserProfile = createSelector(
    [selectUserState],
    (user) => user.profile
);

export const selectIsAuthenticated = createSelector(
    [selectUserState],
    (user) => user.isLogin
);

export const selectUserRole = createSelector(
    [selectUserState],
    (user) => user.role
);

export const selectUserAddresses = createSelector(
    [selectUserState],
    (user) => user.addresses
);

export const selectAuthLoading = createSelector(
    [selectUserState],
    (user) => user.fetchState === 'FETCHING'
);
