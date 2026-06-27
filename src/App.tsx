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

function AppFrame() {
  const location = useLocation();
  const isPredict = location.pathname === "/predict" || location.pathname.startsWith("/predict/");

  return (
    <>
      {!isPredict && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/world-cup-2026" element={<WorldCup2026 />} />
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
      {!isPredict && <Footer />}
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
