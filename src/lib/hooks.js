import { useDispatch, useSelector, useStore } from "react-redux";

// Redux Hooks
export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
export const useAppStore = useStore.withTypes();

// Axios Instances & Config
export { instance, paymentInstance, uploadInstance, API_URL } from './axios/config';