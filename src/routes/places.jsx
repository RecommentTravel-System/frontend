import { PlacesPage } from "~/features/places";

export default function PlacesRoute({ initialMode = "all" }) {
  return <PlacesPage initialMode={initialMode} />;
}

