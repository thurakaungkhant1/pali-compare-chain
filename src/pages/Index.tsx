import { useState, useCallback } from "react";
import { FileUploader } from "@/components/FileUploader";
import { DiffViewer } from "@/components/DiffViewer";
import { ComparisonSelector } from "@/components/ComparisonSelector";
import {
  FileText,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileVersion {
  content: string;
  fileName: string;
}

const Index = () => {
  const [versions, setVersions] = useState<FileVersion[]>([
    { content: "", fileName: "" },
    { content: "", fileName: "" },
    { content: "", fileName: "" },
    { content: "", fileName: "" },
  ]);
  const [activeComparison, setActiveComparison] = useState<[number, number]>([
    0, 1,
  ]);

  const handleFileLoad = useCallback(
    (content: string, index: number, fileName: string) => {
      setVersions((prev) => {
        const updated = [...prev];
        updated[index] = { content, fileName };
        return updated;
      });
    },
    []
  );

  const handleFileClear = useCallback((index: number) => {
    setVersions((prev) => {
      const updated = [...prev];
      updated[index] = { content: "", fileName: "" };
      return updated;
    });
  }, []);

  const handleReset = () => {
    setVersions([
      { content: "", fileName: "" },
      { content: "", fileName: "" },
      { content: "", fileName: "" },
      { content: "", fileName: "" },
    ]);
    setActiveComparison([0, 1]);
  };

  const filesLoaded = versions.filter((v) => v.content).length;
  const hasComparableFiles = filesLoaded >= 2;

  const getValidComparison = (): [number, number] => {
    if (
      versions[activeComparison[0]]?.content &&
      versions[activeComparison[1]]?.content
    ) {
      return activeComparison;
    }
    // Find first two files with content
    const withContent = versions
      .map((v, i) => ({ index: i, hasContent: !!v.content }))
      .filter((v) => v.hasContent);
    if (withContent.length >= 2) {
      return [withContent[0].index, withContent[1].index];
    }
    return [0, 1];
  };

  const validComparison = getValidComparison();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center shadow-glow animate-float">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                စာစစ်နှိုင်းယှဉ်စနစ်
                <Sparkles className="w-4 h-4 text-primary" />
              </h1>
              <p className="text-sm text-muted-foreground">
                ပါဠိ-မြန်မာ စာဖိုင်များ နှိုင်းယှဉ်ခြင်း
              </p>
            </div>
          </div>
          {filesLoaded > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              အသစ်စတင်
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Upload Section */}
        <section className="animate-fade-in-up">
          <div className="bg-card rounded-3xl border border-border p-6 shadow-soft-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-foreground">
                  ဖိုင်များတင်ရန်
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-medium">
                  {filesLoaded}/4 ဖိုင်
                </span>
              </div>
              {hasComparableFiles && (
                <div className="flex items-center gap-2 text-sm text-primary font-medium animate-scale-in">
                  <CheckCircle2 className="w-4 h-4" />
                  နှိုင်းယှဉ်ရန် အဆင်သင့်
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {versions.map((version, index) => (
                <div
                  key={index}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <FileUploader
                    label={`စာစစ် ${index + 1}`}
                    index={index}
                    onFileLoad={handleFileLoad}
                    onClear={handleFileClear}
                    fileName={version.fileName}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        {hasComparableFiles && (
          <section className="flex-1 flex flex-col gap-4 animate-fade-in-up">
            <ComparisonSelector
              versions={versions}
              activeComparison={validComparison}
              onComparisonChange={setActiveComparison}
            />
            <div className="flex-1 min-h-[500px]">
              <DiffViewer
                leftContent={versions[validComparison[0]].content}
                rightContent={versions[validComparison[1]].content}
                leftLabel={`စာစစ် ${validComparison[0] + 1}: ${versions[validComparison[0]].fileName}`}
                rightLabel={`စာစစ် ${validComparison[1] + 1}: ${versions[validComparison[1]].fileName}`}
              />
            </div>
          </section>
        )}

        {/* Empty State */}
        {!hasComparableFiles && (
          <div className="flex-1 flex items-center justify-center py-12 animate-fade-in">
            <div className="text-center max-w-md">
              <div className="relative inline-flex">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 animate-pulse-soft">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl gradient-warm flex items-center justify-center shadow-glow animate-float">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                ဖိုင်များကို ဆွဲတင်ပါ
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                စာစစ်ထားသော .txt ဖိုင်များကို အထက်ပါ ခလုတ်များတွင် တင်ပြီး
                ပြောင်းလဲမှုများကို နှိုင်းယှဉ်ကြည့်ရှုနိုင်ပါသည်။
              </p>
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-secondary">
                  အနည်းဆုံး ၂ ဖိုင်လိုအပ်ပါသည်
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Copyright by Nissaya Pali Text Compare
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Created by thurakaungkhant
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
