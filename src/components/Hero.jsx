import React, { useState, useEffect } from "react";
import { useShop } from "../context/ShopContext";

const SLIDES = [
  {
    badge: "🔥 Flash Deals",
    title: "Premium Picks,\nUnbeatable Prices",
    sub: "Up to 35% off on Electronics & Fresh Groceries this week only.",
    cta: "Shop Flash Deals",
    category: "All",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    accent: "#e94560",
    img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80",
  },
  {
    badge: "🥦 Organic Freshness",
    title: "Farm to Table,\nEvery Single Day",
    sub: "Hand-picked organic produce delivered within 24 hours of harvest.",
    cta: "Explore Groceries",
    category: "Groceries",
    bg: "linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 50%, #2d5a27 100%)",
    accent: "#7bc67e",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80",
  },
  {
    badge: "⚡ Tech Spotlight",
    title: "Next-Gen Gadgets\nArrived",
    sub: "4K monitors, ANC earbuds, and smart home essentials — all in one place.",
    cta: "See Electronics",
    category: "Electronics",
    bg: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2d1b69 100%)",
    accent: "#a78bfa",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80",
  },
];

export default function Hero() {
  const { dispatch } = useShop();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => goTo((current + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, [current]);

  const goTo = (idx) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 300);
  };

  const slide = SLIDES[current];

  const handleCTA = () => {
    dispatch({ type: "SET_CATEGORY", category: slide.category });
    dispatch({ type: "SET_VIEW", view: "storefront" });
    document
      .getElementById("products-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className={`hero-root ${animating ? "hero-fade-out" : "hero-fade-in"}`}
      style={{ background: slide.bg }}
    >
      {/* Decorative orbs */}
      <div
        className="hero-orb orb1"
        style={{ background: slide.accent + "33" }}
      />
      <div
        className="hero-orb orb2"
        style={{ background: slide.accent + "22" }}
      />

      <div className="hero-content">
        <div className="hero-text">
          <span className="hero-badge" style={{ borderColor: slide.accent, color: slide.accent }}>
            {slide.badge}
          </span>
          <h1 className="hero-title">
            {slide.title.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>
          <p className="hero-sub">{slide.sub}</p>
          <button
            id={`hero-cta-${current}`}
            className="hero-cta"
            style={{ background: slide.accent }}
            onClick={handleCTA}
          >
            {slide.cta} →
          </button>
        </div>

        <div className="hero-img-wrap">
          <img
            src={slide.img}
            alt={slide.badge}
            className="hero-img"
            loading="eager"
          />
          <div
            className="hero-img-glow"
            style={{ background: slide.accent + "44" }}
          />
        </div>
      </div>

      {/* Dots */}
      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            id={`hero-dot-${i}`}
            className={`hero-dot ${i === current ? "active" : ""}`}
            style={i === current ? { background: slide.accent } : {}}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}
