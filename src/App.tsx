import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import WorldCup2026 from "./pages/WorldCup2026";
import WorldCupFixtures from "./pages/WorldCupFixtures";
import WorldCupPlayers from "./pages/WorldCupPlayers";
import WorldCupTopScorers from "./pages/WorldCupTopScorers";
import WorldCupBestDefense from "./pages/WorldCupBestDefense";
import Season2Preview from "./pages/Season2Preview";
import Season2Home from "./pages/season2/Season2Home";
import Season2Matches from "./pages/season2/Season2Matches";
import Season2Players from "./pages/season2/Season2Players";
import Season2TopScorers from "./pages/season2/Season2TopScorers";
import Season2BestDefense from "./pages/season2/Season2BestDefense";
import Apply from "./pages/Apply";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./lib/i18n";
import PredictLayout from "./pages/predict/PredictLayout";
import PredictLanding from "./pages/predict/PredictLanding";
import PredictLogin from "./pages/predict/PredictLogin";
import PredictRegister from "./pages/predict/PredictRegister";
import PredictLeaderboard from "./pages/predict/PredictLeaderboard";
import PredictPredictions from "./pages/predict/PredictPredictions";
import PredictMatches from "./pages/predict/PredictMatches";
import PredictProfile from "./pages/predict/PredictProfile";
import PredictAdmin from "./pages/predict/PredictAdmin";

const queryClient = new QueryClient();
const isSeason2SiteMode = import.meta.env.VITE_BPL_SITE !== "worldcup";

function AppFrame() {
  const location = useLocation();
  const isPredict = location.pathname === "/predict" || location.pathname.startsWith("/predict/");
  const isSeason2 = location.pathname === "/season-2" || location.pathname.startsWith("/season-2/");
  const isSeason2Preview = location.pathname === "/season-2-preview";
  const isSeason2RootPage = isSeason2SiteMode && ["/", "/matches", "/players", "/top-scorers", "/best-defense"].includes(location.pathname);

  return (
    <>
      {!isPredict && !isSeason2 && !isSeason2Preview && !isSeason2RootPage && <Navbar />}
      <Routes>
        <Route path="/" element={isSeason2SiteMode ? <Season2Home /> : <Home />} />
        {isSeason2SiteMode && (
          <>
            <Route path="/matches" element={<Season2Matches />} />
            <Route path="/players" element={<Season2Players />} />
            <Route path="/top-scorers" element={<Season2TopScorers />} />
            <Route path="/best-defense" element={<Season2BestDefense />} />
          </>
        )}
        <Route path="/season-2" element={<Season2Home />} />
        <Route path="/season-2/matches" element={<Season2Matches />} />
        <Route path="/season-2/players" element={<Season2Players />} />
        <Route path="/season-2/top-scorers" element={<Season2TopScorers />} />
        <Route path="/season-2/best-defense" element={<Season2BestDefense />} />
        <Route path="/season-2-preview" element={<Season2Preview />} />
        <Route path="/world-cup-2026" element={<WorldCup2026 />} />
        <Route path="/world-cup-2026/fixtures" element={<WorldCupFixtures />} />
        <Route path="/world-cup-2026/players" element={<WorldCupPlayers />} />
        <Route path="/world-cup-2026/top-scorers" element={<WorldCupTopScorers />} />
        <Route path="/world-cup-2026/best-defense" element={<WorldCupBestDefense />} />
        <Route path="/fixtures" element={<WorldCupFixtures />} />
        <Route path="/players" element={<WorldCupPlayers />} />
        <Route path="/top-scorers" element={<WorldCupTopScorers />} />
        <Route path="/best-defense" element={<WorldCupBestDefense />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/predict" element={<PredictLayout />}>
          <Route index element={<PredictLanding />} />
          <Route path="login" element={<PredictLogin />} />
          <Route path="register" element={<PredictRegister />} />
          <Route path="leaderboard" element={<PredictLeaderboard />} />
          <Route path="predictions" element={<PredictPredictions />} />
          <Route path="matches" element={<PredictMatches />} />
          <Route path="profile" element={<PredictProfile />} />
          <Route path="admin" element={<PredictAdmin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isPredict && !isSeason2 && !isSeason2Preview && !isSeason2RootPage && <Footer />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <BrowserRouter>
          <AppFrame />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
