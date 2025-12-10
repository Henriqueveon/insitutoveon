import { useState, useEffect } from 'react';

interface Section {
  id: string;
  title: string;
  icon: string;
}

const sections: Section[] = [
  { id: 'overview', title: 'Visão Geral', icon: '📋' },
  { id: 'disc-chart', title: 'Gráfico DISC', icon: '📊' },
  { id: 'amplitude', title: 'Amplitude', icon: '📏' },
  { id: 'progress', title: 'Análises', icon: '📈' },
  { id: 'competencies', title: 'Competências', icon: '🎯' },
  { id: 'jung', title: 'Jung', icon: '🧠' },
  { id: 'valores', title: 'Valores', icon: '💎' },
  { id: 'leadership', title: 'Liderança', icon: '👔' },
  { id: 'recommendations', title: 'Recomendações', icon: '💼' },
  { id: 'action-plan', title: 'Plano de Ação', icon: '✅' },
];

export function ReportNavigation() {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav className="sticky top-[73px] z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border py-3 px-4">
      <div className="max-w-6xl mx-auto">
        <ul className="flex flex-wrap gap-2 justify-center">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <span className="mr-1">{section.icon}</span>
                <span className="hidden sm:inline">{section.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
