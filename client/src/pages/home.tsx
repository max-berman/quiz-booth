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
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 hero-gradient">
        <div className="max-w-7xl mx-auto">
          {/* Gaming-inspired background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-naknick rounded-full animate-float"></div>
            <div
              className="absolute top-40 right-32 w-6 h-6 bg-gradient-secondary rounded-full animate-float"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-32 left-1/4 w-3 h-3 bg-gradient-success rounded-full animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          <div className="text-center relative z-10">
            <div className="mb-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
                <Gamepad2 className="h-5 w-5 text-primary" />
                <span className="text-foreground font-medium">
                  Powered by naknick.com
                </span>
              </div>

              <h1 className="text-naknick-h1 text-foreground mb-6">
                We craft{" "}
                <span className="text-gaming-gradient animate-glow-pulse">
                  Trivia Games
                </span>
                <br />
                tailored to your business
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
                <Button className="btn-naknick text-lg px-10 py-5 group">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                  Create Your Game
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/leaderboard">
                <Button className="btn-secondary-naknick text-lg px-10 py-5 group">
                  <Trophy className="mr-2 h-5 w-5 group-hover:animate-bounce" />
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
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-foreground text-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Trade Show Trivia</span>
            </div>
            <p className="text-muted-foreground">
              Powered by{" "}
              <a
                href="https://naknick.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-semibold"
              >
                naknick.com
              </a>{" "}
              — Your branded gaming solution for trade shows and events
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
