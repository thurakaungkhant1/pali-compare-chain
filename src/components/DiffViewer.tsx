import { diffWords } from "diff";
import { useMemo } from "react";

interface DiffViewerProps {
  leftContent: string;
  rightContent: string;
  leftLabel: string;
  rightLabel: string;
}

export const DiffViewer = ({
  leftContent,
  rightContent,
  leftLabel,
  rightLabel,
}: DiffViewerProps) => {
  const diffResult = useMemo(() => {
    return diffWords(leftContent, rightContent);
  }, [leftContent, rightContent]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffResult.forEach((part) => {
      if (part.added) added += part.value.length;
      if (part.removed) removed += part.value.length;
    });
    return { added, removed };
  }, [diffResult]);

  return (
    <div className="flex flex-col h-full">
      {/* Stats Bar */}
      <div className="flex items-center gap-4 p-3 bg-secondary rounded-t-xl border border-border">
        <span className="text-sm font-medium text-foreground">
          ပြောင်းလဲမှုများ:
        </span>
        <span className="text-sm px-2 py-0.5 rounded bg-diff-added-bg text-diff-added-text">
          +{stats.added} ထည့်သွင်း
        </span>
        <span className="text-sm px-2 py-0.5 rounded bg-diff-removed-bg text-diff-removed-text">
          -{stats.removed} ဖယ်ရှား
        </span>
      </div>

      {/* Side by Side View */}
      <div className="grid grid-cols-2 gap-0 flex-1 border border-t-0 border-border rounded-b-xl overflow-hidden">
        {/* Left Panel */}
        <div className="flex flex-col border-r border-border">
          <div className="px-4 py-2 bg-muted font-medium text-sm text-muted-foreground border-b border-border">
            {leftLabel}
          </div>
          <div className="p-4 overflow-auto flex-1 bg-card text-foreground leading-relaxed whitespace-pre-wrap">
            {diffResult.map((part, index) => {
              if (part.added) return null;
              if (part.removed) {
                return (
                  <span
                    key={index}
                    className="bg-diff-removed-bg text-diff-removed-text px-0.5 rounded"
                  >
                    {part.value}
                  </span>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col">
          <div className="px-4 py-2 bg-muted font-medium text-sm text-muted-foreground border-b border-border">
            {rightLabel}
          </div>
          <div className="p-4 overflow-auto flex-1 bg-card text-foreground leading-relaxed whitespace-pre-wrap">
            {diffResult.map((part, index) => {
              if (part.removed) return null;
              if (part.added) {
                return (
                  <span
                    key={index}
                    className="bg-diff-added-bg text-diff-added-text px-0.5 rounded"
                  >
                    {part.value}
                  </span>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
