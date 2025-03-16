import { fetchStates } from "../constants";

export const productActions = {
  SET_PRODUCTS: "SET_PRODUCTS",
  SET_PRODUCT_DETAIL: "SET_PRODUCT_DETAIL",
  SET_CATEGORY_PRODUCTS: "SET_CATEGORY_PRODUCTS",
  ADD_PRODUCT: "ADD_PRODUCT",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",
  SET_SELECTED_CATEGORY: "SET_SELECTED_CATEGORY",
  SET_FETCH_STATE: "SET_PRODUCT_FETCH_STATE",
  SET_ERROR: "SET_PRODUCT_ERROR",
};

const initialState = {
  products: [],
  productDetail: null,
  categoryProducts: [], // Belirli bir kategoriye ait ürünler
  selectedCategory: null,
  fetchState: fetchStates.NOT_FETCHED,
  error: null,
};

export const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case productActions.SET_PRODUCTS:
      return {
        ...state,
        products: action.payload,
      };
    case productActions.SET_PRODUCT_DETAIL:
      return {
        ...state,
        productDetail: action.payload,
      };
    case productActions.SET_CATEGORY_PRODUCTS:
      return {
        ...state,
        categoryProducts: action.payload,
      };
    case productActions.ADD_PRODUCT:
      return {
        ...state,
        products: [...state.products, action.payload],
      };
    case productActions.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        ),
        // Eğer bu ürün detayı görüntüleniyorsa, onu da güncelle
        productDetail:
          state.productDetail?.id === action.payload.id
            ? action.payload
            : state.productDetail,
        // Eğer bu ürün kategori ürünleri içindeyse, orada da güncelle
        categoryProducts: state.categoryProducts.map((product) =>
          product.id === action.payload.id ? action.payload : product
        ),
      };
    case productActions.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(
          (product) => product.id !== action.payload
        ),
        // Eğer detayı görüntülenen ürün siliniyorsa, detay bilgisini de temizle
        productDetail:
          state.productDetail?.id === action.payload
            ? null
            : state.productDetail,
        // Kategori ürünlerinden de sil
        categoryProducts: state.categoryProducts.filter(
          (product) => product.id !== action.payload
        ),
      };
    case productActions.SET_SELECTED_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
      };
    case productActions.SET_FETCH_STATE:
      return {
        ...state,
        fetchState: action.payload,
      };
    case productActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};
