import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "~/providers/app-providers";
import HomeRoute from "~/routes/home";
import TripInfoRoute from "~/routes/trip-info";
import TripCreateRoute from "~/routes/trip-create";
import TripConfirmRoute from "~/routes/trip-confirm";
import TripSuccessRoute from "~/routes/trip-success";

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/trip/info" element={<TripInfoRoute />} />
          <Route path="/trip/create" element={<TripCreateRoute />} />
          <Route path="/trip/confirm" element={<TripConfirmRoute />} />
          <Route path="/trip/success" element={<TripSuccessRoute />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
