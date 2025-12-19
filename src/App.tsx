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

// Painel do Gestor - Área de Recrutamento
import {
  RecrutamentoDashboard,
  RecrutamentoEmpresas,
  RecrutamentoCandidatos,
  RecrutamentoVagas,
  RecrutamentoEntrevistas,
  RecrutamentoFinanceiro,
  RecrutamentoNotificacoes,
  RecrutamentoExclusoes,
} from "./pages/painel/recrutamento";

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

// Área de Recrutamento - Empresa
import EmpresaBemVindo from "./recrutamento/empresa/BemVindo";
import EmpresaLogin from "./recrutamento/empresa/Login";
import EmpresaCadastro from "./recrutamento/empresa/Cadastro";
import EmpresaCadastroRapido from "./recrutamento/empresa/CadastroRapido";
import EmpresaRecuperarSenha from "./recrutamento/empresa/RecuperarSenha";
import EmpresaLayout from "./recrutamento/empresa/components/EmpresaLayout";
import {
  EmpresaDashboard,
  BuscarCandidatos,
  MinhasVagas,
  EmProcesso,
  Contratados,
  Creditos,
  Configuracoes as EmpresaConfiguracoes,
  NotificacoesEmpresa,
  SobreEmpresa,
  EmpresaCompletarCadastro,
  VerCurriculoCandidato,
} from "./recrutamento/empresa/pages";

// Área de Recrutamento - Candidato (Cadastro)
import CandidatoBemVindo from "./recrutamento/candidato/BemVindo";
import CandidatoLogin from "./recrutamento/candidato/Login";
import CandidatoCadastroRapido from "./recrutamento/candidato/CadastroRapido";
import CandidatoCadastro from "./recrutamento/candidato/Cadastro";
import CandidatoRecuperarSenha from "./recrutamento/candidato/RecuperarSenha";
import CandidatoSelfie from "./recrutamento/candidato/Selfie";
import CandidatoVideo from "./recrutamento/candidato/Video";
import CandidatoDocumento from "./recrutamento/candidato/Documento";
import CandidatoTermos from "./recrutamento/candidato/Termos";

// Área de Recrutamento - Candidato (Painel)
import CandidatoLayout from "./recrutamento/candidato/components/CandidatoLayout";
import {
  Inicio as CandidatoInicio,
  PropostasCandidato,
  FeedVagas,
  MeuCurriculoCandidato,
  ConfiguracoesCandidato,
  NotificacoesCandidato,
  CompletarCadastro as CandidatoCompletarCadastro,
  CurriculoPublico,
} from "./recrutamento/candidato/pages";
import DiscConcluido from "./recrutamento/candidato/pages/DiscConcluido";

// Tela Inicial de Recrutamento
import TelaInicial from "./recrutamento/TelaInicial";

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
                {/* Rota inicial - Direciona para tela de recrutamento */}
                <Route path="/" element={<Navigate to="/recrutamento" replace />} />
                <Route path="/recrutamento" element={<TelaInicial />} />

                {/* Rotas públicas do teste */}
                <Route path="/inicio" element={<Index />} />
                <Route path="/teste" element={<Assessment />} />
                <Route path="/teste/:linkUnico" element={<TesteAnalista />} />
                <Route path="/teste-situacional" element={<SituationalTest />} />
                <Route path="/teste-valores" element={<SprangerTest />} />
                <Route path="/resultado" element={<Results />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/relatorio/:id" element={<RelatorioPublico />} />
                <Route path="/base-cientifica" element={<BaseCientifica />} />

                {/* Currículo Público - Link compartilhável do candidato */}
                <Route path="/c/:shortId" element={<CurriculoPublico />} />

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
                  {/* Área de Recrutamento no Painel do Gestor */}
                  <Route path="recrutamento" element={<RecrutamentoDashboard />} />
                  <Route path="recrutamento/empresas" element={<RecrutamentoEmpresas />} />
                  <Route path="recrutamento/candidatos" element={<RecrutamentoCandidatos />} />
                  <Route path="recrutamento/vagas" element={<RecrutamentoVagas />} />
                  <Route path="recrutamento/entrevistas" element={<RecrutamentoEntrevistas />} />
                  <Route path="recrutamento/financeiro" element={<RecrutamentoFinanceiro />} />
                  <Route path="recrutamento/notificacoes" element={<RecrutamentoNotificacoes />} />
                  <Route path="recrutamento/exclusoes" element={<RecrutamentoExclusoes />} />
                </Route>

                {/* Área de Recrutamento - Empresa */}
                <Route path="/recrutamento/empresa/bem-vindo" element={<EmpresaBemVindo />} />
                <Route path="/recrutamento/empresa/login" element={<EmpresaLogin />} />
                <Route path="/recrutamento/empresa/cadastro" element={<EmpresaCadastro />} />
                <Route path="/recrutamento/empresa/cadastro-rapido" element={<EmpresaCadastroRapido />} />
                <Route path="/recrutamento/empresa/recuperar-senha" element={<EmpresaRecuperarSenha />} />
                <Route path="/recrutamento/empresa/candidato/:candidatoId" element={<VerCurriculoCandidato />} />
                <Route path="/recrutamento/empresa" element={<EmpresaLayout />}>
                  <Route index element={<Navigate to="/recrutamento/empresa/dashboard" replace />} />
                  <Route path="dashboard" element={<EmpresaDashboard />} />
                  <Route path="buscar-candidatos" element={<BuscarCandidatos />} />
                  <Route path="minhas-vagas" element={<MinhasVagas />} />
                  <Route path="em-processo" element={<EmProcesso />} />
                  <Route path="contratados" element={<Contratados />} />
                  <Route path="creditos" element={<Creditos />} />
                  <Route path="sobre-empresa" element={<SobreEmpresa />} />
                  <Route path="completar-cadastro" element={<EmpresaCompletarCadastro />} />
                  <Route path="configuracoes" element={<EmpresaConfiguracoes />} />
                  <Route path="notificacoes" element={<NotificacoesEmpresa />} />
                </Route>

                {/* Área de Recrutamento - Candidato (Cadastro) */}
                <Route path="/recrutamento/candidato/bem-vindo" element={<CandidatoBemVindo />} />
                <Route path="/recrutamento/candidato/login" element={<CandidatoLogin />} />
                <Route path="/recrutamento/candidato/cadastro-rapido" element={<CandidatoCadastroRapido />} />
                <Route path="/recrutamento/candidato/cadastro" element={<CandidatoCadastro />} />
                <Route path="/recrutamento/candidato/recuperar-senha" element={<CandidatoRecuperarSenha />} />
                <Route path="/recrutamento/candidato/selfie" element={<CandidatoSelfie />} />
                <Route path="/recrutamento/candidato/video" element={<CandidatoVideo />} />
                <Route path="/recrutamento/candidato/documento" element={<CandidatoDocumento />} />
                <Route path="/recrutamento/candidato/termos" element={<CandidatoTermos />} />

                {/* Área de Recrutamento - Candidato (Painel) */}
                <Route path="/recrutamento/candidato" element={<CandidatoLayout />}>
                  <Route index element={<Navigate to="/recrutamento/candidato/inicio" replace />} />
                  <Route path="inicio" element={<CandidatoInicio />} />
                  <Route path="vagas" element={<FeedVagas />} />
                  <Route path="propostas" element={<PropostasCandidato />} />
                  <Route path="meu-curriculo" element={<MeuCurriculoCandidato />} />
                  <Route path="configuracoes" element={<ConfiguracoesCandidato />} />
                  <Route path="notificacoes" element={<NotificacoesCandidato />} />
                  <Route path="completar-cadastro" element={<CandidatoCompletarCadastro />} />
                  <Route path="disc-concluido" element={<DiscConcluido />} />
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
