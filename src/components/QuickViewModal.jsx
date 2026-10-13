import React from "react";
import { useShop } from "../context/ShopContext";

export default function QuickViewModal() {
  const { state, dispatch } = useShop();
  const product = state.quickViewProduct;
  if (!product) return null;

  const hasDisc = product.discountPrice && product.discountPrice < product.originalPrice;
  const discPct = hasDisc
    ? Math.round(
        ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
      )
    : 0;

  const handleAdd = () => {
    dispatch({ type: "CART_ADD", product });
    dispatch({ type: "SET_QUICK_VIEW", product: null });
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => dispatch({ type: "SET_QUICK_VIEW", product: null })}
      id="quick-view-backdrop"
    >
      <div
        className="modal-box qv-box"
        onClick={(e) => e.stopPropagation()}
        id="quick-view-modal"
      >
        <button
          id="close-qv-btn"
          className="icon-btn qv-close"
          onClick={() => dispatch({ type: "SET_QUICK_VIEW", product: null })}
        >
          ✕
        </button>

        <div className="qv-layout">
          {/* Image */}
          <div className="qv-img-wrap">
            <img src={product.image} alt={product.title} className="qv-img" />
            {hasDisc && <span className="product-disc-badge">{-discPct}% OFF</span>}
          </div>

          {/* Details */}
          <div className="qv-info">
            <span className="product-cat-tag">{product.category}</span>
            <h2 className="qv-title">{product.title}</h2>

            <div className="star-row">
              {"★".repeat(Math.round(product.rating))}
              {"☆".repeat(5 - Math.round(product.rating))}
              <span className="review-count">
                {product.rating.toFixed(1)} · {product.reviews} reviews
              </span>
            </div>

            <p className="qv-desc">{product.description}</p>

            <div className="price-row qv-price">
              {hasDisc && (
                <span className="price-original">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="price-sale large">
                ${(product.discountPrice ?? product.originalPrice).toFixed(2)}
              </span>
              {hasDisc && (
                <span className="save-badge">Save ${(product.originalPrice - product.discountPrice).toFixed(2)}</span>
              )}
            </div>

            <div className={`stock-badge ${product.stock < 20 ? "low" : ""}`}>
              {product.stock === 0
                ? "✕ Out of Stock"
                : product.stock < 20
                ? `⚠ Only ${product.stock} left!`
                : `✓ In Stock (${product.stock} units)`}
            </div>

            {(product.tags ?? []).length > 0 && (
              <div className="qv-tags">
                {product.tags.map((t) => (
                  <span key={t} className="qv-tag">{t}</span>
                ))}
              </div>
            )}

            <button
              id="qv-add-cart-btn"
              className="add-btn full-width qv-add"
              onClick={handleAdd}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Out of Stock" : "+ Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
