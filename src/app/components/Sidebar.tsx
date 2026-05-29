import { useState } from "react";
import { 
  FileDown, 
  Sparkles, 
  CheckCircle2, 
  Type as TypeIcon,
  ChevronDown,
  ChevronRight,
  Languages,
  History
} from "lucide-react";
import { Button } from "./ui/button";

interface SidebarProps {
  onGrammarCheck: () => void;
  onTransform: (type: 'uppercase' | 'lowercase' | 'removeSpaces' | 'removeBreaks') => void;
  onAISuggestions: () => void;
  onAIWriter: () => void;
  onDownload: (type: 'txt' | 'pdf') => void;
  onTranslate: () => void;
  onHistory: () => void;
}

export function Sidebar({ onGrammarCheck, onTransform, onAISuggestions, onAIWriter, onDownload, onTranslate, onHistory }: SidebarProps) {
  const [isTransformOpen, setIsTransformOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  return (
    <div className="w-64 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-r border-border p-4 space-y-2">
      <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 px-4 py-3 rounded-xl mb-4">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</h2>
      </div>

      {/* Grammar Check */}
      <Button
        variant="ghost"
        className="bg-white text-black dark:bg-slate-900 dark:text-white"
        onClick={onGrammarCheck}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Grammar Check
      </Button>

      {/* Text Transformation */}
      <div className="space-y-1">
        <Button
          variant="ghost"
          className="bg-white text-black dark:bg-slate-900 dark:text-white"
          onClick={() => setIsTransformOpen(!isTransformOpen)}
        >
          <TypeIcon className="mr-2 h-4 w-4" />
          Text Transform
          {isTransformOpen ? (
            <ChevronDown className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4" />
          )}
        </Button>
        
        {isTransformOpen && (
          <div className="ml-6 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white text-black dark:bg-slate-900 dark:text-white"
              onClick={() => onTransform('uppercase')}
            >
              UPPERCASE
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white text-black dark:bg-slate-900 dark:text-white"
              onClick={() => onTransform('lowercase')}
            >
              lowercase
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white text-black dark:bg-slate-900 dark:text-white"
              onClick={() => onTransform('removeSpaces')}
            >
              Remove Spaces
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white text-black dark:bg-slate-900 dark:text-white"
              onClick={() => onTransform('removeBreaks')}
            >
              Remove Line Breaks
            </Button>
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <Button
        variant="ghost"
        className="bg-white text-black dark:bg-slate-900 dark:text-white"
        onClick={onAISuggestions}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        AI Suggestions
      </Button>

      <Button
        variant="ghost"
        className="bg-white text-black dark:bg-slate-900 dark:text-white"
        onClick={onAIWriter}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        AI Writing
      </Button>

      {/* Translate */}
      <Button
        variant="ghost"
        className="bg-white text-black dark:bg-slate-900 dark:text-white"
        onClick={onTranslate}
      >
        <Languages className="mr-2 h-4 w-4" />
        Translate
      </Button>

      {/* Download */}
      <div className="space-y-1">
        <Button
          variant="ghost"
          className="bg-white text-black dark:bg-slate-900 dark:text-white"
          onClick={() => setIsDownloadOpen(!isDownloadOpen)}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Download
          {isDownloadOpen ? (
            <ChevronDown className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4" />
          )}
        </Button>
        
        {isDownloadOpen && (
          <div className="ml-6 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white text-black dark:bg-slate-900 dark:text-white"
              onClick={() => onDownload('txt')}
            >
              As TXT
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white text-black dark:bg-slate-900 dark:text-white"
              onClick={() => onDownload('pdf')}
            >
              As PDF
            </Button>
          </div>
        )}
      </div>

      {/* History */}
      <Button
        variant="ghost"
        className="bg-white text-black dark:bg-slate-900 dark:text-white"
        onClick={onHistory}
      >
        <History className="mr-2 h-4 w-4" />
        History
      </Button>
    </div>
  );
}
