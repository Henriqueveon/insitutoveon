import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface Campo {
  id: string;
  label: string;
  tipo: "text" | "email" | "tel" | "date" | "number" | "select" | "textarea" | "checkbox" | "radio";
  placeholder?: string;
  opcoes?: { value: string; label: string }[];
  required?: boolean;
}

interface FormularioDinamicoProps {
  campos: Campo[];
  valores: Record<string, unknown>;
  onChange: (id: string, valor: unknown) => void;
}

const FormularioDinamico = ({ campos, valores, onChange }: FormularioDinamicoProps) => {
  return (
    <div className="space-y-4">
      {campos.map((campo) => (
        <div key={campo.id}>
          <Label className="text-white">{campo.label}</Label>
          
          {campo.tipo === "select" && campo.opcoes && (
            <Select 
              value={valores[campo.id] as string || ""} 
              onValueChange={(value) => onChange(campo.id, value)}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder={campo.placeholder || "Selecione..."} />
              </SelectTrigger>
              <SelectContent>
                {campo.opcoes.map((opcao) => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {campo.tipo === "textarea" && (
            <Textarea
              placeholder={campo.placeholder}
              value={valores[campo.id] as string || ""}
              onChange={(e) => onChange(campo.id, e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          )}

          {campo.tipo === "checkbox" && (
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                checked={valores[campo.id] as boolean || false}
                onCheckedChange={(checked) => onChange(campo.id, checked)}
              />
              <span className="text-slate-400 text-sm">{campo.placeholder}</span>
            </div>
          )}

          {campo.tipo === "radio" && campo.opcoes && (
            <RadioGroup
              value={valores[campo.id] as string || ""}
              onValueChange={(value) => onChange(campo.id, value)}
              className="mt-2"
            >
              {campo.opcoes.map((opcao) => (
                <div key={opcao.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opcao.value} id={`${campo.id}-${opcao.value}`} />
                  <Label htmlFor={`${campo.id}-${opcao.value}`} className="text-slate-400">
                    {opcao.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {["text", "email", "tel", "date", "number"].includes(campo.tipo) && (
            <Input
              type={campo.tipo}
              placeholder={campo.placeholder}
              value={valores[campo.id] as string || ""}
              onChange={(e) => onChange(campo.id, e.target.value)}
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FormularioDinamico;
