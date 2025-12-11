import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Target, BarChart3, Users, Award, Compass, FileText } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: 'Autoconhecimento',
      description: 'Descubra seus padrões comportamentais e como você naturalmente se expressa.',
    },
    {
      icon: BarChart3,
      title: 'Análise Profunda',
      description: 'Relatório detalhado com potencialidades, motivadores e áreas de desenvolvimento.',
    },
    {
      icon: Users,
      title: 'Relações Interpessoais',
      description: 'Entenda como você se comunica e se relaciona no ambiente profissional.',
    },
    {
      icon: Award,
      title: 'Desenvolvimento',
      description: 'Plano de ação personalizado para potencializar sua carreira.',
    },
  ];

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <Logo />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Icon */}
          <div className="relative inline-block animate-fade-in">
            <div className="w-24 h-24 rounded-full gradient-veon flex items-center justify-center shadow-xl shadow-glow-blue">
              <Compass className="w-14 h-14 text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-veon-red rounded-full border-4 border-background flex items-center justify-center">
              <span className="text-white text-xs font-bold">DISC</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Descubra seu{' '}
              <span className="text-gradient-veon">Perfil Comportamental</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              A metodologia DISC revela como você age, se comunica e toma decisões.
              Conheça a si mesmo e potencialize sua carreira profissional.
            </p>
          </div>

          {/* CTA Button */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Button
              onClick={() => navigate('/teste')}
              size="lg"
              className="h-14 px-10 text-lg font-semibold gradient-veon hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Iniciar Avaliação Gratuita
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Tempo estimado: 10-15 minutos • 100% confidencial
            </p>
          </div>

          {/* Features Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="card-elevated hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* DISC Preview */}
          <div
            className="flex justify-center gap-4 mt-8 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            {[
              { letter: 'D', color: 'bg-disc-d', label: 'Dominância' },
              { letter: 'I', color: 'bg-disc-i', label: 'Influência' },
              { letter: 'S', color: 'bg-disc-s', label: 'Estabilidade' },
              { letter: 'C', color: 'bg-disc-c', label: 'Conformidade' },
            ].map((factor) => (
              <div key={factor.letter} className="text-center group">
                <div
                  className={`w-14 h-14 ${factor.color} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-default`}
                >
                  <span className="text-white font-bold text-xl">{factor.letter}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">
                  {factor.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-border space-y-3">
        <p className="text-sm text-muted-foreground">
          Instituto VEON © {new Date().getFullYear()} • "Eu sou a bússola que aponta para o sucesso!"
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/pdf-preview')}
          className="text-xs text-muted-foreground hover:text-primary"
        >
          <FileText className="w-3 h-3 mr-1" />
          Visualizar Exemplo de PDF
        </Button>
      </footer>
    </div>
  );
}
