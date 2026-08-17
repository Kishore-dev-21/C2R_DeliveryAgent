import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DeliveryProvider } from "@/context/DeliveryContext";
import { FraudProvider } from "@/context/FraudContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Deliveries from "./pages/Deliveries";
import Verify from "./pages/Verify";
import FraudAlerts from "./pages/FraudAlerts";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <DeliveryProvider>
          <FraudProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/deliveries" element={<Deliveries />} />
                  <Route path="/verify/:id" element={<Verify />} />
                  <Route path="/fraud-alerts" element={<FraudAlerts />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </FraudProvider>
        </DeliveryProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
