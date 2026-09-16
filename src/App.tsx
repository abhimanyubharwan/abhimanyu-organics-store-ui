import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./ScrollToTop";
import { useReveal } from "./useReveal";
import Home from "./pages/Home";

// Home ships in the main bundle because it is where almost every visit lands.
// Every other page is its own small chunk, fetched on first visit — and
// warmed in the background once the home page has settled (see below), so
// clicking through still feels instant.
const pages = {
  Shop: () => import("./pages/Shop"),
  ProductDetail: () => import("./pages/ProductDetail"),
  Story: () => import("./pages/Story"),
  Gifting: () => import("./pages/Gifting"),
  Seasonal: () => import("./pages/Seasonal"),
  Blog: () => import("./pages/Blog"),
  BlogDetail: () => import("./pages/BlogDetail"),
  Gallery: () => import("./pages/Gallery"),
  Bulk: () => import("./pages/Bulk"),
  Wishlist: () => import("./pages/Wishlist"),
  Cart: () => import("./pages/Cart"),
  Account: () => import("./pages/Account"),
};

const Shop = lazy(pages.Shop);
const ProductDetail = lazy(pages.ProductDetail);
const Story = lazy(pages.Story);
const Gifting = lazy(pages.Gifting);
const Seasonal = lazy(pages.Seasonal);
const Blog = lazy(pages.Blog);
const BlogDetail = lazy(pages.BlogDetail);
const Gallery = lazy(pages.Gallery);
const Bulk = lazy(pages.Bulk);
const Wishlist = lazy(pages.Wishlist);
const Cart = lazy(pages.Cart);
const Account = lazy(pages.Account);

function useWarmRoutes() {
  useEffect(() => {
    const warm = () => Object.values(pages).forEach((load) => void load());
    const onLoad = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(warm, { timeout: 4000 });
      } else {
        setTimeout(warm, 2000);
      }
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);
}

export default function App() {
  useReveal();
  useWarmRoutes();

  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Suspense fallback={<div className="route-loading" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/our-story" element={<Story />} />
            <Route path="/gifting" element={<Gifting />} />
            <Route path="/seasonal" element={<Seasonal />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/bulk" element={<Bulk />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
