import { diffLines } from "diff";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Plus, Minus, Download, Loader2, Columns, AlignJustify, ChevronUp, ChevronDown, Pencil } from "lucide-react";
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
  changeIndex?: number;
}

export const DiffViewer = ({
  leftContent,
  rightContent,
  leftLabel,
  rightLabel,
}: DiffViewerProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("inline");
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0);

  const diffResult = useMemo(() => {
    return diffLines(leftContent, rightContent);
  }, [leftContent, rightContent]);

  // Process diff into lines with line numbers and change indices
  const { leftLines, rightLines, inlineLines, changeIndices } = useMemo(() => {
    const left: DiffLine[] = [];
    const right: DiffLine[] = [];
    const inline: DiffLine[] = [];
    const changes: number[] = [];
    let leftLineNum = 1;
    let rightLineNum = 1;
    let inlineLineNum = 1;
    let changeIdx = 0;

    diffResult.forEach((part) => {
      if (part.value.endsWith("\n")) {
        const lastIndex = part.value.lastIndexOf("\n");
        const beforeLast = part.value.substring(0, lastIndex);
        const splitLines = beforeLast.split("\n");
        const isChange = part.removed || part.added;
        
        splitLines.forEach((line, i) => {
          const currentInlineNum = inlineLineNum;
          if (part.removed) {
            if (i === 0) {
              changes.push(currentInlineNum);
              changeIdx++;
            }
            left.push({ lineNumber: leftLineNum++, content: line, type: "removed", changeIndex: changeIdx });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "removed", changeIndex: changeIdx });
          } else if (part.added) {
            if (i === 0 && (left.length === 0 || left[left.length - 1].type !== "removed")) {
              changes.push(currentInlineNum);
              changeIdx++;
            }
            right.push({ lineNumber: rightLineNum++, content: line, type: "added", changeIndex: changeIdx });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "added", changeIndex: changeIdx });
          } else {
            left.push({ lineNumber: leftLineNum++, content: line, type: "unchanged" });
            right.push({ lineNumber: rightLineNum++, content: line, type: "unchanged" });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "unchanged" });
          }
        });
      } else if (part.value) {
        const splitLines = part.value.split("\n");
        splitLines.forEach((line, i) => {
          const currentInlineNum = inlineLineNum;
          if (part.removed) {
            if (i === 0) {
              changes.push(currentInlineNum);
              changeIdx++;
            }
            left.push({ lineNumber: leftLineNum++, content: line, type: "removed", changeIndex: changeIdx });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "removed", changeIndex: changeIdx });
          } else if (part.added) {
            if (i === 0 && (left.length === 0 || left[left.length - 1].type !== "removed")) {
              changes.push(currentInlineNum);
              changeIdx++;
            }
            right.push({ lineNumber: rightLineNum++, content: line, type: "added", changeIndex: changeIdx });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "added", changeIndex: changeIdx });
          } else {
            left.push({ lineNumber: leftLineNum++, content: line, type: "unchanged" });
            right.push({ lineNumber: rightLineNum++, content: line, type: "unchanged" });
            inline.push({ lineNumber: inlineLineNum++, content: line, type: "unchanged" });
          }
        });
      }
    });

    return { leftLines: left, rightLines: right, inlineLines: inline, changeIndices: changes };
  }, [diffResult]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let modified = 0;
    
    // Group consecutive removed/added as modified
    let i = 0;
    while (i < inlineLines.length) {
      if (inlineLines[i].type === "removed") {
        let removedCount = 0;
        while (i < inlineLines.length && inlineLines[i].type === "removed") {
          removedCount++;
          i++;
        }
        let addedCount = 0;
        while (i < inlineLines.length && inlineLines[i].type === "added") {
          addedCount++;
          i++;
        }
        if (addedCount > 0) {
          modified += Math.min(removedCount, addedCount);
          removed += Math.max(0, removedCount - addedCount);
          added += Math.max(0, addedCount - removedCount);
        } else {
          removed += removedCount;
        }
      } else if (inlineLines[i].type === "added") {
        added++;
        i++;
      } else {
        i++;
      }
    }
    
    return { added, removed, modified, totalChanges: changeIndices.length };
  }, [inlineLines, changeIndices]);

  const scrollToChange = useCallback((index: number) => {
    if (index >= 0 && index < changeIndices.length) {
      const lineNum = changeIndices[index];
      const element = lineRefs.current.get(lineNum);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setCurrentChangeIndex(index);
    }
  }, [changeIndices]);

  const goToPrevChange = useCallback(() => {
    const newIndex = currentChangeIndex > 0 ? currentChangeIndex - 1 : changeIndices.length - 1;
    scrollToChange(newIndex);
  }, [currentChangeIndex, changeIndices.length, scrollToChange]);

  const goToNextChange = useCallback(() => {
    const newIndex = currentChangeIndex < changeIndices.length - 1 ? currentChangeIndex + 1 : 0;
    scrollToChange(newIndex);
  }, [currentChangeIndex, changeIndices.length, scrollToChange]);

  // Reset current change index when content changes
  useEffect(() => {
    setCurrentChangeIndex(0);
  }, [leftContent, rightContent]);

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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-diff-added-bg" title="ထည့်သွင်းခဲ့သော စာကြောင်းများ">
            <Plus className="w-3 h-3 text-diff-added-text" />
            <span className="text-xs font-semibold text-diff-added-text">
              {stats.added}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-diff-removed-bg" title="ဖယ်ရှားခဲ့သော စာကြောင်းများ">
            <Minus className="w-3 h-3 text-diff-removed-text" />
            <span className="text-xs font-semibold text-diff-removed-text">
              {stats.removed}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30" title="ပြင်ဆင်ခဲ့သော စာကြောင်းများ">
            <Pencil className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {stats.modified}
            </span>
          </div>
        </div>

        {/* Change Navigation */}
        {stats.totalChanges > 0 && (
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevChange}
              className="h-7 w-7 p-0"
              title="ယခင် ပြောင်းလဲမှု"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground px-2 min-w-[60px] text-center">
              {currentChangeIndex + 1} / {stats.totalChanges}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextChange}
              className="h-7 w-7 p-0"
              title="နောက် ပြောင်းလဲမှု"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}

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
              {inlineLines.map((line, index) => {
                const isFirstOfChange = changeIndices.includes(line.lineNumber);
                return (
                  <div
                    key={index}
                    ref={(el) => {
                      if (el && isFirstOfChange) {
                        lineRefs.current.set(line.lineNumber, el);
                      }
                    }}
                    className={cn(
                      "flex border-b border-border/30 hover:bg-muted/30 transition-colors",
                      line.type === "removed" && "bg-diff-removed-bg/50",
                      line.type === "added" && "bg-diff-added-bg/50",
                      isFirstOfChange && line.changeIndex === currentChangeIndex + 1 && "ring-2 ring-primary ring-inset"
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
                );
              })}
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
