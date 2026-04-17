import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
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
import { AdminDashboard } from "./app/admin/AdminDashboard";
import { AdminLogin } from "./app/admin/AdminLogin";
import { CartProvider } from "./app/context/CartContext";
import { HelmetProvider } from "react-helmet-async";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
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
                  <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
              </CartProvider>
            </WishlistProvider>
          </StoreProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);