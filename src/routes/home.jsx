import { useNavigate } from "react-router-dom";
import { AppHeader, AppFooter } from "~/shared/components";
import { HeroPlanner, WhyUseWayvee, TravelYourWay } from "~/features/trip";
import { HotDestinations } from "~/features/destination";
import { PlacesCategoryBar, TravelBlogPlaces } from "~/features/places";
import { RecommendationGrid } from "~/features/recommendation";

export default function HomeRoute() {
  const navigate = useNavigate();

  const handlePlannerSubmit = (plannerData) => {
    navigate("/trip/info", { state: plannerData });
  };

  return (
    <div className="bg-background min-h-screen text-foreground transition-colors duration-200">
      <AppHeader
        onLogin={() => navigate("/login", { state: { from: "/" } })}
        onRegister={() => navigate("/register", { state: { from: "/" } })}
      />

      <main className="space-y-6">
        <HeroPlanner onPlannerSubmit={handlePlannerSubmit} />
        <WhyUseWayvee />
        <TravelYourWay />

        <div className="wayvee-container">
          <PlacesCategoryBar />
        </div>

        <HotDestinations />
        <TravelBlogPlaces />
        <RecommendationGrid />
      </main>

      <AppFooter />
    </div>
  );
}
