import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Trophy, Users, Target, Star, ArrowRight, Zap, Sparkles, Play } from "lucide-react";
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
            <div className="absolute top-40 right-32 w-6 h-6 bg-gradient-secondary rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-gradient-success rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="mb-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
                <Gamepad2 className="h-5 w-5 text-primary" />
                <span className="text-foreground font-medium">Powered by naknick.com</span>
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
                Engage your customers through play. Generate AI-powered custom trivia questions for your trade show booth and capture leads while visitors have fun competing for prizes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
            
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <ShareEmbedModal isBuilder={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Why Branded Games Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-naknick-h2 text-foreground mb-6">
              Why Branded Games are a{" "}
              <span className="text-gaming-gradient">Powerful Marketing Tool</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The global gaming industry is valued at $188 billion with 3.4 billion players worldwide. 
              Tap into this massive market with custom trivia experiences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="stat-card group">
              <div className="w-16 h-16 bg-gradient-naknick rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow-pulse">
                <Gamepad2 className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">$188 Billion</h3>
              <h4 className="text-lg font-semibold text-foreground mb-3">Global Gaming Market</h4>
              <p className="text-muted-foreground">
                The gaming industry encompasses a massive entertainment market that continues to grow year over year.
              </p>
            </div>
            
            <div className="stat-card group">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow-pulse">
                <Users className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-2">3.4 Billion</h3>
              <h4 className="text-lg font-semibold text-foreground mb-3">Global Players</h4>
              <p className="text-muted-foreground">
                One-third of the world's population actively engages with video games across all platforms.
              </p>
            </div>
            
            <div className="stat-card group">
              <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow-pulse">
                <Target className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-accent mb-2">80%</h3>
              <h4 className="text-lg font-semibold text-foreground mb-3">Online Users are Gamers</h4>
              <p className="text-muted-foreground">
                8 in 10 of the total online population actively engage with video games and interactive content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-naknick-h2 text-foreground mb-6">
              Why Use Games For{" "}
              <span className="text-gaming-gradient">Product Marketing</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your trade show booth into an engaging destination that visitors remember long after the event ends.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="game-card group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-naknick rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow-pulse">
                  <Target className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Brand Awareness</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Incorporate your brand messaging into the game experience in a subtle, non-intrusive way. 
                  More users will be exposed to your company and what you offer.
                </p>
              </CardContent>
            </Card>
            
            <Card className="game-card group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow-pulse">
                  <Users className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Data Collection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Collect voluntary user data effectively through engaging gameplay. 
                  Users provide information in exchange for prizes and entertainment.
                </p>
              </CardContent>
            </Card>
            
            <Card className="game-card group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow-pulse">
                  <Play className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Engagement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Games are highly engaging and keep users interested for longer periods. 
                  Your brand messaging reaches focused, attentive audiences.
                </p>
              </CardContent>
            </Card>
            
            <Card className="game-card group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-gaming rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow-pulse">
                  <Star className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Virality & Reach</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fun, challenging games get shared by players, expanding your audience 
                  where each player becomes an influencer for your brand.
                </p>
              </CardContent>
            </Card>
            
            <Card className="game-card group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-naknick rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow-pulse">
                  <Trophy className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Repeat Visits</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Compelling games encourage players to return, advance to new levels, 
                  collect rewards, and compete with others for long-term engagement.
                </p>
              </CardContent>
            </Card>
            
            <Card className="game-card group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow-pulse">
                  <Zap className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Quick Setup</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generate custom trivia questions in minutes using AI. 
                  No technical skills required - just input your company details and go live.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-naknick relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/5 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-naknick-h2 text-white mb-6">
            Ready to Engage Your Audience?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of companies using interactive trivia games to boost their trade show success. 
            Create memorable experiences that turn visitors into customers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/setup">
              <Button className="bg-white text-primary hover:bg-white/90 px-10 py-5 text-lg font-bold rounded-full shadow-2xl transform transition-all hover:scale-105 group">
                Build Your Game
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <a 
              href="https://naknick.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary px-10 py-5 text-lg font-bold rounded-full transition-all">
                Learn More About naknick.com
              </Button>
            </a>
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
              </a>
              {" "}— Your branded gaming solution for trade shows and events
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}