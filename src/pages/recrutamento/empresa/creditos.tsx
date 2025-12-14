// =====================================================
// CRÉDITOS - Área de Recrutamento VEON
// Com slogans e frases motivacionais
// =====================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

const Creditos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-6 h-6 text-[#E31E24]" />
            <h1 className="text-3xl font-bold text-white">Créditos</h1>
          </div>
          <p className="text-slate-400">
            Gerencie seus créditos e continue recrutando
          </p>
        </div>

        {/* Saldo atual */}
        <Card className="bg-gradient-to-r from-[#E31E24]/20 to-[#003DA5]/20 border-slate-700 mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-slate-400 mb-2">Saldo disponível</p>
            <p className="text-5xl font-bold text-white mb-4">R$ 0,00</p>
            <Button className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B]">
              <CreditCard className="w-4 h-4 mr-2" />
              Adicionar créditos
            </Button>
          </CardContent>
        </Card>

        {/* Benefícios */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Acesso ilimitado</h3>
              <p className="text-sm text-slate-400">Veja todos os candidatos</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Perfil DISC completo</h3>
              <p className="text-sm text-slate-400">Análise comportamental</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Contato direto</h3>
              <p className="text-sm text-slate-400">Fale com candidatos</p>
            </CardContent>
          </Card>
        </div>

        {/* Histórico placeholder */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white">Histórico de transações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-center py-8">
              Nenhuma transação realizada ainda
            </p>
          </CardContent>
        </Card>

        {/* Rodapé com slogan */}
        <div className="text-center pt-6 border-t border-slate-800">
          <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Invista em contratações certeiras</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-slate-500 text-sm">
            Recruta Veon - Conectando talentos às melhores oportunidades
          </p>
        </div>
      </div>
    </div>
  );
};

export default Creditos;
