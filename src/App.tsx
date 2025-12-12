import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AssessmentProvider } from "@/context/AssessmentContext";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import SituationalTest from "./pages/SituationalTest";
import SprangerTest from "./pages/SprangerTest";
import Results from "./pages/Results";
import Admin from "./pages/Admin";
import PDFPreview from "./pages/PDFPreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AssessmentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/teste" element={<Assessment />} />
            <Route path="/teste-situacional" element={<SituationalTest />} />
            <Route path="/teste-valores" element={<SprangerTest />} />
            <Route path="/resultado" element={<Results />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/pdf-preview" element={<PDFPreview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AssessmentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
