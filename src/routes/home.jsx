import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader, AppFooter } from "~/shared/components";
import { HeroPlanner, WhyUseWayvee, TravelYourWay } from "~/features/trip";
import { HotDestinations } from "~/features/destination";
import { PlacesCategoryBar, TravelBlogPlaces } from "~/features/places";
import { RecommendationGrid } from "~/features/recommendation";
import { LoginCard, RegisterCard } from "~/features/auth";

export default function HomeRoute() {
  const [authModal, setAuthModal] = useState(null); // null | "login" | "register"
  const navigate = useNavigate();

  const handlePlannerSubmit = (plannerData) => {
    navigate("/trip/info", { state: plannerData });
  };

  return (
    <div className="bg-background min-h-screen text-foreground transition-colors duration-200">
      <AppHeader
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
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

      {/* Auth Modals */}
      {authModal === "login" && (
        <LoginCard
          onClose={() => setAuthModal(null)}
          onSubmit={(vals) => {
            console.log("Login submitted", vals);
            setAuthModal(null);
          }}
          onSignUp={() => setAuthModal("register")}
        />
      )}

      {authModal === "register" && (
        <RegisterCard
          onClose={() => setAuthModal(null)}
          onSubmit={(vals) => {
            console.log("Register submitted", vals);
            setAuthModal(null);
          }}
          onLogin={() => setAuthModal("login")}
        />
      )}
    </div>
  );
}
