import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Referrals from "./pages/Referrals";
import Profile from "./pages/Profile";
import Withdraw from "./pages/Withdraw";
import Upgrade from "./pages/Upgrade";
import UpgradePayment from "./pages/UpgradePayment";
import UpgradePending from "./pages/UpgradePending";
import GatewayActivation from "./pages/GatewayActivation";
import GatewayPending from "./pages/GatewayPending";
import WithdrawalActivation from "./pages/WithdrawalActivation";
import InstantWithdrawalActivation from "./pages/InstantWithdrawalActivation";
import InstantWithdrawalPending from "./pages/InstantWithdrawalPending";
import WithdrawalActivationPending from "./pages/WithdrawalActivationPending";
import Tasks from "./pages/Tasks";
import Support from "./pages/Support";
import Community from "./pages/Community";
import Spin from "./pages/Spin";
import About from "./pages/About";
import Broadcast from "./pages/Broadcast";
import WalletDetails from "./pages/WalletDetails";
import NotFound from "./pages/NotFound";
import Testimonials from "./pages/Testimonials";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!["/", "/auth"].includes(location.pathname)) {
      return;
    }

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    };

    checkSession();
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/welcome"
        element={
          <ProtectedRoute>
            <Welcome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/referrals"
        element={
          <ProtectedRoute>
            <Referrals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/withdraw"
        element={
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upgrade"
        element={
          <ProtectedRoute>
            <Upgrade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upgrade-payment"
        element={
          <ProtectedRoute>
            <UpgradePayment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upgrade-pending"
        element={
          <ProtectedRoute>
            <UpgradePending />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gateway-activation"
        element={
          <ProtectedRoute>
            <GatewayActivation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gateway-pending"
        element={
          <ProtectedRoute>
            <GatewayPending />
          </ProtectedRoute>
        }
      />
      <Route
        path="/withdrawal-activation"
        element={
          <ProtectedRoute>
            <WithdrawalActivation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instant-withdrawal-activation"
        element={
          <ProtectedRoute>
            <InstantWithdrawalActivation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instant-withdrawal-pending"
        element={
          <ProtectedRoute>
            <InstantWithdrawalPending />
          </ProtectedRoute>
        }
      />
      <Route
        path="/withdrawal-activation-pending"
        element={
          <ProtectedRoute>
            <WithdrawalActivationPending />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <WalletDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route
        path="/spin"
        element={
          <ProtectedRoute>
            <Spin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />
      <Route
        path="/broadcast"
        element={
          <ProtectedRoute>
            <Broadcast />
          </ProtectedRoute>
        }
      />
      <Route
        path="/testimonials"
        element={
          <ProtectedRoute>
            <Testimonials />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
