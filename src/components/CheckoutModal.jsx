import React, { useState } from "react";
import { useShop } from "../context/ShopContext";

const PAYMENT_METHODS = ["Credit Card", "Debit Card", "PayPal", "Cash on Delivery"];

const BLANK = {
  name: "",
  address: "",
  city: "",
  phone: "",
  payment: "Credit Card",
  card: "",
};

export default function CheckoutModal() {
  const { state, dispatch, subtotal, shipping, tax, grandTotal } = useShop();
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!state.checkoutOpen && !state.orderSuccess) return null;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (state.orderSuccess) {
    return (
      <div className="modal-backdrop" id="order-success-backdrop">
        <div className="modal-box success-box" id="order-success-box">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">Order Placed!</h2>
          <p className="success-sub">
            Thank you for your purchase. Your order is being processed and
            will be delivered soon.
          </p>
          <div className="success-summary">
            <span>Order Total:</span>
            <span className="success-total">${grandTotal.toFixed(2)}</span>
          </div>
          <button
            id="continue-after-order-btn"
            className="btn-primary"
            onClick={() => {
              dispatch({ type: "SET_ORDER_SUCCESS", success: false });
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name required";
    if (!form.address.trim()) e.address = "Address required";
    if (!form.city.trim()) e.city = "City required";
    if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone)) e.phone = "Valid phone required";
    if (
      form.payment === "Credit Card" || form.payment === "Debit Card"
    ) {
      if (!/^\d{16}$/.test(form.card.replace(/\s/g, "")))
        e.card = "16-digit card number required";
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      dispatch({ type: "CART_CLEAR" });
      dispatch({ type: "SET_CHECKOUT_OPEN", open: false });
      dispatch({ type: "SET_ORDER_SUCCESS", success: true });
      setLoading(false);
      setForm(BLANK);
    }, 1800);
  };

  const f = (key, label, type = "text", placeholder = "") => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        id={`checkout-${key}`}
        type={type}
        className={`form-input ${errors[key] ? "error" : ""}`}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => {
          setForm((v) => ({ ...v, [key]: e.target.value }));
          setErrors((v) => ({ ...v, [key]: "" }));
        }}
      />
      {errors[key] && <span className="form-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div
      className="modal-backdrop"
      onClick={() => dispatch({ type: "SET_CHECKOUT_OPEN", open: false })}
      id="checkout-backdrop"
    >
      <div
        className="modal-box checkout-box"
        onClick={(e) => e.stopPropagation()}
        id="checkout-modal"
      >
        <div className="modal-header">
          <h3>🧾 Checkout</h3>
          <button
            id="close-checkout-btn"
            className="icon-btn"
            onClick={() => dispatch({ type: "SET_CHECKOUT_OPEN", open: false })}
          >
            ✕
          </button>
        </div>

        <div className="checkout-layout">
          {/* Form */}
          <form onSubmit={handleSubmit} className="checkout-form">
            <h4 className="form-section-title">Delivery Details</h4>
            {f("name", "Full Name *", "text", "Jane Doe")}
            {f("phone", "Phone *", "tel", "+1 555 000 0000")}
            {f("address", "Street Address *", "text", "123 Main St")}
            {f("city", "City / Town *", "text", "New York")}

            <h4 className="form-section-title">Payment Method</h4>
            <div className="form-group">
              <label className="form-label">Select Method</label>
              <select
                id="checkout-payment"
                className="form-input"
                value={form.payment}
                onChange={(e) =>
                  setForm((v) => ({ ...v, payment: e.target.value }))
                }
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            {(form.payment === "Credit Card" || form.payment === "Debit Card") &&
              f("card", "Card Number *", "text", "1234 5678 9012 3456")}

            <button
              id="place-order-btn"
              type="submit"
              className={`btn-primary checkout-submit ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Processing…" : `Place Order · $${grandTotal.toFixed(2)}`}
            </button>
          </form>

          {/* Order summary sidebar */}
          <div className="checkout-summary">
            <h4 className="form-section-title">Order Summary</h4>
            <div className="checkout-items">
              {state.cart.map((item) => {
                const price = item.discountPrice ?? item.originalPrice;
                return (
                  <div className="checkout-item" key={item.id}>
                    <img src={item.image} alt={item.title} className="checkout-item-img" />
                    <div>
                      <p className="checkout-item-title">{item.title}</p>
                      <p className="checkout-item-meta">
                        {item.qty} × ${price.toFixed(2)}
                      </p>
                    </div>
                    <span>${(price * item.qty).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="checkout-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row grand">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
