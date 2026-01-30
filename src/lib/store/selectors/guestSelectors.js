import { createSelector } from 'reselect';

// Base guest state
const selectGuestState = (state) => state.guest;

// Memoized Selectors
export const selectGuestData = createSelector(
    [selectGuestState],
    (guest) => guest
);

export const selectGuestName = createSelector(
    [selectGuestState],
    (guest) => guest.name
);

export const selectGuestSurname = createSelector(
    [selectGuestState],
    (guest) => guest.surname
);

export const selectGuestEmail = createSelector(
    [selectGuestState],
    (guest) => guest.email
);

export const selectGuestPhone = createSelector(
    [selectGuestState],
    (guest) => guest.phoneNumber
);

export const selectIsGuestDataValid = createSelector(
    [selectGuestState],
    (guest) => Boolean(guest.name && guest.surname && guest.email && guest.phoneNumber)
);
