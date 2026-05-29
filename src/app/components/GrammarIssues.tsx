import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface GrammarIssue {
  type: string;
  message: string;
  incorrect?: string;
  suggestions?: string[];
}

interface GrammarIssuesProps {
  issues: GrammarIssue[];
}

export function GrammarIssues({ issues }: GrammarIssuesProps) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            No Grammar Issues Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your text looks good. No common grammar issues detected.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          Grammar Issues Found ({issues.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {issues.map((issue, index) => (
            <li key={index} className="rounded-md border p-3 text-sm">
              <p>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  {issue.type}:
                </span>{" "}
                {issue.message}
              </p>
              {issue.incorrect && (
                <p className="mt-1 text-muted-foreground">
                  <span className="font-medium">Detected:</span> {issue.incorrect}
                </p>
              )}
              {issue.suggestions && issue.suggestions.length > 0 && (
                <p className="mt-1 text-green-700 dark:text-green-400">
                  <span className="font-medium">Suggestions:</span>{" "}
                  {issue.suggestions.join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default GrammarIssues;
