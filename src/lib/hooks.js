import axios from 'axios';
import { useDispatch, useSelector, useStore } from 'react-redux'
export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
export const useAppStore = useStore.withTypes();
export const instance = axios.create({baseURL : "http://localhost:9000/pizza/api" });