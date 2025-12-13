import { cn } from "@/lib/utils";

interface MatchIndicatorProps {
  percentual: number;
  size?: "sm" | "md" | "lg";
}

const MatchIndicator = ({ percentual, size = "md" }: MatchIndicatorProps) => {
  const getColor = () => {
    if (percentual >= 80) return "text-green-500 border-green-500";
    if (percentual >= 60) return "text-yellow-500 border-yellow-500";
    return "text-red-500 border-red-500";
  };

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-20 h-20 text-lg"
  };

  return (
    <div className={cn(
      "rounded-full border-2 flex items-center justify-center font-bold",
      getColor(),
      sizeClasses[size]
    )}>
      {percentual}%
    </div>
  );
};

export default MatchIndicator;
