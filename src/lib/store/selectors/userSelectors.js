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

export const selectUserFullname = createSelector(
    [selectUserProfile],
    (profile) => profile?.fullname || (profile?.name ? `${profile.name} ${profile.surname || ''}`.trim() : '')
);

export const selectAuthError = createSelector(
    [selectUserState],
    (user) => user.error
);

export const selectUserToken = createSelector(
    [selectUserState],
    (user) => user.token
);

export const selectAuthToken = selectUserToken; // Alias

export const selectUserEmail = createSelector(
    [selectUserState],
    (user) => user.email
);

export const selectAuthProvider = createSelector(
    [selectUserState],
    (user) => user.authProvider
);
