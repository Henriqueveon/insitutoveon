import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AssessmentProvider } from "@/context/AssessmentContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import SituationalTest from "./pages/SituationalTest";
import SprangerTest from "./pages/SprangerTest";
import Results from "./pages/Results";
import RelatorioPublico from "./pages/RelatorioPublico";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Painel do Gestor
import PainelLogin from "./pages/painel/Login";
import PainelLayout from "./components/painel/PainelLayout";
import ProtectedRoute from "./components/painel/ProtectedRoute";
import PainelDashboard from "./pages/painel/Dashboard";
import PainelCandidatos from "./pages/painel/Candidatos";
import PainelLinks from "./pages/painel/Links";
import PainelConfiguracoes from "./pages/painel/Configuracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AssessmentProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas do teste */}
              <Route path="/" element={<Index />} />
              <Route path="/teste" element={<Assessment />} />
              <Route path="/teste-situacional" element={<SituationalTest />} />
              <Route path="/teste-valores" element={<SprangerTest />} />
              <Route path="/resultado" element={<Results />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/relatorio/:id" element={<RelatorioPublico />} />

              {/* Painel do Gestor */}
              <Route path="/painel/login" element={<PainelLogin />} />
              <Route
                path="/painel"
                element={
                  <ProtectedRoute>
                    <PainelLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/painel/dashboard" replace />} />
                <Route path="dashboard" element={<PainelDashboard />} />
                <Route path="candidatos" element={<PainelCandidatos />} />
                <Route path="links" element={<PainelLinks />} />
                <Route path="configuracoes" element={<PainelConfiguracoes />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AssessmentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
