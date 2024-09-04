const initialState = {
    cart: [],
    customPizza: {
        "name": "Customized Pizza",
        "category_id": 2,
        "rating": 4.9,
        "stock": 1,
        price: "",
        "product_img": "https://res.cloudinary.com/dqjqkgpt3/image/upload/v1724010330/food-2_zwrtrh.png",
        "product_id": Math.random(),
        items: "",
        size: "",
        dough: "",
        siparisNotu:"",
    },
}

export const orderActions = {
    setHamur: "SET_HAMUR",
    setBoyut: "SET_BOYUT",
    setMalzemeler: "SET_MALZEMELER",
    setPrice: "SET_PRICE",
    setSiparisNotu: "SET_SIPARIS_NOTU",
    addCart: "ADD_CART",
    removeFromCart: "REMOVE_FROM_CART",
    updateCart: "UPDATE_CART",
    clearCart: "CLEAR_CART",
    setCustomPizza: "SET_CUSTOM_PIZZA",
    setCount: "SET_COUNT",
};

export const orderReducer = (state = initialState, action) => {
    switch (action.type) {
        case orderActions.setHamur:
            return {
                ...state,
                customPizza: {
                    ...state.customPizza,
                    dough: action.payload,
                },
            };
        case orderActions.setBoyut:
            return {
                ...state,
                customPizza: {
                    ...state.customPizza,
                    size: action.payload,
                },
            };
        case orderActions.setMalzemeler:
            return {
                ...state,
                customPizza: {
                    ...state.customPizza,
                    items: action.payload,
                },
            };
        case orderActions.setPrice:
            return {
                ...state,
                customPizza: {
                    ...state.customPizza,
                    price: action.payload,
                },
            };
        case orderActions.setSiparisNotu:
          return {
            ...state,
            customPizza: {
                ...state.customPizza,
                siparisNotu: action.payload,
            }
          }
        case orderActions.addCart:
            const existingItemIndex = state.cart.findIndex(
                (item) => item.product.product_id === action.payload.product.product_id
            );

            if (existingItemIndex !== -1) {
                
                const updatedCart = state.cart.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, count: item.count + 1, product: action.payload.product }
                        : item
                );
                return {
                    ...state,
                    cart: updatedCart,
                };
            } else {
                
                return {
                    ...state,
                    cart: [...state.cart, { count: 1, product: action.payload.product }],
                };
            }
        case orderActions.removeFromCart:
            return {
                ...state,
                cart: state.cart.filter((item, index) => index !== action.payload),
            };
        case orderActions.updateCart:
            return {
                ...state,
                cart: state.cart.map((item, index) =>
                    index === action.payload.index
                        ? { ...item, ...action.payload.updatedItem }
                        : item
                ),
            };
        case orderActions.clearCart:
            return {
                ...state,
                cart: [],
            };
        case orderActions.setCount:
            return {
                ...state,
                cart: state.cart.map((item, index) =>
                    index === action.payload.index
                        ? { ...item, count: action.payload.count }
                        : item
                ),
            };
        default:
            return state;
    }
};