import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { initialProducts } from "../data/initialProducts";

// ─── Constants ──────────────────────────────────────────────────────────────
const TAX_RATE = 0.08;
const SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING = 4.99;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const persist = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// ─── Initial State ────────────────────────────────────────────────────────────
const buildInitialState = () => ({
  products: loadFromStorage("ec_products", initialProducts),
  cart: loadFromStorage("ec_cart", []),
  theme: loadFromStorage("ec_theme", "light"),
  searchTerm: "",
  activeCategory: "All",
  sortBy: "default",
  priceRange: [0, 1000],
  view: "storefront", // 'storefront' | 'admin'
  quickViewProduct: null,
  checkoutOpen: false,
  orderSuccess: false,
});

// ─── Reducer ──────────────────────────────────────────────────────────────────
function shopReducer(state, action) {
  switch (action.type) {
    // ── Cart ──
    case "CART_ADD": {
      const exists = state.cart.find((i) => i.id === action.product.id);
      const cart = exists
        ? state.cart.map((i) =>
            i.id === action.product.id
              ? { ...i, qty: i.qty + 1 }
              : i
          )
        : [...state.cart, { ...action.product, qty: 1 }];
      return { ...state, cart };
    }
    case "CART_INCREMENT": {
      const cart = state.cart.map((i) =>
        i.id === action.id ? { ...i, qty: i.qty + 1 } : i
      );
      return { ...state, cart };
    }
    case "CART_DECREMENT": {
      const cart = state.cart
        .map((i) =>
          i.id === action.id ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0);
      return { ...state, cart };
    }
    case "CART_REMOVE": {
      return { ...state, cart: state.cart.filter((i) => i.id !== action.id) };
    }
    case "CART_CLEAR":
      return { ...state, cart: [] };

    // ── Products CRUD ──
    case "PRODUCT_ADD":
      return { ...state, products: [...state.products, action.product] };
    case "PRODUCT_UPDATE":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.product.id ? { ...p, ...action.product } : p
        ),
      };
    case "PRODUCT_DELETE":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.id),
        cart: state.cart.filter((i) => i.id !== action.id),
      };

    // ── UI ──
    case "SET_THEME":
      return { ...state, theme: action.theme };
    case "SET_SEARCH":
      return { ...state, searchTerm: action.term };
    case "SET_CATEGORY":
      return { ...state, activeCategory: action.category };
    case "SET_SORT":
      return { ...state, sortBy: action.sortBy };
    case "SET_PRICE_RANGE":
      return { ...state, priceRange: action.range };
    case "SET_VIEW":
      return { ...state, view: action.view };
    case "SET_QUICK_VIEW":
      return { ...state, quickViewProduct: action.product };
    case "SET_CHECKOUT_OPEN":
      return { ...state, checkoutOpen: action.open };
    case "SET_ORDER_SUCCESS":
      return { ...state, orderSuccess: action.success };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const [state, dispatch] = useReducer(shopReducer, undefined, buildInitialState);

  // Persist side-effects
  useEffect(() => persist("ec_products", state.products), [state.products]);
  useEffect(() => persist("ec_cart", state.cart), [state.cart]);
  useEffect(() => {
    persist("ec_theme", state.theme);
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  // ── Derived values ────────────────────────────────────────────────────────
  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);

  const subtotal = state.cart.reduce(
    (s, i) => s + (i.discountPrice ?? i.originalPrice) * i.qty,
    0
  );
  const shipping = subtotal === 0 ? 0 : subtotal >= SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + shipping + tax;

  const flashDeals = state.products.filter(
    (p) => p.discountPrice && p.discountPrice < p.originalPrice
  );

  const filteredProducts = useCallback(() => {
    let list = [...state.products];
    if (state.activeCategory !== "All") {
      list = list.filter((p) => p.category === state.activeCategory);
    }
    if (state.searchTerm) {
      const q = state.searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    list = list.filter((p) => {
      const price = p.discountPrice ?? p.originalPrice;
      return price >= state.priceRange[0] && price <= state.priceRange[1];
    });
    switch (state.sortBy) {
      case "price-asc":
        list.sort(
          (a, b) =>
            (a.discountPrice ?? a.originalPrice) -
            (b.discountPrice ?? b.originalPrice)
        );
        break;
      case "price-desc":
        list.sort(
          (a, b) =>
            (b.discountPrice ?? b.originalPrice) -
            (a.discountPrice ?? a.originalPrice)
        );
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return list;
  }, [state.products, state.activeCategory, state.searchTerm, state.priceRange, state.sortBy]);

  return (
    <ShopContext.Provider
      value={{
        state,
        dispatch,
        cartCount,
        subtotal,
        shipping,
        tax,
        grandTotal,
        flashDeals,
        filteredProducts,
        TAX_RATE,
        SHIPPING_THRESHOLD,
        FLAT_SHIPPING,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
};
