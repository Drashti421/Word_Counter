import { useMemo, useState } from "react";
import { WandSparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { generateAIWriting } from "../services/aiWriter";

interface AIWriterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (generatedText: string) => void;
}

const QUICK_PROMPTS = [
  "Generate leave application for 3 days due to fever",
  "Generate formal email for project update",
  "Generate resignation letter",
  "Generate apology letter for late submission",
];

export function AIWriterDialog({ open, onOpenChange, onApply }: AIWriterDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");

  const canGenerate = useMemo(() => prompt.trim().length > 0, [prompt]);

  const handleGenerate = () => {
    const output = generateAIWriting(prompt);
    setGeneratedText(output);
  };

  const handleApply = () => {
    if (!generatedText.trim()) return;
    onApply(generatedText);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-white via-sky-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-white/60 dark:border-white/10 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WandSparkles className="h-5 w-5 text-blue-600" />
            AI Writing
          </DialogTitle>
          <DialogDescription>
            Enter any prompt like "generate leave application" and get a ready draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Type prompt (e.g. generate leave application for 2 days)"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((item) => (
              <Button key={item} type="button" variant="outline" size="sm" onClick={() => setPrompt(item)}>
                {item}
              </Button>
            ))}
          </div>

          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              Tip: Include specifics like days, reason, recipient, and tone for better output.
            </p>
          </div>

          <Textarea
            value={generatedText}
            onChange={(event) => setGeneratedText(event.target.value)}
            placeholder="Generated output will appear here..."
            className="min-h-[240px]"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleGenerate} disabled={!canGenerate}>
            Generate
          </Button>
          <Button type="button" onClick={handleApply} disabled={!generatedText.trim()}>
            Use in editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
