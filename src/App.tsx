import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import TrackingScripts from "@/components/TrackingScripts";

// Lazy load non-critical routes
const Books = lazy(() => import("./pages/Books"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminBooks = lazy(() => import("./pages/admin/AdminBooks"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminSubscribers = lazy(() => import("./pages/admin/AdminSubscribers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TrackingScripts />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<><Navbar /><main className="flex-1"><Index /></main><Footer /></>} />
            <Route path="/books" element={<><Navbar /><main className="flex-1"><Books /></main><Footer /></>} />
            <Route path="/books/:slug" element={<><Navbar /><main className="flex-1"><BookDetail /></main><Footer /></>} />
            <Route path="/contact" element={<><Navbar /><main className="flex-1"><Contact /></main><Footer /></>} />
            <Route path="/privacy" element={<><Navbar /><main className="flex-1"><PrivacyPolicy /></main><Footer /></>} />
            <Route path="/terms" element={<><Navbar /><main className="flex-1"><Terms /></main><Footer /></>} />
            <Route path="/refund" element={<><Navbar /><main className="flex-1"><RefundPolicy /></main><Footer /></>} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="subscribers" element={<AdminSubscribers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
