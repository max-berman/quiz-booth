import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Trophy, Rocket, Gamepad2 } from "lucide-react";
import { ShareEmbedModal } from "@/components/share-embed-modal";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <Gamepad2 className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark">Trade Show Trivia</h1>
                <p className="text-xs text-gray-500">Powered by Naknick</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-sm text-gray-600">AI-Generated Questions</span>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-dark mb-6">
              Create Engaging
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                {" "}Trivia Games
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Generate custom trivia questions for your trade show booth using AI. 
              Engage visitors, create competition, and capture leads effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/setup">
                <Button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <Rocket className="mr-2 h-4 w-4" />
                  Start Creating Trivia
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button className="px-8 py-4 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 flex justify-center">
              <ShareEmbedModal isBuilder={true} />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <Gamepad2 className="text-white text-xl" />
              </div>
              <div>
                <h4 className="text-xl font-bold">Naknick</h4>
                <p className="text-sm text-gray-400">Advergame Studio</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Powered by Naknick - Creating engaging interactive experiences for trade shows and events.
            </p>
            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-500">
                © 2024 Naknick. All rights reserved. | 
                <a href="https://naknick.com" className="text-primary hover:text-primary/80 transition-colors duration-200 ml-1">
                  Visit naknick.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
