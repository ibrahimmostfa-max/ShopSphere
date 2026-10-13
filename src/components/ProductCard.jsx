import React, { useState } from "react";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product }) {
  const { dispatch } = useShop();
  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const hasDiscount =
    product.discountPrice && product.discountPrice < product.originalPrice;
  const discPct = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.discountPrice) /
          product.originalPrice) *
          100
      )
    : 0;

  const handleAdd = () => {
    dispatch({ type: "CART_ADD", product });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article
      className="product-card"
      id={`product-card-${product.id}`}
    >
      {/* Image area */}
      <div
        className="product-img-wrap"
        onClick={() => dispatch({ type: "SET_QUICK_VIEW", product })}
      >
        {!imgLoaded && <div className="skeleton-img" />}
        <img
          src={product.image}
          alt={product.title}
          className={`product-img ${imgLoaded ? "loaded" : ""}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        <div className="product-img-overlay">
          <span className="quick-view-label">👁 Quick View</span>
        </div>
        {hasDiscount && (
          <span className="product-disc-badge">-{discPct}%</span>
        )}
        {product.stock < 10 && (
          <span className="product-low-badge">Low Stock</span>
        )}
      </div>

      {/* Info */}
      <div className="product-info">
        <span className="product-cat-tag">{product.category}</span>
        <h3 className="product-title">{product.title}</h3>

        {/* Stars */}
        <div className="star-row">
          <span className="stars">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
          </span>
          <span className="review-count">
            {product.rating.toFixed(1)} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="price-row">
          {hasDiscount && (
            <span className="price-original">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="price-sale">
            ${(product.discountPrice ?? product.originalPrice).toFixed(2)}
          </span>
        </div>

        {/* Stock */}
        <div className={`stock-badge ${product.stock < 20 ? "low" : ""}`}>
          {product.stock === 0
            ? "✕ Out of Stock"
            : product.stock < 20
            ? `⚠ Only ${product.stock} left`
            : `✓ In Stock`}
        </div>

        {/* Actions */}
        <div className="product-actions">
          <button
            id={`add-cart-${product.id}`}
            className={`add-btn full-width ${added ? "added" : ""} ${
              product.stock === 0 ? "disabled" : ""
            }`}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {added ? "✓ Added!" : product.stock === 0 ? "Out of Stock" : "+ Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
