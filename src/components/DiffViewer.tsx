import { diffLines } from "diff";
import { useMemo, useRef, useState } from "react";
import { Plus, Minus, Download, Loader2, Columns, AlignJustify } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface DiffViewerProps {
  leftContent: string;
  rightContent: string;
  leftLabel: string;
  rightLabel: string;
}

type ViewMode = "side-by-side" | "inline";

interface DiffLine {
  lineNumber: number;
  content: string;
  type: "unchanged" | "added" | "removed";
}

export const DiffViewer = ({
  leftContent,
  rightContent,
  leftLabel,
  rightLabel,
}: DiffViewerProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("inline");

  const diffResult = useMemo(() => {
    return diffLines(leftContent, rightContent);
  }, [leftContent, rightContent]);

  // Process diff into lines with line numbers
  const { leftLines, rightLines, inlineLines } = useMemo(() => {
    const left: DiffLine[] = [];
    const right: DiffLine[] = [];
    const inline: DiffLine[] = [];
    let leftLineNum = 1;
    let rightLineNum = 1;
    let inlineLineNum = 1;

    diffResult.forEach((part) => {
      const lines = part.value.split("\n").filter((_, i, arr) => i < arr.length - 1 || part.value[part.value.length - 1] !== "\n" ? true : i < arr.length - 1);
      
      if (part.value.endsWith("\n")) {
        const lastIndex = part.value.lastIndexOf("\n");
        const beforeLast = part.value.substring(0, lastIndex);
        const splitLines = beforeLast.split("\n");
        splitLines.forEach((line) => {
          if (part.removed) {
            left.push({ lineNumber: leftLineNum++, content: line, type: "removed" });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "removed" });
          } else if (part.added) {
            right.push({ lineNumber: rightLineNum++, content: line, type: "added" });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "added" });
          } else {
            left.push({ lineNumber: leftLineNum++, content: line, type: "unchanged" });
            right.push({ lineNumber: rightLineNum++, content: line, type: "unchanged" });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "unchanged" });
          }
        });
      } else if (part.value) {
        const splitLines = part.value.split("\n");
        splitLines.forEach((line, i) => {
          if (part.removed) {
            left.push({ lineNumber: leftLineNum++, content: line, type: "removed" });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "removed" });
          } else if (part.added) {
            right.push({ lineNumber: rightLineNum++, content: line, type: "added" });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "added" });
          } else {
            left.push({ lineNumber: leftLineNum++, content: line, type: "unchanged" });
            right.push({ lineNumber: rightLineNum++, content: line, type: "unchanged" });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "unchanged" });
          }
        });
      }
    });

    return { leftLines: left, rightLines: right, inlineLines: inline };
  }, [diffResult]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    inlineLines.forEach((line) => {
      if (line.type === "added") added++;
      if (line.type === "removed") removed++;
    });
    return { added, removed };
  }, [inlineLines]);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`comparison-${leftLabel}-vs-${rightLabel}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-t-2xl border border-border shadow-soft">
        <span className="text-sm font-semibold text-foreground">
          ပြောင်းလဲမှုများ
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-diff-added-bg">
            <Plus className="w-3.5 h-3.5 text-diff-added-text" />
            <span className="text-sm font-semibold text-diff-added-text">
              {stats.added}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-diff-removed-bg">
            <Minus className="w-3.5 h-3.5 text-diff-removed-text" />
            <span className="text-sm font-semibold text-diff-removed-text">
              {stats.removed}
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg ml-auto">
          <button
            onClick={() => setViewMode("inline")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              viewMode === "inline"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <AlignJustify className="w-4 h-4" />
            Inline
          </button>
          <button
            onClick={() => setViewMode("side-by-side")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              viewMode === "side-by-side"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Columns className="w-4 h-4" />
            Side-by-side
          </button>
        </div>

        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          size="sm"
          className="gap-2 gradient-warm text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          PDF Export
        </Button>
      </div>

      {/* Content Area */}
      <div
        ref={contentRef}
        className={cn(
          "flex-1 border border-t-0 border-border rounded-b-2xl overflow-hidden shadow-soft-lg",
          viewMode === "side-by-side" ? "grid grid-cols-2 gap-0" : ""
        )}
      >
        {viewMode === "inline" ? (
          /* Inline View */
          <div className="flex flex-col bg-card h-full">
            <div className="px-4 py-3 bg-muted/50 font-medium text-sm text-muted-foreground border-b border-border flex items-center gap-3">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-diff-removed-bg border border-diff-removed-text/30" />
                {leftLabel}
              </span>
              <span className="text-muted-foreground/50">→</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-diff-added-bg border border-diff-added-text/30" />
                {rightLabel}
              </span>
            </div>
            <div className="overflow-auto flex-1">
              {inlineLines.map((line, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex border-b border-border/30 hover:bg-muted/30 transition-colors",
                    line.type === "removed" && "bg-diff-removed-bg/50",
                    line.type === "added" && "bg-diff-added-bg/50"
                  )}
                >
                  <span className="w-14 flex-shrink-0 px-3 py-1 text-right text-xs font-mono text-muted-foreground bg-muted/30 border-r border-border/50 select-none">
                    {line.lineNumber}
                  </span>
                  <span
                    className={cn(
                      "flex-1 px-4 py-1 font-mono text-sm whitespace-pre-wrap",
                      line.type === "removed" && "text-diff-removed-text line-through decoration-diff-removed-text/50",
                      line.type === "added" && "text-diff-added-text font-medium"
                    )}
                  >
                    {line.type === "removed" && <Minus className="inline w-3 h-3 mr-2 opacity-70" />}
                    {line.type === "added" && <Plus className="inline w-3 h-3 mr-2 opacity-70" />}
                    {line.content || " "}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Side-by-Side View */
          <>
            {/* Left Panel */}
            <div className="flex flex-col border-r border-border bg-card">
              <div className="px-4 py-3 bg-muted/50 font-medium text-sm text-muted-foreground border-b border-border flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-diff-removed-bg border border-diff-removed-text/30" />
                <span className="truncate">{leftLabel}</span>
              </div>
              <div className="overflow-auto flex-1">
                {leftLines.map((line, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex border-b border-border/30 hover:bg-muted/30 transition-colors",
                      line.type === "removed" && "bg-diff-removed-bg/50"
                    )}
                  >
                    <span className="w-12 flex-shrink-0 px-2 py-1 text-right text-xs font-mono text-muted-foreground bg-muted/30 border-r border-border/50 select-none">
                      {line.lineNumber}
                    </span>
                    <span
                      className={cn(
                        "flex-1 px-3 py-1 font-mono text-sm whitespace-pre-wrap",
                        line.type === "removed" && "text-diff-removed-text line-through decoration-diff-removed-text/50"
                      )}
                    >
                      {line.content || " "}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex flex-col bg-card">
              <div className="px-4 py-3 bg-muted/50 font-medium text-sm text-muted-foreground border-b border-border flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-diff-added-bg border border-diff-added-text/30" />
                <span className="truncate">{rightLabel}</span>
              </div>
              <div className="overflow-auto flex-1">
                {rightLines.map((line, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex border-b border-border/30 hover:bg-muted/30 transition-colors",
                      line.type === "added" && "bg-diff-added-bg/50"
                    )}
                  >
                    <span className="w-12 flex-shrink-0 px-2 py-1 text-right text-xs font-mono text-muted-foreground bg-muted/30 border-r border-border/50 select-none">
                      {line.lineNumber}
                    </span>
                    <span
                      className={cn(
                        "flex-1 px-3 py-1 font-mono text-sm whitespace-pre-wrap",
                        line.type === "added" && "text-diff-added-text font-medium"
                      )}
                    >
                      {line.content || " "}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
