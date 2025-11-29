import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserCredentialsProvider } from "@/contexts/UserCredentialsContext";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import UpdatePrompt from "@/components/UpdatePrompt";
import { useUpdateCheck } from "@/hooks/useUpdateCheck";
import { toast as sonnerToast } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/admin/SignIn";
import SignUp from "./pages/admin/SignUp";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import Dashboard from "./pages/admin/Dashboard";
import TestEdit from "./pages/admin/TestEdit";

const queryClient = new QueryClient();

const App = () => {
  const { updateInfo } = useUpdateCheck();

  // Show Sonner toast when update is available (like your working system)
  useEffect(() => {
    if (updateInfo) {
      console.log("✅ Update found! Showing toast and modal...");
      sonnerToast(`🎉 New version ${updateInfo.latestVersion} available!`, {
        description: updateInfo.changelog,
        action: {
          label: "View Details",
          onClick: () => console.log("Toast action clicked"),
        },
        duration: 10000,
      });
    }
  }, [updateInfo]);

  return (
    <>
      {/* Update prompt OUTSIDE all providers - renders at root level with max z-index */}
      {updateInfo && <UpdatePrompt updateInfo={updateInfo} />}
      
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <AuthProvider>
              <UserCredentialsProvider>
                <AppSettingsProvider>
                  <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin/signin" element={<SignIn />} />
                <Route path="/admin/signup" element={<SignUp />} />
                <Route path="/admin/forgot-password" element={<ForgotPassword />} />
                <Route path="/admin/reset-password" element={<ResetPassword />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/test-edit" 
                  element={
                    <ProtectedRoute>
                      <TestEdit />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppSettingsProvider>
              </UserCredentialsProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </>
  );
};

export default App;
