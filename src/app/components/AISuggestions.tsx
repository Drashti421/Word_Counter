import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface AISuggestionsProps {
  text: string;
  onAddSuggestion: (suggestion: string) => void;
}

interface SuggestionItem {
  title: string;
  reason: string;
  addText: string;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "that", "with", "this", "from", "your", "have", "has",
  "are", "was", "were", "will", "would", "could", "should", "into", "about",
  "there", "their", "them", "then", "than", "what", "when", "where", "which",
  "while", "because", "also", "very", "just", "some", "more", "less", "been",
  "you", "they", "our", "out", "all", "but", "not", "can", "may", "its",
]);

function splitSentences(input: string): string[] {
  return input
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getTopKeywords(input: string): string[] {
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  const freq = new Map<string, number>();
  words.forEach((word) => {
    freq.set(word, (freq.get(word) || 0) + 1);
  });

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
}

function detectIntent(input: string): "email" | "academic" | "story" | "marketing" | "general" {
  const lower = input.toLowerCase();
  if (/\b(regards|dear|sincerely|meeting|schedule|thanks)\b/.test(lower)) return "email";
  if (/\b(research|study|evidence|analysis|method|hypothesis|conclusion)\b/.test(lower)) return "academic";
  if (/\b(character|scene|plot|story|chapter|journey|dialogue)\b/.test(lower)) return "story";
  if (/\b(customer|product|brand|market|feature|benefit|audience|sales)\b/.test(lower)) return "marketing";
  return "general";
}

function uniqueByAddText(items: SuggestionItem[]): SuggestionItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.addText.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildSuggestions(input: string): SuggestionItem[] {
  if (!input.trim()) {
    return [
      {
        title: "Start With A Clear Goal",
        reason: "AI suggestions become better once there is a draft.",
        addText: "",
      },
    ];
  }

  const sentences = splitSentences(input);
  const words = input.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const avgWordsPerSentence = sentences.length ? wordCount / sentences.length : wordCount;
  const firstSentence = sentences[0] || "";
  const keywords = getTopKeywords(input);
  const topic = keywords.length ? keywords.join(", ") : "this topic";
  const intent = detectIntent(input);

  const suggestions: SuggestionItem[] = [];

  if (wordCount < 60) {
    suggestions.push({
      title: "Add Useful Detail",
      reason: "The draft is short. One concrete detail will improve quality.",
      addText: `For example, one practical case of ${topic} shows why this matters in real situations.`,
    });
  }

  if (avgWordsPerSentence > 24) {
    suggestions.push({
      title: "Improve Readability",
      reason: "Some sentences are long and may feel heavy.",
      addText: "To make this easier to read, I will break long ideas into shorter, focused sentences.",
    });
  }

  if (!/\b(however|therefore|moreover|additionally|for example|in contrast)\b/i.test(input) && sentences.length >= 2) {
    suggestions.push({
      title: "Improve Flow",
      reason: "Transition words help connect ideas naturally.",
      addText: "However, the main point becomes stronger when we connect each idea with a clear transition.",
    });
  }

  if (!/[?]/.test(input)) {
    suggestions.push({
      title: "Increase Engagement",
      reason: "A relevant question can make the text more interactive.",
      addText: `Why is ${topic} important right now, and what should be done next?`,
    });
  }

  if (!/\b(in summary|to conclude|overall|in conclusion)\b/i.test(input)) {
    suggestions.push({
      title: "Add A Strong Closing",
      reason: "A concise ending leaves a clear takeaway.",
      addText: `In summary, ${topic} should remain a priority because it directly affects real outcomes.`,
    });
  }

  if (intent === "email") {
    suggestions.push({
      title: "Professional Email Tone",
      reason: "Your draft looks like email communication.",
      addText: "Please let me know if you would like me to share additional details or next steps.",
    });
  } else if (intent === "academic") {
    suggestions.push({
      title: "Academic Precision",
      reason: "Your draft appears analytical/research oriented.",
      addText: "These points are supported by evidence and should be evaluated with clear criteria.",
    });
  } else if (intent === "story") {
    suggestions.push({
      title: "Story Depth",
      reason: "Narrative writing benefits from sensory detail.",
      addText: "The moment felt vivid, and every detail made the scene more immediate and believable.",
    });
  } else if (intent === "marketing") {
    suggestions.push({
      title: "Value Proposition",
      reason: "Marketing text should highlight user benefit directly.",
      addText: "This solution saves time, improves consistency, and delivers measurable value for users.",
    });
  }

  const refined = uniqueByAddText(suggestions).slice(0, 5);

  if (refined.length === 0) {
    refined.push({
      title: "Looks Strong",
      reason: "Your writing already has solid structure and clarity.",
      addText: "Overall, the message is clear, focused, and easy to follow.",
    });
  }

  if (firstSentence && !/^[A-Z]/.test(firstSentence)) {
    refined.unshift({
      title: "Polish Opening",
      reason: "The first sentence can start more strongly.",
      addText: `${firstSentence.charAt(0).toUpperCase()}${firstSentence.slice(1)}`,
    });
  }

  return uniqueByAddText(refined).slice(0, 5);
}

function cleanSentence(sentence: string): string {
  const compact = sentence.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  const first = compact.charAt(0).toUpperCase();
  const body = compact.slice(1);
  const normalized = `${first}${body}`;
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function improveDraft(input: string): string {
  const normalized = input
    .replace(/\s+/g, " ")
    .replace(/\bi\b/g, "I")
    .trim();

  if (!normalized) return "";

  const sentences = splitSentences(normalized).map(cleanSentence).filter(Boolean);
  if (sentences.length === 0) return cleanSentence(normalized);

  const rebuilt = sentences.map((sentence, index) => {
    if (index === 0) return sentence;
    if (/^(however|therefore|moreover|additionally|in summary)\b/i.test(sentence)) return sentence;
    const prefixes = ["Additionally,", "However,", "Therefore,", "In practice,"];
    const prefix = prefixes[(index - 1) % prefixes.length];
    return `${prefix} ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
  });

  return rebuilt.join(" ");
}

export function AISuggestions({ text, onAddSuggestion }: AISuggestionsProps) {
  const suggestions = buildSuggestions(text);
  const enhancedDraft = improveDraft(text);
  const topThree = suggestions.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          AI Writing Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Improvement Plan</p>
            <ul className="mt-2 space-y-2">
              {topThree.map((item, index) => (
                <li key={index} className="text-sm">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground">{item.reason}</p>
                </li>
              ))}
            </ul>
          </div>

          {enhancedDraft && (
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="text-sm font-semibold">Enhanced Draft</p>
              <p className="mt-2 text-sm">{enhancedDraft}</p>
            </div>
          )}

          {!text.trim() && (
            <p className="text-sm text-muted-foreground">
              Start typing in the main textarea, then click AI Suggestions for a refined draft.
            </p>
          )}

          {text.trim() && enhancedDraft && (
            <Button
              type="button"
              size="sm"
              onClick={() => onAddSuggestion(enhancedDraft)}
            >
              Add Enhanced Draft
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
