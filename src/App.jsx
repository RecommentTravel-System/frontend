import { AppProviders } from "~/providers/app-providers";
import HomeRoute from "~/routes/home";

export default function App() {
  return (
    <AppProviders>
      <HomeRoute />
    </AppProviders>
  );
}
