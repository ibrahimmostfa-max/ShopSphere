import React, { useState, useEffect, useCallback } from "react";
import { useShop } from "../context/ShopContext";

function useCountdown(targetMs) {
  const [timeLeft, setTimeLeft] = useState(targetMs - Date.now());
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(targetMs - Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const total = Math.max(0, timeLeft);
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return { h, m, s, expired: total === 0 };
}

// Deal ends in ~8 hrs from page load (persisted in session)
const DEAL_END = (() => {
  const stored = sessionStorage.getItem("ec_deal_end");
  if (stored) return Number(stored);
  const t = Date.now() + 8 * 3600 * 1000;
  sessionStorage.setItem("ec_deal_end", t);
  return t;
})();

function CountdownBadge() {
  const { h, m, s } = useCountdown(DEAL_END);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="countdown-wrap">
      <span className="countdown-label">⏱ Ends in:</span>
      {[
        [pad(h), "HRS"],
        [pad(m), "MIN"],
        [pad(s), "SEC"],
      ].map(([val, lbl]) => (
        <div key={lbl} className="countdown-unit">
          <span className="countdown-num">{val}</span>
          <span className="countdown-lbl">{lbl}</span>
        </div>
      ))}
    </div>
  );
}

function DealCard({ product, onAddToCart, onQuickView }) {
  const disc = Math.round(
    ((product.originalPrice - product.discountPrice) / product.originalPrice) *
      100
  );
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="deal-card" id={`deal-card-${product.id}`}>
      {/* Discount badge */}
      <div className="deal-badge">-{disc}% OFF</div>

      {/* Image */}
      <div className="deal-img-wrap" onClick={() => onQuickView(product)}>
        <img src={product.image} alt={product.title} className="deal-img" />
        <div className="deal-img-overlay">
          <span>Quick View 👁</span>
        </div>
      </div>

      <div className="deal-info">
        <span className="product-cat-tag">{product.category}</span>
        <h3 className="deal-title">{product.title}</h3>

        {/* Stars */}
        <div className="star-row">
          {"★".repeat(Math.round(product.rating))}
          {"☆".repeat(5 - Math.round(product.rating))}
          <span className="review-count">({product.reviews})</span>
        </div>

        {/* Prices */}
        <div className="price-row">
          <span className="price-original">
            ${product.originalPrice.toFixed(2)}
          </span>
          <span className="price-sale">${product.discountPrice.toFixed(2)}</span>
        </div>

        {/* Stock */}
        <div className={`stock-badge ${product.stock < 20 ? "low" : ""}`}>
          {product.stock < 20
            ? `⚠ Only ${product.stock} left!`
            : `✓ In Stock (${product.stock})`}
        </div>

        <button
          id={`deal-add-${product.id}`}
          className={`add-btn ${added ? "added" : ""}`}
          onClick={handleAdd}
        >
          {added ? "✓ Added!" : "+ Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default function DealsSection() {
  const { flashDeals, dispatch } = useShop();

  const handleAdd = useCallback(
    (product) => dispatch({ type: "CART_ADD", product }),
    [dispatch]
  );
  const handleQuickView = useCallback(
    (product) => dispatch({ type: "SET_QUICK_VIEW", product }),
    [dispatch]
  );

  if (!flashDeals.length) return null;

  return (
    <section className="deals-section" id="deals-section">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            🔥 Flash <span className="accent-text">Deals</span>
          </h2>
          <p className="section-sub">
            Limited-time offers — grab them before they're gone!
          </p>
        </div>
        <CountdownBadge />
      </div>

      {/* Cards */}
      <div className="deals-grid">
        {flashDeals.map((p) => (
          <DealCard
            key={p.id}
            product={p}
            onAddToCart={handleAdd}
            onQuickView={handleQuickView}
          />
        ))}
      </div>
    </section>
  );
}
