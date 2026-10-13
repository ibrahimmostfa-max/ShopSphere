import React, { useState } from "react";
import { ShopProvider } from "./context/ShopContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DealsSection from "./components/DealsSection";
import ProductsSection from "./components/ProductsSection";
import CartDrawer from "./components/CartDrawer";
import AdminDashboard from "./components/AdminDashboard";
import CheckoutModal from "./components/CheckoutModal";
import QuickViewModal from "./components/QuickViewModal";
import { useShop } from "./context/ShopContext";

function AppInner() {
  const { state } = useShop();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className={`app-root ${state.theme}`}>
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <main className="main-content">
        {state.view === "admin" ? (
          <AdminDashboard />
        ) : (
          <>
            <Hero />
            <DealsSection />
            <ProductsSection />
          </>
        )}
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <CheckoutModal />
      <QuickViewModal />

      <footer className="app-footer">
        <p>
          © 2025 <strong>ShopSphere</strong> — Premium E-Commerce Experience
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <AppInner />
    </ShopProvider>
  );
}
