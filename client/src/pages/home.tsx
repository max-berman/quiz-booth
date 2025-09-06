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
  LogIn,
} from "lucide-react";
import { ShareEmbedModal } from "@/components/share-embed-modal";
import { ProfessionalFooter } from "@/components/professional-footer";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth();
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
                <Button variant="default" className="px-8 py-3 !bg-black !text-white hover:!bg-gray-800">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Your Game
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/leaderboard">
                <Button variant="secondary" className="px-8 py-3">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>
              
              {/* Reserve space for auth button to prevent layout shift */}
              <div className="h-[44px] min-w-[112px]">
                {!loading && !isAuthenticated && (
                  <Link href="/auth/sign-in">
                    <Button variant="outline" className="px-8 py-3">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
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

      <div className="mt-16">
        <ProfessionalFooter />
      </div>
    </div>
  );
}
