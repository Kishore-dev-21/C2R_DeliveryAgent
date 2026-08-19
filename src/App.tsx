import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DeliveryProvider } from "@/context/DeliveryContext";
import { NotificationProvider } from "@/context/NotificationContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Deliveries from "./pages/Deliveries";
import Verify from "./pages/Verify";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Performance from "./pages/Performance";
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
      <Sonner position="top-center" />
      <LanguageProvider>
        <AuthProvider>
          <DeliveryProvider>
            <NotificationProvider>
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
                    <Route path="/history" element={<History />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/performance" element={<Performance />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </DeliveryProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
