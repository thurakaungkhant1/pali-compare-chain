import { useCallback, useState } from "react";
import { Upload, Check, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  label: string;
  index: number;
  onFileLoad: (content: string, index: number, fileName: string) => void;
  onClear?: (index: number) => void;
  fileName?: string;
}

export const FileUploader = ({
  label,
  index,
  onFileLoad,
  onClear,
  fileName,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClear?.(index);
    },
    [index, onClear]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          onFileLoad(content, index, file.name);
        };
        reader.readAsText(file);
      }
    },
    [index, onFileLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          onFileLoad(content, index, file.name);
        };
        reader.readAsText(file);
      }
    },
    [index, onFileLoad]
  );

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const hasFile = !!fileName;

  return (
    <label
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden",
        "border-2 border-dashed",
        hasFile
          ? "border-primary/40 bg-primary/5"
          : isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50 hover:shadow-soft"
      )}
    >
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Background decoration */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br from-primary/5 to-accent/5",
          (isDragging || hasFile) && "opacity-100"
        )}
      />

      {/* Number badge */}
      <div
        className={cn(
          "absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
          hasFile
            ? "gradient-warm text-primary-foreground shadow-glow"
            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
        )}
      >
        {index + 1}
      </div>

      {/* Icon */}
      <div
        className={cn(
          "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
          hasFile
            ? "gradient-warm text-primary-foreground shadow-glow"
            : "bg-secondary text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-110"
        )}
      >
        {hasFile ? (
          <Check className="w-6 h-6 animate-scale-in" />
        ) : (
          <Upload className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "relative font-semibold text-lg transition-colors",
          hasFile ? "text-primary" : "text-foreground"
        )}
      >
        {label}
      </span>

      {/* File name or hint */}
      {hasFile ? (
        <div className="relative flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full group/file">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-primary truncate max-w-[120px]">
            {fileName}
          </span>
          <button
            onClick={handleClear}
            className="w-5 h-5 rounded-full bg-destructive/20 hover:bg-destructive/40 flex items-center justify-center transition-colors"
            title="ဖိုင်ဖယ်ရန်"
          >
            <X className="w-3 h-3 text-destructive" />
          </button>
        </div>
      ) : (
        <span className="relative text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          .txt ဖိုင်ထည့်ရန် နှိပ်ပါ
        </span>
      )}
    </label>
  );
};
