import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  text: string;
  timestamp: Date;
  wordCount: number;
}

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryItem[];
  onLoadHistory: (text: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export function HistoryDialog({
  open,
  onOpenChange,
  history,
  onLoadHistory,
  onClearHistory,
  onDeleteHistoryItem,
}: HistoryDialogProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (

    
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-black dark:text-black bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-none">
        <DialogHeader>
          <DialogTitle>History</DialogTitle>
          <DialogDescription>
            View and restore your previously analyzed texts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No history yet. Start analyzing text to build your history!</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {history.length} {history.length === 1 ? "item" : "items"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClearHistory();
                    toast.success("History cleared");
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.timestamp)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {item.wordCount} words
                            </span>
                          </div>
                          <p className="text-sm line-clamp-3 mb-3">
                            {item.text}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                onLoadHistory(item.text);
                                onOpenChange(false);
                                toast.success("Text loaded from history");
                              }}
                              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30"
                            >
                              Load
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onDeleteHistoryItem(item.id);
                                toast.success("History item deleted");
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
    
  );
}
