import React, { useState, useRef } from "react";
import { useShop } from "../context/ShopContext";
import { CATEGORIES } from "../data/initialProducts";

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color }) {
  return (
    <div className="kpi-card" style={{ "--kpi-color": color }}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-info">
        <span className="kpi-value">{value}</span>
        <span className="kpi-label">{label}</span>
        {sub && <span className="kpi-sub">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Blank product form state ─────────────────────────────────────────────────
const BLANK = {
  title: "",
  category: CATEGORIES[0],
  description: "",
  image: "",
  originalPrice: "",
  discountPrice: "",
  stock: "",
  rating: "4.5",
  reviews: "0",
  tags: "",
};

// ─── Product Form Modal ───────────────────────────────────────────────────────
function ProductFormModal({ initial, onSave, onClose, isEdit }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          originalPrice: String(initial.originalPrice),
          discountPrice: String(initial.discountPrice ?? ""),
          stock: String(initial.stock),
          rating: String(initial.rating),
          reviews: String(initial.reviews),
          tags: (initial.tags ?? []).join(", "),
        }
      : BLANK
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.originalPrice || isNaN(Number(form.originalPrice)))
      e.originalPrice = "Valid price required";
    if (
      form.discountPrice &&
      isNaN(Number(form.discountPrice))
    )
      e.discountPrice = "Must be a number";
    if (!form.stock || isNaN(Number(form.stock)))
      e.stock = "Valid stock required";
    if (!form.image.trim()) e.image = "Image URL required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const product = {
      ...(initial ?? {}),
      id: initial?.id ?? `p${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      image: form.image.trim(),
      originalPrice: parseFloat(form.originalPrice),
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
      stock: parseInt(form.stock, 10),
      rating: parseFloat(form.rating) || 4.5,
      reviews: parseInt(form.reviews, 10) || 0,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    onSave(product);
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        id={`field-${key}`}
        type={type}
        className={`form-input ${errors[key] ? "error" : ""}`}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => {
          setForm((f) => ({ ...f, [key]: e.target.value }));
          setErrors((er) => ({ ...er, [key]: "" }));
        }}
      />
      {errors[key] && <span className="form-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onClose} id="product-modal-backdrop">
      <div
        className="modal-box large"
        onClick={(e) => e.stopPropagation()}
        id="product-modal-box"
      >
        <div className="modal-header">
          <h3>{isEdit ? "✏ Edit Product" : "➕ Add New Product"}</h3>
          <button className="icon-btn" onClick={onClose} id="close-product-modal">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            {field("title", "Product Title *", "text", "e.g. Organic Avocados")}

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                id="field-category"
                className="form-input"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {field("originalPrice", "Regular Price ($) *", "number", "0.00")}
            {field("discountPrice", "Sale / Discount Price ($)", "number", "Leave blank if no discount")}
            {field("stock", "Stock Count *", "number", "0")}
            {field("rating", "Rating (1–5)", "number", "4.5")}
            {field("reviews", "Review Count", "number", "0")}
          </div>

          {field("image", "Image URL *", "url", "https://...")}
          {field("tags", "Tags (comma-separated)", "text", "e.g. Organic, Fresh")}

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="field-description"
              className="form-input"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Short product description…"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" id="save-product-btn">
              {isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function ConfirmModal({ product, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel} id="confirm-modal-backdrop">
      <div
        className="modal-box small"
        onClick={(e) => e.stopPropagation()}
        id="confirm-modal-box"
      >
        <h3 className="confirm-title">⚠ Delete Product</h3>
        <p className="confirm-text">
          Are you sure you want to delete{" "}
          <strong>"{product.title}"</strong>? This action cannot be undone.
        </p>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel} id="cancel-delete-btn">
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} id="confirm-delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { state, dispatch } = useShop();
  const [tableSearch, setTableSearch] = useState("");
  const [tableCategory, setTableCategory] = useState("All");
  const [addModal, setAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  // ── KPI data ──
  const totalProducts = state.products.length;
  const totalCategories = new Set(state.products.map((p) => p.category)).size;
  const lowStock = state.products.filter((p) => p.stock < 20).length;
  const catalogValue = state.products.reduce(
    (s, p) => s + (p.discountPrice ?? p.originalPrice) * p.stock,
    0
  );

  // ── Filtered table ──
  const tableProducts = state.products.filter((p) => {
    const matchCat =
      tableCategory === "All" || p.category === tableCategory;
    const matchSearch =
      !tableSearch ||
      p.title.toLowerCase().includes(tableSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── CRUD handlers ──
  const handleSave = (product) => {
    if (editProduct) {
      dispatch({ type: "PRODUCT_UPDATE", product });
    } else {
      dispatch({ type: "PRODUCT_ADD", product });
    }
    setAddModal(false);
    setEditProduct(null);
  };

  const handleDelete = () => {
    dispatch({ type: "PRODUCT_DELETE", id: deleteProduct.id });
    setDeleteProduct(null);
  };

  return (
    <div className="admin-root">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">⚙ Admin Dashboard</h1>
          <p className="admin-sub">Manage your store catalog and track inventory</p>
        </div>
        <button
          id="add-product-btn"
          className="btn-primary"
          onClick={() => setAddModal(true)}
        >
          + Add Product
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KpiCard
          icon="📦"
          label="Total Products"
          value={totalProducts}
          color="#6366f1"
        />
        <KpiCard
          icon="🏷"
          label="Categories"
          value={totalCategories}
          color="#0ea5e9"
        />
        <KpiCard
          icon="⚠"
          label="Low Stock"
          value={lowStock}
          sub="< 20 units"
          color="#f59e0b"
        />
        <KpiCard
          icon="💰"
          label="Catalog Value"
          value={`$${catalogValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          color="#10b981"
        />
      </div>

      {/* Table controls */}
      <div className="table-controls">
        <input
          id="admin-search-input"
          type="text"
          className="form-input admin-search"
          placeholder="🔍 Search products…"
          value={tableSearch}
          onChange={(e) => setTableSearch(e.target.value)}
        />
        <select
          id="admin-cat-filter"
          className="form-input"
          value={tableCategory}
          onChange={(e) => setTableCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Product table */}
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Sale Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableProducts.length === 0 && (
              <tr>
                <td colSpan={9} className="table-empty">
                  No products found.
                </td>
              </tr>
            )}
            {tableProducts.map((p) => {
              const hasDisc = p.discountPrice && p.discountPrice < p.originalPrice;
              const status =
                p.stock === 0
                  ? "out"
                  : p.stock < 20
                  ? "low"
                  : "in";
              const statusLabel =
                status === "out"
                  ? "Out of Stock"
                  : status === "low"
                  ? "Low Stock"
                  : "In Stock";
              return (
                <tr key={p.id} id={`admin-row-${p.id}`}>
                  <td>
                    <img
                      src={p.image}
                      alt={p.title}
                      className="table-thumb"
                    />
                  </td>
                  <td className="table-title-cell">{p.title}</td>
                  <td>
                    <span className="product-cat-tag">{p.category}</span>
                  </td>
                  <td>${p.originalPrice.toFixed(2)}</td>
                  <td>
                    {hasDisc ? (
                      <span className="table-sale-price">
                        ${p.discountPrice.toFixed(2)}
                      </span>
                    ) : (
                      <span className="table-no-disc">—</span>
                    )}
                  </td>
                  <td>{p.stock}</td>
                  <td>
                    {"★".repeat(Math.round(p.rating))}
                    {p.rating.toFixed(1)}
                  </td>
                  <td>
                    <span className={`status-tag ${status}`}>{statusLabel}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        id={`edit-${p.id}`}
                        className="btn-icon-edit"
                        onClick={() => setEditProduct(p)}
                      >
                        ✏
                      </button>
                      <button
                        id={`delete-${p.id}`}
                        className="btn-icon-delete"
                        onClick={() => setDeleteProduct(p)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {(addModal || editProduct) && (
        <ProductFormModal
          initial={editProduct}
          isEdit={!!editProduct}
          onSave={handleSave}
          onClose={() => {
            setAddModal(false);
            setEditProduct(null);
          }}
        />
      )}
      {deleteProduct && (
        <ConfirmModal
          product={deleteProduct}
          onConfirm={handleDelete}
          onCancel={() => setDeleteProduct(null)}
        />
      )}
    </div>
  );
}
