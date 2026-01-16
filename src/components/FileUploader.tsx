import { useCallback } from "react";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  label: string;
  index: number;
  onFileLoad: (content: string, index: number, fileName: string) => void;
  fileName?: string;
}

export const FileUploader = ({
  label,
  index,
  onFileLoad,
  fileName,
}: FileUploaderProps) => {
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

  return (
    <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-secondary/50 transition-all duration-200 group">
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Upload className="w-5 h-5" />
      </div>
      <span className="font-medium text-foreground">{label}</span>
      {fileName ? (
        <span className="text-sm text-primary truncate max-w-full">
          {fileName}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">
          .txt ဖိုင်ရွေးပါ
        </span>
      )}
    </label>
  );
};
