import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "~/providers/app-providers";
import HomeRoute from "~/routes/home";
import TripInfoRoute from "~/routes/trip-info";
import TripCreateRoute from "~/routes/trip-create";
import TripPlanRoute from "~/routes/trip-plan";
import TripConfirmRoute from "~/routes/trip-confirm";
import TripSuccessRoute from "~/routes/trip-success";
import PlacesRoute from "~/routes/places";
import PlaceDetailRoute from "~/routes/place-detail";
import PaymentRoute from "~/routes/payment";
import ProfileRoute from "~/routes/profile";
import ItinerariesRoute from "~/routes/itineraries";
import FavoritesRoute from "~/routes/favorites";
import ReviewsRoute from "~/routes/reviews";
import AdminDashboardRoute from "~/routes/admin-dashboard";
import AdminReviewsRoute from "~/routes/admin-reviews";
import AdminCategoriesRoute from "~/routes/admin-categories";
import AdminUsersRoute from "~/routes/admin-users";
import AdminGuard from "~/routes/admin-guard";
import { useAuth } from './auth/useAuth.js';
import { registerAccount } from './auth/authService.js';
import Login from './login/Login.jsx';
import Register from './register/Register.jsx';
import Home from './homepage/Home.jsx';
import Payment from './payment/Payment.jsx';
import Profile from './profile/Profile.jsx';
import Itineraries from './itineraries/Itineraries.jsx';
import Favorites from './favorites/Favorites.jsx';
import Reviews from './reviews/Reviews.jsx';
import Settings from './settings/Settings.jsx';
import Support from './support/Support.jsx';
import SearchLoading from './search/SearchLoading.jsx';
const SearchPage = lazy(() => import('./search/SearchPage.jsx'));
import LocationDetails from './location/LocationDetails.jsx';
import CreateTour from './tours/CreateTour.jsx';
import { usePreferences } from './settings/preferences.js';

function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
}

function AccountPage({ register = false }) {
  const { user, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = '/profile';
  if (user) return <Navigate to={destination} replace />;
  const socialLogin = () => { throw new Error('Đăng nhập mạng xã hội chưa được kết nối. Vui lòng dùng email và mật khẩu.'); };
  const shared = { onClose: () => navigate('/'), onGoogle: socialLogin, onApple: socialLogin, onFacebook: socialLogin };
  if (register) return <Register {...shared} onLogin={() => navigate('/login', { state: location.state })} onSubmit={async values => {
    await registerAccount(values);
    navigate('/login', { replace: true, state: { from: destination, message: 'Đăng ký thành công. Hãy đăng nhập để tiếp tục.' } });
  }} />;
  return <Login {...shared} message={location.state?.message} onSignUp={() => navigate('/register', { state: location.state })} onSubmit={() => {
    loginDemo();
    navigate(destination, { replace: true });
  }} />;
}

function ProfilePage() {
  const { user } = useAuth();
  return <Profile key={user.email} user={user} />;
}

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
          <Route path="/trip/plan" element={<TripPlanRoute />} />
          <Route path="/trip/confirm" element={<TripConfirmRoute />} />
          <Route path="/trip/success" element={<TripSuccessRoute />} />
          <Route path="/payment" element={<PaymentRoute />} />
          <Route path="/profile" element={<ProfileRoute />} />
          <Route path="/itineraries" element={<ItinerariesRoute />} />
          <Route path="/itineraries/:tripId" element={<ItinerariesRoute />} />
          <Route path="/favorites" element={<FavoritesRoute />} />
          <Route path="/favorites/:collectionId" element={<FavoritesRoute />} />
          <Route path="/reviews" element={<ReviewsRoute />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/locations/:locationId" element={<LocationDetails />} />
          <Route path="/search" element={<Suspense fallback={<SearchLoading />}><SearchPage /></Suspense>} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<main className="route-not-found"><h1>Không tìm thấy trang</h1><Link to="/">Quay về trang chủ</Link></main>} />

          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboardRoute />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminGuard>
                <AdminDashboardRoute />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminGuard>
                <AdminCategoriesRoute />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <AdminGuard>
                <AdminReviewsRoute />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminGuard>
                <AdminUsersRoute />
              </AdminGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
