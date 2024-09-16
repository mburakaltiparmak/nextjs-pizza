import { fetchStates, productActions } from "../reducers/productReducer";

const API_BASE_URL = "https://66c0ce8bba6f27ca9a57a405.mockapi.io/api/products";

export const fetchProducts = () => async (dispatch) => {
  dispatch(setFetchState(fetchStates.FETCHING));
  dispatch(setLoading(true));
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch product data");
    }
    const data = await response.json();
    dispatch(setFetchState(fetchStates.FETCHED));
    dispatch(setLoading(false));

    const categories = data.map((category) => ({
      category_id: category.id,
      category_img: category.category_img,
      category_name: category.category_name,
    }));

    const products = data.flatMap((category) =>
      category.products.map((product) => ({
        product_id: product.product_id,
        product_name: product.name,
        price: product.price,
        product_img: product.product_img,
        rating: product.rating,
        stock: product.stock,
        category_id: category.id,
      }))
    );

    dispatch(setCategories(categories));
    dispatch(setProducts(products));
  } catch (err) {
    console.error("Error fetching products:", err);
    dispatch(setFetchState(fetchStates.FAILED));
  }
};

export const fetchProductsById = (id) => async (dispatch) => {
  dispatch(setFetchState(fetchStates.FETCHING));

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product data by ID");
    }
    const data = await response.json();
    dispatch(setFetchState(fetchStates.FETCHED));

    if (data && data.products) {
      const products = data.products.map((product) => ({
        product_id: product.product_id,
        product_name: product.name,
        price: product.price,
        product_img: product.product_img,
        rating: product.rating,
        stock: product.stock,
        category_id: data.id,
      }));
      dispatch(setProducts(products));
    } else {
      console.error("Unexpected data structure:", data);
      dispatch(setProducts([]));
    }
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    dispatch(setFetchState(fetchStates.FAILED));
  }
};

// Action creators
export const setProducts = (products) => ({
  type: productActions.setProductList,
  payload: products,
});

export const setCategories = (categories) => ({
  type: productActions.setCategories,
  payload: categories,
});

export const setFetchState = (fetchState) => ({
  type: productActions.setFetchState,
  payload: fetchState,
});

export const setSelectedCategory = (selectedCategory) => ({
  type: productActions.setSelectedCategory,
  payload: selectedCategory,
});

export const setLoading = (loading) => ({
  type: productActions.setLoading,
  payload: loading,
});
