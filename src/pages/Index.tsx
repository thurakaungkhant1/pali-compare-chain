import { useState, useCallback } from "react";
import { FileUploader } from "@/components/FileUploader";
import { DiffViewer } from "@/components/DiffViewer";
import { VersionTabs } from "@/components/VersionTabs";
import { FileText, ArrowRight, RotateCcw } from "lucide-react";
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

  const handleReset = () => {
    setVersions([
      { content: "", fileName: "" },
      { content: "", fileName: "" },
      { content: "", fileName: "" },
      { content: "", fileName: "" },
    ]);
    setActiveComparison([0, 1]);
  };

  const hasAnyFiles = versions.some((v) => v.content);
  const hasComparableFiles =
    versions.filter((v) => v.content).length >= 2;

  const getValidComparison = (): [number, number] => {
    if (
      versions[activeComparison[0]]?.content &&
      versions[activeComparison[1]]?.content
    ) {
      return activeComparison;
    }
    for (let i = 0; i < versions.length - 1; i++) {
      if (versions[i].content && versions[i + 1].content) {
        return [i, i + 1];
      }
    }
    return [0, 1];
  };

  const validComparison = getValidComparison();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                စာစစ်ဆေးချက် နှိုင်းယှဉ်စနစ်
              </h1>
              <p className="text-sm text-muted-foreground">
                ပါဠိ-မြန်မာ စာဖိုင်များ နှိုင်းယှဉ်ခြင်း
              </p>
            </div>
          </div>
          {hasAnyFiles && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              အသစ်စတင်
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Upload Section */}
        <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-semibold text-foreground">
              ဖိုင်များတင်ရန်
            </span>
            <span className="text-sm text-muted-foreground">
              (အနည်းဆုံး ၂ ဖိုင်လိုအပ်သည်)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <FileUploader
                key={index}
                label={`စာစစ် ${index + 1}`}
                index={index}
                onFileLoad={handleFileLoad}
                fileName={versions[index].fileName}
              />
            ))}
          </div>

          {/* Flow Indicator */}
          {hasAnyFiles && (
            <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground">
              {versions.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      v.content
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 3 && <ArrowRight className="w-4 h-4" />}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Comparison Section */}
        {hasComparableFiles && (
          <section className="flex-1 flex flex-col gap-4">
            <VersionTabs
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground max-w-md">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                ဖိုင်များတင်ပါ
              </h3>
              <p>
                စာစစ်ထားသော .txt ဖိုင်များကို အပေါ်ရှိ ခလုတ်များတွင်
                တင်ပြီးနောက် ပြောင်းလဲမှုများကို ကြည့်ရှုနိုင်ပါသည်။
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          ပါဠိ-မြန်မာ စာဖိုင် နှိုင်းယှဉ်ခြင်းစနစ်
        </div>
      </footer>
    </div>
  );
};

export default Index;
