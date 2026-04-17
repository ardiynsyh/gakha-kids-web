import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router";
import { MainLayout } from "./app/layouts/MainLayout";
import { HomePage } from "./app/pages/HomePage";
import { ShopPage } from "./app/pages/ShopPage";
import { InfoPage } from "./app/pages/InfoPage";
import { WishlistPage } from "./app/pages/WishlistPage";
import { SearchPage } from "./app/pages/SearchPage";
import { BlogDetailPage } from "./app/pages/BlogDetailPage";
import { TrackOrderPage } from "./app/pages/TrackOrderPage";
import { CheckoutPage } from "./app/pages/CheckoutPage";
import { WishlistProvider } from "./app/context/WishlistContext";
import { ThemeProvider } from "./app/context/ThemeContext";
import { StoreProvider } from "./app/context/StoreContext";
import { CartProvider } from "./app/context/CartContext";
import { HelmetProvider } from "react-helmet-async";
import "./styles/index.css";

function App() {
  return (
    <StrictMode>
      <HelmetProvider>
        <HashRouter>
          <ThemeProvider>
            <StoreProvider>
              <WishlistProvider>
                <CartProvider>
                  <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<HomePage />} />
                      <Route path="shop/:categoryId" element={<ShopPage />} />
                      <Route path="page/:id" element={<InfoPage />} />
                      <Route path="blog/:id" element={<BlogDetailPage />} />
                      <Route path="wishlist" element={<WishlistPage />} />
                      <Route path="search" element={<SearchPage />} />
                      <Route path="track-order" element={<TrackOrderPage />} />
                      <Route path="checkout" element={<CheckoutPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                  </Routes>
                </CartProvider>
              </WishlistProvider>
            </StoreProvider>
          </ThemeProvider>
        </HashRouter>
      </HelmetProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<App />);