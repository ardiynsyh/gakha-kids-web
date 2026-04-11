import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { MainLayout } from "./app/layouts/MainLayout";
import { HomePage } from "./app/pages/HomePage";
import { ShopPage } from "./app/pages/ShopPage";
import { InfoPage } from "./app/pages/InfoPage";
import { WishlistPage } from "./app/pages/WishlistPage";
import { SearchPage } from "./app/pages/SearchPage";
import { WishlistProvider } from "./app/context/WishlistContext";
import { ThemeProvider } from "./app/context/ThemeContext";
import { AdminDashboard } from "./app/admin/AdminDashboard";
import { AdminLogin } from "./app/admin/AdminLogin";
import { BlogDetailPage } from "./app/pages/BlogDetailPage";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <WishlistProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="shop/:categoryId" element={<ShopPage />} />
              <Route path="page/:id" element={<InfoPage />} />
              <Route path="blog/:id" element={<BlogDetailPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="search" element={<SearchPage />} />
            </Route>
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </WishlistProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);