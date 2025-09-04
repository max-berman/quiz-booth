import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CreatorHeader } from "@/components/creator-header";
import Home from "@/pages/home";
import Setup from "@/pages/setup";
import GamePage from "@/pages/game";
import Results from "@/pages/results";
import Leaderboard from "@/pages/leaderboard";
import Submissions from "@/pages/submissions";
import EditQuestions from "@/pages/edit-questions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/setup" component={Setup} />
      <Route path="/game/:id" component={GamePage} />
      <Route path="/results/:id" component={Results} />
      <Route path="/leaderboard/:id?" component={Leaderboard} />
      <Route path="/submissions/:id" component={Submissions} />
      <Route path="/edit-questions/:id" component={EditQuestions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <CreatorHeader />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
