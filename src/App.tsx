import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReviews from "./pages/admin/AdminReviews";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<><Navbar /><main className="flex-1"><Index /></main><Footer /></>} />
          <Route path="/books" element={<><Navbar /><main className="flex-1"><Books /></main><Footer /></>} />
          <Route path="/books/:slug" element={<><Navbar /><main className="flex-1"><BookDetail /></main><Footer /></>} />
          <Route path="/contact" element={<><Navbar /><main className="flex-1"><Contact /></main><Footer /></>} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
