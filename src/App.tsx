import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AssessmentProvider } from "@/context/AssessmentContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthAnalistaProvider } from "@/context/AuthAnalistaContext";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import SituationalTest from "./pages/SituationalTest";
import SprangerTest from "./pages/SprangerTest";
import Results from "./pages/Results";
import RelatorioPublico from "./pages/RelatorioPublico";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TesteAnalista from "./pages/TesteAnalista";

// Login unificado para Fundador/Analista
import Login from "./pages/Login";

// Painel do Gestor
import PainelLogin from "./pages/painel/Login";
import PainelLayout from "./components/painel/PainelLayout";
import ProtectedRoute from "./components/painel/ProtectedRoute";
import PainelDashboard from "./pages/painel/Dashboard";
import PainelCandidatos from "./pages/painel/Candidatos";
import PainelAnalistas from "./pages/painel/Analistas";
import PainelNovoAnalista from "./pages/painel/NovoAnalista";
import PainelAnalistaDetalhes from "./pages/painel/AnalistaDetalhes";
import PainelConfiguracoes from "./pages/painel/Configuracoes";

// Painel do Fundador
import FundadorLayout from "./components/fundador/FundadorLayout";
import ProtectedRouteFundador from "./components/auth/ProtectedRouteFundador";
import FundadorDashboard from "./pages/fundador/Dashboard";
import MetricasValidacao from "./pages/fundador/MetricasValidacao";

// Painel do Analista
import AnalistaLayout from "./components/analista/AnalistaLayout";
import ProtectedRouteAnalista from "./components/auth/ProtectedRouteAnalista";
import AnalistaDashboard from "./pages/analista/Dashboard";
import AnalistaCandidatos from "./pages/analista/Candidatos";
import AnalistaConfiguracoes from "./pages/analista/Configuracoes";

// Página de Base Científica
import BaseCientifica from "./pages/BaseCientifica";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AuthAnalistaProvider>
          <AssessmentProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Rotas públicas do teste */}
                <Route path="/" element={<Index />} />
                <Route path="/teste" element={<Assessment />} />
                <Route path="/teste/:linkUnico" element={<TesteAnalista />} />
                <Route path="/teste-situacional" element={<SituationalTest />} />
                <Route path="/teste-valores" element={<SprangerTest />} />
                <Route path="/resultado" element={<Results />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/relatorio/:id" element={<RelatorioPublico />} />
                <Route path="/base-cientifica" element={<BaseCientifica />} />

                {/* Login unificado para Fundador/Analista */}
                <Route path="/login" element={<Login />} />

                {/* Painel do Fundador */}
                <Route
                  path="/fundador"
                  element={
                    <ProtectedRouteFundador>
                      <FundadorLayout />
                    </ProtectedRouteFundador>
                  }
                >
                  <Route index element={<Navigate to="/fundador/dashboard" replace />} />
                  <Route path="dashboard" element={<FundadorDashboard />} />
                  <Route path="analistas" element={<FundadorDashboard />} />
                  <Route path="licencas" element={<FundadorDashboard />} />
                  <Route path="metricas" element={<MetricasValidacao />} />
                  <Route path="configuracoes" element={<FundadorDashboard />} />
                </Route>

                {/* Painel do Analista */}
                <Route
                  path="/analista"
                  element={
                    <ProtectedRouteAnalista>
                      <AnalistaLayout />
                    </ProtectedRouteAnalista>
                  }
                >
                  <Route index element={<Navigate to="/analista/dashboard" replace />} />
                  <Route path="dashboard" element={<AnalistaDashboard />} />
                  <Route path="candidatos" element={<AnalistaCandidatos />} />
                  <Route path="configuracoes" element={<AnalistaConfiguracoes />} />
                </Route>

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
                  <Route path="analistas" element={<PainelAnalistas />} />
                  <Route path="analista/:id" element={<PainelAnalistaDetalhes />} />
                  <Route path="candidatos" element={<PainelCandidatos />} />
                  <Route path="novo-analista" element={<PainelNovoAnalista />} />
                  <Route path="configuracoes" element={<PainelConfiguracoes />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AssessmentProvider>
        </AuthAnalistaProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
