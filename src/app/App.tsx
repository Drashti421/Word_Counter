import { useState, useMemo, useEffect, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { FileText, Clock, Type, FileType, AlignLeft, Copy, Clipboard, Trash2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import { StatCard } from "./components/StatCard";
//import { SentimentChart } from "./components/SentimentChart";
import { ThemeToggle } from "./components/ThemeToggle";
import { VoiceInput } from "./components/VoiceInput";
import { Logo } from "./components/Logo";
import { Sidebar } from "./components/Sidebar";
import { GrammarIssues } from "./components/GrammarIssues";
import { AISuggestions } from "./components/AISuggestions";
import { TranslateDialog } from "./components/TranslateDialog";
import { HistoryDialog } from "./components/HistoryDialog";
import { AIWriterDialog } from "./components/AIWriterDialog";
import { Textarea } from "./components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { checkGrammar } from "../../utils/grammarCheck";
import { clearHistory, createHistoryItem, deleteHistoryItem, getHistory } from "./services/historyApi";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { useAuth } from "./context/AuthContext";
//import "index.css";

interface HistoryItem {
  id: string;
  text: string;
  timestamp: Date;
  wordCount: number;
}

interface GrammarIssue {
  type: string;
  message: string;
  incorrect?: string;
  suggestions?: string[];
}

function runBasicGrammarCheck(input: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  if (!input.trim()) return issues;

  if (/  +/.test(input)) {
    issues.push({
      type: "Spacing",
      message: "Multiple consecutive spaces detected",
      suggestions: ["Use a single space between words"],
    });
  }

  const sentences = input.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  sentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    if (trimmed.length > 0 && !/^[A-Z]/.test(trimmed)) {
      issues.push({
        type: "Capitalization",
        message: `Sentence should start with a capital letter: "${trimmed.substring(0, 30)}..."`,
        suggestions: [`${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`],
      });
    }
  });

  if (/\bi\b/.test(input)) {
    issues.push({
      type: "Capitalization",
      message: "The pronoun 'i' should be capitalized as 'I'",
      incorrect: "i",
      suggestions: ["I"],
    });
  }

  return issues;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [showGrammarCheck, setShowGrammarCheck] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showAIWriterDialog, setShowAIWriterDialog] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [grammarError, setGrammarError] = useState("");

  const goToLogin = () => {
    window.location.href = "/login";
  };

  const requireLoginForFeature = (onAllowed: () => void) => {
    if (user) {
      onAllowed();
      return;
    }
    toast.error("Login required. Please sign in to use this feature.");
    goToLogin();
  };

  // Load history from localStorage on mount
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      try {
        const items = await getHistory();
        if (!isMounted) return;
        setHistory(
          items.map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          })),
        );
      } catch {
        const savedHistory = localStorage.getItem("textAnalysisHistory");
        if (!savedHistory || !isMounted) return;
        const parsedHistory = JSON.parse(savedHistory);
        const historyWithDates = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(historyWithDates);
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save to history when text changes (debounced). Backend first, localStorage fallback.
  useEffect(() => {
    if (!text.trim() || text.trim().split(/\s+/).length < 5) return; // Only save if text has at least 5 words

    const timeoutId = setTimeout(() => {
      const nextWordCount = text.trim().split(/\s+/).length;
      void (async () => {
        try {
          const created = await createHistoryItem(text, nextWordCount);
          setHistory((prev) => {
            const updated = [
              {
                id: created.id,
                text: created.text,
                wordCount: created.wordCount,
                timestamp: new Date(created.timestamp),
              },
              ...prev,
            ].slice(0, 20);
            localStorage.setItem("textAnalysisHistory", JSON.stringify(updated));
            return updated;
          });
        } catch {
          const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            text,
            timestamp: new Date(),
            wordCount: nextWordCount,
          };
          setHistory((prev) => {
            const updated = [newHistoryItem, ...prev].slice(0, 20);
            localStorage.setItem("textAnalysisHistory", JSON.stringify(updated));
            return updated;
          });
        }
      })();
    }, 3000); // Save after 3 seconds of no typing

    return () => clearTimeout(timeoutId);
  }, [text]);

  // Calculate word count
  const wordCount = useMemo(() => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }, [text]);

  // Calculate reading time (average 200 words per minute)
  const readingTime = useMemo(() => {
    const minutes = Math.ceil(wordCount / 200);
    return minutes === 0 ? "< 1 min" : `${minutes} min`;
  }, [wordCount]);

  // Calculate character count
  const characterCount = useMemo(() => {
    return text.replace(/\s/g, "").length;
  }, [text]);

  // Calculate paragraph count
  const paragraphCount = useMemo(() => {
    if (!text.trim()) return 0;
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  }, [text]);

  // Calculate sentence count
  const sentenceCount = useMemo(() => {
    if (!text.trim()) return 0;
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }, [text]);

  const handleGrammarCheck = async () => {
    if (!text.trim()) {
      setShowGrammarCheck(false);
      toast.error("Enter some text before running grammar check");
      return;
    }

    setShowGrammarCheck(true);
    setShowAISuggestions(false);
    setIsCheckingGrammar(true);
    setGrammarError("");

    try {
      const matches = await checkGrammar(text);
      const mappedIssues: GrammarIssue[] = matches.map((match: any) => {
        const category = match?.rule?.category?.name || match?.rule?.id || "Grammar";
        const replacements: string[] = (match?.replacements || [])
          .map((r: any) => r?.value)
          .filter(Boolean)
          .slice(0, 5);

        return {
          type: category,
          message: match?.message || "Potential grammar issue detected.",
          incorrect: match?.context?.text,
          suggestions: replacements,
        };
      });

      setGrammarIssues(mappedIssues);
      toast.info(`Grammar check completed${mappedIssues.length ? `: ${mappedIssues.length} issue(s) found` : " with no issues found"}`);
    } catch (error) {
      const fallbackIssues = runBasicGrammarCheck(text);
      setGrammarIssues(fallbackIssues);
      setGrammarError("Online grammar service is unavailable. Showing basic local checks.");
      toast.error("Online grammar check failed. Switched to basic local checks.");
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  // Text transformation functions
  const handleTransform = (type: 'uppercase' | 'lowercase' | 'removeSpaces' | 'removeBreaks') => {
    let transformed = text;
    
    switch (type) {
      case 'uppercase':
        transformed = text.toUpperCase();
        toast.success("Text converted to UPPERCASE");
        break;
      case 'lowercase':
        transformed = text.toLowerCase();
        toast.success("Text converted to lowercase");
        break;
      case 'removeSpaces':
        transformed = text.replace(/  +/g, ' ');
        toast.success("Extra spaces removed");
        break;
      case 'removeBreaks':
        transformed = text.replace(/\n+/g, ' ').replace(/  +/g, ' ');
        toast.success("Line breaks removed");
        break;
    }
    
    setText(transformed);
  };

  // Download function
  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Text downloaded successfully");
  };

  // Download as PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    
    // Add title
    doc.setFontSize(16);
    doc.text("Text Analysis Report", margin, 20);
    
    // Add text content
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(text || "No text to export", maxWidth);
    doc.text(lines, margin, 35);
    
    // Save PDF
    doc.save('text-analysis.pdf');
    toast.success("PDF downloaded successfully");
  };

  // Handle voice input
  const handleVoiceTranscript = (transcript: string) => {
    setText(transcript);
  };

  // Copy text to clipboard
  const handleCopy = async () => {
    if (!text) {
      toast.error("No text to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Text copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  // Paste text from clipboard
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      toast.success("Text pasted from clipboard");
    } catch (err) {
      toast.error("Failed to paste text");
    }
  };

  // Clear text
  const handleClear = () => {
    setText("");
    setShowGrammarCheck(false);
    setShowAISuggestions(false);
    toast.success("Text cleared");
  };

  const handleAddSuggestion = (suggestion: string) => {
    setText((prev) => {
      const nextSuggestion = suggestion.trim();
      if (!nextSuggestion) return prev;
      if (!prev.trim()) return nextSuggestion;
      if (prev.includes(nextSuggestion)) return prev;
      return `${prev.trimEnd()}\n\n${nextSuggestion}`;
    });
    toast.success("Suggestion added to text");
  };

  // Load history item
  const handleLoadHistory = (historyText: string) => {
    setText(historyText);
  };

  // Clear all history
  const handleClearHistory = () => {
    void (async () => {
      try {
        await clearHistory();
      } catch {
        // no-op: fallback storage still cleared below
      } finally {
        setHistory([]);
        localStorage.removeItem("textAnalysisHistory");
      }
    })();
  };

  // Delete single history item
  const handleDeleteHistoryItem = (id: string) => {
    void (async () => {
      try {
        await deleteHistoryItem(id);
      } catch {
        // no-op: still remove from UI/local fallback
      } finally {
        setHistory((prev) => {
          const updated = prev.filter((item) => item.id !== id);
          localStorage.setItem("textAnalysisHistory", JSON.stringify(updated));
          return updated;
        });
      }
    })();
  };

  // Simple sentiment analysis based on keywords
  const sentimentData = useMemo(() => {
    const positiveWords = ["good", "great", "excellent", "amazing", "wonderful", "happy", "love", "best", "fantastic", "awesome"];
    const negativeWords = ["bad", "terrible", "awful", "hate", "worst", "poor", "horrible", "disappointing", "sad", "angry"];
    const neutralWords = ["okay", "fine", "alright", "normal", "average"];

    const words = text.toLowerCase().split(/\s+/);
    
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positive++;
      else if (negativeWords.some(nw => word.includes(nw))) negative++;
      else if (neutralWords.some(neu => word.includes(neu))) neutral++;
    });

    return [
      { sentiment: "Positive", count: positive },
      { sentiment: "Neutral", count: neutral },
      { sentiment: "Negative", count: negative },
    ];
  }, [text]);

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster />
      
      {/* Sidebar */}
      <Sidebar
        onGrammarCheck={() => requireLoginForFeature(handleGrammarCheck)}
        onTransform={(type) => requireLoginForFeature(() => handleTransform(type))}
        onAISuggestions={() =>
          requireLoginForFeature(() => {
            setShowAISuggestions(true);
            setShowGrammarCheck(false);
            toast.info("AI suggestions generated");
          })
        }
        onAIWriter={() => {
          requireLoginForFeature(() => setShowAIWriterDialog(true));
        }}
        onDownload={(type) => {
          requireLoginForFeature(() => {
            if (type === 'txt') {
              handleDownload();
            } else {
              handleDownloadPDF();
            }
          });
        }}
        onTranslate={() => requireLoginForFeature(() => setShowTranslateDialog(true))}
        onHistory={() => requireLoginForFeature(() => setShowHistoryDialog(true))}
      />
      
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo />
              <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 px-6 py-3 rounded-xl">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Analyze Your Text
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{user?.displayName || "User"}</span>
              </div>
              <VoiceInput onTranscript={handleVoiceTranscript} />
              <ThemeToggle />
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void (async () => {
                      try {
                        await logout();
                        toast.success("Logged out");
                      } catch {
                        toast.error("Failed to log out");
                      }
                    })();
                  }}
                >
                  Log out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info("Please log in to continue.");
                    goToLogin();
                  }}
                >
                  Log in
                </Button>
              )}
            </div>
          </div>

          {/* Translate Dialog */}
          <TranslateDialog
            open={showTranslateDialog}
            onOpenChange={setShowTranslateDialog}
            text={text}
            onTranslate={(translatedText) => setText(translatedText)}
          />

          {/* History Dialog */}
          <HistoryDialog
            open={showHistoryDialog}
            onOpenChange={setShowHistoryDialog}
            history={history}
            onLoadHistory={handleLoadHistory}
            onClearHistory={handleClearHistory}
            onDeleteHistoryItem={handleDeleteHistoryItem}
          />

          <AIWriterDialog
            open={showAIWriterDialog}
            onOpenChange={setShowAIWriterDialog}
            onApply={(generatedText) => {
              setText(generatedText);
              setShowAISuggestions(false);
              setShowGrammarCheck(false);
              toast.success("AI draft added to editor");
            }}
          />

          {/* Text Input Area */}
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Start typing or paste your text here..."
                className="min-h-[200px] resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="text-black dark:text-black   bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 hover:from-blue-100 hover:to-purple-100"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePaste}
                  className=" text-black dark:text-black bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:from-purple-100 hover:to-pink-100"
                >
                  <Clipboard className="mr-2 h-4 w-4" />
                  Paste
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className=" text-black dark:text-black bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-950/30 dark:to-red-950/30 hover:from-pink-100 hover:to-red-100"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grammar Check Results */}
          {showGrammarCheck && (
            <>
              {isCheckingGrammar ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Checking Grammar...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Running grammar analysis on your text.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <GrammarIssues issues={grammarIssues} />
              )}
              {grammarError && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {grammarError}
                </p>
              )}
            </>
          )}

          {/* AI Suggestions */}
          {showAISuggestions && (
            <AISuggestions text={text} onAddSuggestion={handleAddSuggestion} />
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Word Count"
              value={wordCount}
              icon={FileText}
            />
            <StatCard
              title="Reading Time"
              value={readingTime}
              icon={Clock}
            />
            <StatCard
              title="Characters"
              value={characterCount}
              icon={Type}
            />
            <StatCard
              title="Paragraphs"
              value={paragraphCount}
              icon={AlignLeft}
            />
            <StatCard
              title="Sentences"
              value={sentenceCount}
              icon={FileType}
            />
          </div>

          {/* Sentiment Chart */}
          
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}


