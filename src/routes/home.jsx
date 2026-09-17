import { useState } from "react";
import { AppHeader, AppFooter } from "~/shared/components";
import { HeroPlanner, WhyUseWayvee, TravelYourWay } from "~/features/trip";
import { HotDestinations } from "~/features/destination";
import { PlacesCategoryBar, TravelBlogPlaces } from "~/features/places";
import { RecommendationGrid } from "~/features/recommendation";
import { LoginCard, RegisterCard } from "~/features/auth";

export default function HomeRoute() {
  const [authModal, setAuthModal] = useState(null); // null | "login" | "register"

  const handlePlannerSubmit = () => {
    alert("Đã nhận thông tin tạo chuyến đi! Hệ thống Wayvee đang xử lý gợi ý cho bạn.");
  };

  return (
    <div className="bg-background min-h-screen text-foreground transition-colors duration-200">
      <AppHeader onLogin={() => setAuthModal("login")} />

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
