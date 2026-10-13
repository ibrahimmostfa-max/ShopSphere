import React, { useState, useMemo } from "react";
import { useShop } from "../context/ShopContext";
import { CATEGORIES } from "../data/initialProducts";
import ProductCard from "./ProductCard";

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Lowest Price" },
  { value: "price-desc", label: "Highest Price" },
  { value: "rating", label: "Top Rated" },
];

export default function ProductsSection() {
  const { state, dispatch, filteredProducts } = useShop();

  // local price slider state (global priceRange is in context)
  const [localPrice, setLocalPrice] = useState(state.priceRange);

  const products = useMemo(() => filteredProducts(), [filteredProducts]);

  // Group by category for tabbed view
  const groceries = products.filter((p) => p.category === "Groceries");
  const electronics = products.filter((p) => p.category === "Electronics");

  const [activeTab, setActiveTab] = useState("All");

  const displayProducts =
    activeTab === "All"
      ? products
      : activeTab === "Groceries"
      ? groceries
      : electronics;

  const handlePriceCommit = () => {
    dispatch({ type: "SET_PRICE_RANGE", range: localPrice });
  };

  return (
    <section className="products-section" id="products-section">
      {/* Section header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            🛍 All <span className="accent-text">Products</span>
          </h2>
          <p className="section-sub">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Sort */}
        <select
          id="sort-select"
          className="form-input sort-select"
          value={state.sortBy}
          onChange={(e) =>
            dispatch({ type: "SET_SORT", sortBy: e.target.value })
          }
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filters bar */}
      <div className="filters-bar">
        {/* Price range */}
        <div className="price-filter">
          <label className="form-label">
            Price: $0 — ${localPrice[1]}
          </label>
          <input
            id="price-range-slider"
            type="range"
            min={0}
            max={1000}
            step={5}
            value={localPrice[1]}
            onChange={(e) => setLocalPrice([0, Number(e.target.value)])}
            onMouseUp={handlePriceCommit}
            onTouchEnd={handlePriceCommit}
            className="price-slider"
          />
        </div>

        {/* Reset filters */}
        {(state.searchTerm || state.activeCategory !== "All" || state.sortBy !== "default" || state.priceRange[1] !== 1000) && (
          <button
            id="reset-filters-btn"
            className="pill-btn reset-btn"
            onClick={() => {
              dispatch({ type: "SET_SEARCH", term: "" });
              dispatch({ type: "SET_CATEGORY", category: "All" });
              dispatch({ type: "SET_SORT", sortBy: "default" });
              dispatch({ type: "SET_PRICE_RANGE", range: [0, 1000] });
              setLocalPrice([0, 1000]);
            }}
          >
            ✕ Reset Filters
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="cat-tabs">
        {["All", ...CATEGORIES].map((tab) => (
          <button
            key={tab}
            id={`tab-${tab.replace(/\s/g, "-")}`}
            className={`cat-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Groceries" && "🥦 "}
            {tab === "Electronics" && "⚡ "}
            {tab === "All" && "🛍 "}
            {tab}
            <span className="tab-count">
              {tab === "All"
                ? products.length
                : tab === "Groceries"
                ? groceries.length
                : electronics.length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {displayProducts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="products-grid">
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
