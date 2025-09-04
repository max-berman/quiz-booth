import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Gamepad2,
  Trophy,
  Users,
  Target,
  Star,
  ArrowRight,
  Zap,
  Sparkles,
  Play,
} from "lucide-react";
import { ShareEmbedModal } from "@/components/share-embed-modal";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">

          <div className="text-center relative z-10">
            <div className="mb-8 animate-slide-up">

              <h1 className="text-h1 text-foreground mb-6">
                Create{" "}
                <span className="text-primary font-bold">
                  Trivia Games
                </span>
                <br />
                for your business
              </h1>

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
                Engage your customers through play. Generate AI-powered custom
                trivia questions for your trade show booth and capture leads
                while visitors have fun competing for prizes.
              </p>
            </div>

            <div
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Link href="/setup">
                <Button className="btn-primary px-8 py-3">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Your Game
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/leaderboard">
                <Button className="btn-secondary px-8 py-3">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>
            </div>

            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <ShareEmbedModal isBuilder={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">Trade Show Trivia</span>
            </div>
            <p className="text-muted-foreground text-sm">
              AI-powered trivia games for trade shows and events
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
