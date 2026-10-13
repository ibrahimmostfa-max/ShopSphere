import React, { useState, useRef, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { CATEGORIES } from "../data/initialProducts";

export default function Navbar({ onCartOpen }) {
  const { state, dispatch, cartCount } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const [cartBounce, setCartBounce] = useState(false);

  // animate cart badge when count changes
  useEffect(() => {
    if (cartCount > 0) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  const toggleTheme = () =>
    dispatch({
      type: "SET_THEME",
      theme: state.theme === "light" ? "dark" : "light",
    });

  return (
    <header className="navbar-root">
      <div className="navbar-inner">
        {/* Logo */}
        <button
          className="nav-logo"
          onClick={() => dispatch({ type: "SET_VIEW", view: "storefront" })}
          id="nav-logo-btn"
        >
          <span className="logo-icon">🛒</span>
          <span className="logo-text">
            Shop<span className="logo-accent">Sphere</span>
          </span>
        </button>

        {/* Search */}
        <div className={`nav-search-wrap ${searchFocused ? "focused" : ""}`}>
          <span className="search-icon">🔍</span>
          <input
            ref={searchRef}
            id="nav-search-input"
            type="text"
            placeholder="Search products…"
            value={state.searchTerm}
            onChange={(e) =>
              dispatch({ type: "SET_SEARCH", term: e.target.value })
            }
            onFocus={() => {
              setSearchFocused(true);
              if (state.view !== "storefront")
                dispatch({ type: "SET_VIEW", view: "storefront" });
            }}
            onBlur={() => setSearchFocused(false)}
            className="nav-search-input"
          />
          {state.searchTerm && (
            <button
              className="search-clear"
              onClick={() => dispatch({ type: "SET_SEARCH", term: "" })}
            >
              ✕
            </button>
          )}
        </div>

        {/* Desktop category quick-links */}
        <nav className="nav-links desktop-only">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              id={`nav-cat-${cat.replace(/\s/g, "-")}`}
              className={`nav-cat-btn ${
                state.activeCategory === cat && state.view === "storefront"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                dispatch({ type: "SET_CATEGORY", category: cat });
                dispatch({ type: "SET_VIEW", view: "storefront" });
              }}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="nav-actions">
          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            className="icon-btn"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {state.theme === "light" ? "🌙" : "☀️"}
          </button>

          {/* Admin toggle */}
          <button
            id="admin-nav-btn"
            className={`pill-btn ${state.view === "admin" ? "active-pill" : ""}`}
            onClick={() =>
              dispatch({
                type: "SET_VIEW",
                view: state.view === "admin" ? "storefront" : "admin",
              })
            }
          >
            {state.view === "admin" ? "← Store" : "⚙ Admin"}
          </button>

          {/* Cart */}
          <button
            id="cart-trigger-btn"
            className="cart-btn"
            onClick={onCartOpen}
          >
            <span className="cart-icon">🛍</span>
            {cartCount > 0 && (
              <span className={`cart-badge ${cartBounce ? "bounce" : ""}`}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* Hamburger */}
          <button
            id="hamburger-btn"
            className="icon-btn mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              className={`mobile-cat-btn ${
                state.activeCategory === cat ? "active" : ""
              }`}
              onClick={() => {
                dispatch({ type: "SET_CATEGORY", category: cat });
                dispatch({ type: "SET_VIEW", view: "storefront" });
                setMenuOpen(false);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
