import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useDispatch } from "react-redux";
import { fetchStates, productActions } from "../reducers/productReducer";

export const fetchProducts = () => async (useAppDispatch) => {
  useAppDispatch(setFetchState(fetchStates.FETCHING));
  try {
    const response = await fetch(
      "https://66c0ce8bba6f27ca9a57a405.mockapi.io/api/products"
    );
    const data = await response.json();
    console.log("response", data);
    useAppDispatch(setFetchState(fetchStates.FETCHED));

    useAppDispatch(setProducts(data));
  } catch (err) {
    console.error("AN ERROR OCCURED WHEN FETCHING PRODUCTS", err);
    useAppDispatch(setFetchState(fetchStates.FAILED));
  }
};

export const fetchProductsById = (id) => async (useAppDispatch) => {
  useAppDispatch(setFetchState(fetchStates.FETCHING));
  try {
    const response = await fetch(
      `https://66c0ce8bba6f27ca9a57a405.mockapi.io/api/products/${id}`
    );
    const data = await response.json();
    useAppDispatch(setFetchState(fetchStates.FETCHED));
    useAppDispatch(setItemsByCategory(data));
    return { payload: data };
  } catch (err) {
    console.error("AN ERROR OCCURED WHEN FETCHING PRODUCTS BY CATEGORY", err);
    useAppDispatch(setFetchState(fetchStates.FAILED));
    throw err;
  }
};
export const setProducts = (products) => ({
  type: productActions.setProductList,
  payload: products,
});

export const setSelectedCategory = (category) => ({
  type: productActions.setSelectedCategory,
  payload: category,
});

export const setFetchState = (fetchState) => ({
  type: productActions.setFetchState,
  payload: fetchState,
});

export const setItemsByCategory = (itemsByCategory) => ({
  type: productActions.setItemsByCategory,
  payload: itemsByCategory,
});


