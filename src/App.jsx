import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "~/providers/app-providers";
import HomeRoute from "~/routes/home";
import TripInfoRoute from "~/routes/trip-info";
import TripCreateRoute from "~/routes/trip-create";
import TripConfirmRoute from "~/routes/trip-confirm";
import TripSuccessRoute from "~/routes/trip-success";
import PlacesRoute from "~/routes/places";
import PlaceDetailRoute from "~/routes/place-detail";
import PaymentRoute from "~/routes/payment";
import ProfileRoute from "~/routes/profile";
import ItinerariesRoute from "~/routes/itineraries";
import FavoritesRoute from "~/routes/favorites";
import ReviewsRoute from "~/routes/reviews";

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/places" element={<PlacesRoute />} />
          <Route path="/places/:id" element={<PlaceDetailRoute />} />
          <Route path="/trip/info" element={<TripInfoRoute />} />
          <Route path="/trip/create" element={<TripCreateRoute />} />
          <Route path="/trip/confirm" element={<TripConfirmRoute />} />
          <Route path="/trip/success" element={<TripSuccessRoute />} />
          <Route path="/payment" element={<PaymentRoute />} />
          <Route path="/profile" element={<ProfileRoute />} />
          <Route path="/itineraries" element={<ItinerariesRoute />} />
          <Route path="/itineraries/:tripId" element={<ItinerariesRoute />} />
          <Route path="/favorites" element={<FavoritesRoute />} />
          <Route path="/favorites/:collectionId" element={<FavoritesRoute />} />
          <Route path="/reviews" element={<ReviewsRoute />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
