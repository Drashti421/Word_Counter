import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";

interface TranslateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  onTranslate: (translatedText: string) => void;
}

export function TranslateDialog({ open, onOpenChange, text, onTranslate }: TranslateDialogProps) {
  const [targetLang, setTargetLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
    { code: "gu", name: "Gujarati" },
  ];

  const translateWithGoogle = async (input: string, target: string) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(input)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Google translate request failed");
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error("Unexpected Google translate response");
    }

    const parts = (data[0] as unknown[])
      .map((chunk) => (Array.isArray(chunk) ? String(chunk[0] ?? "") : ""))
      .filter(Boolean);

    const translatedText = parts.join("");
    if (!translatedText) {
      throw new Error("Google translate returned empty text");
    }

    return translatedText;
  };

  const translateWithLibre = async (input: string, target: string) => {
    const response = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: input,
        source: "auto",
        target,
        format: "text",
      }),
    });

    if (!response.ok) {
      throw new Error("LibreTranslate request failed");
    }

    const data: { translatedText?: string } = await response.json();
    if (!data.translatedText) {
      throw new Error("LibreTranslate returned empty text");
    }

    return data.translatedText;
  };

  const translateWithMyMemory = async (input: string, target: string) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=auto|${target}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("MyMemory request failed");
    }

    const data: {
      responseData?: { translatedText?: string };
    } = await response.json();

    const translated = data?.responseData?.translatedText;
    if (!translated) {
      throw new Error("MyMemory returned empty text");
    }

    return translated;
  };

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast.error("Enter text before translating");
      return;
    }

    const selectedLang = languages.find((l) => l.code === targetLang);
    setIsTranslating(true);

    try {
      let translatedText = "";
      try {
        translatedText = await translateWithGoogle(text, targetLang);
      } catch {
        try {
          translatedText = await translateWithLibre(text, targetLang);
        } catch {
          translatedText = await translateWithMyMemory(text, targetLang);
        }
      }

      onTranslate(translatedText);
      onOpenChange(false);
      toast.success(`Text translated to ${selectedLang?.name}`);
    } catch (_error) {
      toast.error("Translation failed. Service unavailable or blocked.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-black dark:text-black bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 border-none">
        <DialogHeader>
          <DialogTitle>Translate Text</DialogTitle>
          <DialogDescription>
            Select a target language to translate your text.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Language</label>
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="text-black dark:text-black bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 border-none">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">
              Your full input text will be translated to the selected language.
            </p>
          </div>
          <Button onClick={handleTranslate} className="w-full" disabled={isTranslating}>
            {isTranslating ? "Translating..." : "Translate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
