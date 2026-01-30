import { createSelector } from 'reselect';

// Base global state (assuming store structure has 'global' or 'app' reducer)
// Based on analysis, 'global' seems to be the reducer name for loading etc.
const selectGlobalState = (state) => state.global;
const selectAppState = (state) => state.app;

// Global Selectors
export const selectGlobalLoading = createSelector(
    [selectGlobalState],
    (global) => global?.loading || false
);

export const selectGlobalError = createSelector(
    [selectGlobalState],
    (global) => global?.error || null
);

// App Selectors (if existing)
export const selectIsGuestMode = createSelector(
    [selectAppState],
    (app) => app?.isGuestMode || false
);

export const selectSidebarOpen = createSelector(
    [selectAppState],
    (app) => app?.sidebarOpen || false
);
