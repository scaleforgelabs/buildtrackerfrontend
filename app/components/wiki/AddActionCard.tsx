import { PlusCircle } from "lucide-react";
import { cn } from "@/libs/utils";

type AddActionCardProps = {
  title: string;
  onClick: () => void;
  className?: string;
  height?: string;
};

export function AddActionCard({ title, onClick, className, height = "h-[200px]" }: AddActionCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-row items-center justify-center gap-3 w-full border-2 border-dashed border-muted-foreground/30 bg-background/50 cursor-pointer transition-all hover:border-primary hover:bg-primary/5 group",
        height,
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 text-muted-foreground group-hover:text-primary transition-colors">
        <PlusCircle size={32} strokeWidth={1.5} />
      </div>
      <span className="text-base font-medium text-muted-foreground group-hover:text-primary transition-colors">
        {title}
      </span>
    </div>
  );
}
