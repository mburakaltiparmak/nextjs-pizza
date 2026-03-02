import { useSelector, useDispatch } from 'react-redux';
import { clearGuestData } from '@/lib/store/reducers/guestReducer';
import { 
    selectIsGuestMode, 
    selectSidebarOpen 
} from '@/lib/store/selectors/appSelectors';
import { 
    selectGuestData, 
    selectIsGuestDataValid 
} from '@/lib/store/selectors/guestSelectors';
import { selectUserRole } from '@/lib/store/selectors/userSelectors';
import { setGuestMode } from '@/lib/store/actions/appActions';
import { selectIsAuthenticated } from '@/lib/store/selectors/userSelectors';

export const useGuestMode = () => {
    const dispatch = useDispatch();

    // Selectors
    const isGuestMode = useSelector(selectIsGuestMode);
    const role = useSelector(selectUserRole);
    const guestData = useSelector(selectGuestData);
    const isGuestDataValid = useSelector(selectIsGuestDataValid);

    // Derived state
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isGuest = !isAuthenticated;

    // Actions
    const clearGuest = () => dispatch(clearGuestData());
    const enableGuestMode = () => dispatch(setGuestMode(true));
    const disableGuestMode = () => dispatch(setGuestMode(false));

    return {
        // State
        isGuestMode,
        isGuest,
        guestData,
        isGuestDataValid,
        role,

        // Actions
        clearGuest,
        enableGuestMode,
        disableGuestMode
    };
};
