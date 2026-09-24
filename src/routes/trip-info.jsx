import { useLocation } from "react-router-dom";
import { TripInfoPage } from "~/features/itinerary";

export default function TripInfoRoute() {
  const location = useLocation();
  return <TripInfoPage initialData={location.state} />;
}

