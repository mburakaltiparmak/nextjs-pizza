import { setModuleLoading, setSuccess } from "./globalActions";
import { handleApiError } from "../middleware/errorMiddleware";
import { fetchStates } from "../constants";
import { promoCodeActions } from "../reducers/promoCodeReducer";
import PromoCodeService from "@/lib/services/PromoCodeService";
import cache from "@/lib/utils/cacheManager";

// ========================================
// CACHE KEYS
// ========================================
const CACHE_KEY_ALL = 'promo_codes_all';
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchPromoCodes = (forceRefresh = false) => async (dispatch) => {
  if (!forceRefresh) {
    const cached = cache.get(CACHE_KEY_ALL);
    if (cached) {
      console.log('✅ Cache hit (Promo Codes)');
      dispatch({ type: promoCodeActions.SET_PROMO_CODES, payload: cached });
      dispatch({ type: promoCodeActions.SET_FETCH_STATE, payload: fetchStates.FETCHED });
      return cached;
    }
  }

  dispatch(setModuleLoading('promoCode', true));
  dispatch({ type: promoCodeActions.SET_FETCH_STATE, payload: fetchStates.FETCHING });

  try {
    const response = await PromoCodeService.fetchAll();
    
    // Check if response.data is the array or if it's wrapped
    const data = response.data;
    if (!data) {
      throw new Error("Promo kodları alınamadı");
    }

    dispatch({ type: promoCodeActions.SET_PROMO_CODES, payload: data });
    dispatch({ type: promoCodeActions.SET_FETCH_STATE, payload: fetchStates.FETCHED });
    
    cache.set(CACHE_KEY_ALL, data, CACHE_DURATION);

    dispatch(setModuleLoading('promoCode', false));

    return data;
  } catch (err) {
    console.error("Promo kodları getirme hatası:", err);
    dispatch({ type: promoCodeActions.SET_FETCH_STATE, payload: fetchStates.FAILED });
    dispatch(setModuleLoading('promoCode', false));
    return handleApiError(err, dispatch, 'fetchPromoCodes');
  }
};

export const createPromoCode = (data) => async (dispatch) => {
  dispatch(setModuleLoading('promoCode', true));

  try {
    const response = await PromoCodeService.create(data);

    dispatch({
      type: promoCodeActions.ADD_PROMO_CODE,
      payload: response.data,
    });

    dispatch(setSuccess("Promo kodu başarıyla oluşturuldu"));
    dispatch(setModuleLoading('promoCode', false));
    
    // Invalidate cache
    cache.clear(CACHE_KEY_ALL);
    
    return response.data;
  } catch (err) {
    dispatch(setModuleLoading('promoCode', false));
    return handleApiError(err, dispatch, 'createPromoCode');
  }
};

export const updatePromoCode = (id, data) => async (dispatch) => {
  dispatch(setModuleLoading('promoCode', true));

  try {
    const response = await PromoCodeService.update(id, data);

    dispatch({
      type: promoCodeActions.UPDATE_PROMO_CODE,
      payload: response.data,
    });

    dispatch(setSuccess("Promo kodu güncellendi"));
    dispatch(setModuleLoading('promoCode', false));
    
    // Invalidate cache
    cache.clear(CACHE_KEY_ALL);

    return response.data;
  } catch (err) {
    dispatch(setModuleLoading('promoCode', false));
    return handleApiError(err, dispatch, 'updatePromoCode');
  }
};

export const togglePromoCodeStatus = (id, isActive) => async (dispatch) => {
    // If backend has specific endpoint or if we just use update
    return dispatch(updatePromoCode(id, { isActive }));
}

export const deletePromoCode = (id) => async (dispatch) => {
  dispatch(setModuleLoading('promoCode', true));

  try {
    await PromoCodeService.remove(id);

    dispatch({
      type: promoCodeActions.DELETE_PROMO_CODE,
      payload: id,
    });

    dispatch(setSuccess("Promo kodu silindi"));
    dispatch(setModuleLoading('promoCode', false));
    
    // Invalidate cache
    cache.clear(CACHE_KEY_ALL);

  } catch (err) {
    dispatch(setModuleLoading('promoCode', false));
    return handleApiError(err, dispatch, 'deletePromoCode');
  }
};
