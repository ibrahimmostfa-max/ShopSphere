import React, { useEffect, useRef } from "react";
import { useShop } from "../context/ShopContext";

export default function CartDrawer({ open, onClose }) {
  const { state, dispatch, cartCount, subtotal, shipping, tax, grandTotal, SHIPPING_THRESHOLD } =
    useShop();
  const drawerRef = useRef(null);

  // trap focus
  useEffect(() => {
    if (open) drawerRef.current?.focus();
  }, [open]);

  // close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const openCheckout = () => {
    onClose();
    setTimeout(() => dispatch({ type: "SET_CHECKOUT_OPEN", open: true }), 250);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${open ? "visible" : ""}`}
        onClick={onClose}
        id="cart-drawer-backdrop"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        tabIndex={-1}
        className={`cart-drawer ${open ? "open" : ""}`}
        id="cart-drawer"
      >
        {/* Header */}
        <div className="drawer-header">
          <h2 className="drawer-title">
            🛍 My Cart{" "}
            {cartCount > 0 && (
              <span className="drawer-count">{cartCount}</span>
            )}
          </h2>
          <button id="close-drawer-btn" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Free shipping notice */}
        {subtotal > 0 && subtotal < SHIPPING_THRESHOLD && (
          <div className="free-shipping-bar">
            <div
              className="free-shipping-fill"
              style={{ width: `${(subtotal / SHIPPING_THRESHOLD) * 100}%` }}
            />
            <span>
              Add ${(SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for FREE
              shipping!
            </span>
          </div>
        )}
        {subtotal >= SHIPPING_THRESHOLD && subtotal > 0 && (
          <div className="free-shipping-bar achieved">
            <div className="free-shipping-fill" style={{ width: "100%" }} />
            <span>🎉 You've unlocked FREE shipping!</span>
          </div>
        )}

        {/* Items */}
        <div className="drawer-items">
          {state.cart.length === 0 ? (
            <div className="cart-empty">
              <span className="empty-icon">🛒</span>
              <p>Your cart is empty</p>
              <button className="pill-btn" onClick={onClose} id="continue-shopping-btn">
                Continue Shopping
              </button>
            </div>
          ) : (
            state.cart.map((item) => {
              const price = item.discountPrice ?? item.originalPrice;
              return (
                <div className="cart-item" key={item.id} id={`cart-item-${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <p className="cart-item-title">{item.title}</p>
                    <p className="cart-item-price">
                      ${price.toFixed(2)} each
                    </p>
                    <div className="qty-controls">
                      <button
                        id={`decr-${item.id}`}
                        className="qty-btn"
                        onClick={() =>
                          dispatch({ type: "CART_DECREMENT", id: item.id })
                        }
                      >
                        −
                      </button>
                      <span className="qty-num">{item.qty}</span>
                      <button
                        id={`incr-${item.id}`}
                        className="qty-btn"
                        onClick={() =>
                          dispatch({ type: "CART_INCREMENT", id: item.id })
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <span className="cart-item-total">
                      ${(price * item.qty).toFixed(2)}
                    </span>
                    <button
                      id={`remove-${item.id}`}
                      className="remove-btn"
                      onClick={() =>
                        dispatch({ type: "CART_REMOVE", id: item.id })
                      }
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        {state.cart.length > 0 && (
          <div className="drawer-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row grand">
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            <button
              id="checkout-btn"
              className="checkout-btn"
              onClick={openCheckout}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
