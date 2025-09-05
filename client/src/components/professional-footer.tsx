import { ExternalLink } from "lucide-react";

export function ProfessionalFooter() {
  return (
    <footer className="border-t bg-muted/50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            AI-powered trivia games for trade shows and events - Built by{" "}
            <a
              href="https://naknick.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
            >
              NakNick.com
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
