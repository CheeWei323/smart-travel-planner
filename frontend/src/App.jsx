import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import AuthProvider from "./components/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import { Empty, Loading } from "./components/UI";
import { portalHome } from "./utils/portalAccess";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TripsPage from "./pages/TripsPage";
import CreateTripPage from "./pages/CreateTripPage";
import ItineraryPage from "./pages/ItineraryPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import FeedbackPage from "./pages/FeedbackPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import SecurityTipsPage from "./pages/SecurityTipsPage";

function ProtectedRoute({ role }) {
  const { user, loading, sessionId } = useAuth();
  const location = useLocation();
  if (loading) return <Loading>Checking your account…</Loading>;
  if (!user)
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  if (role && user.role !== role) {
    const destination =
      user.role === "admin" && location.pathname === "/profile"
        ? "/admin/settings"
        : portalHome(user.role);
    return <Navigate to={destination} replace />;
  }
  return <Outlet key={sessionId} />;
}
function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading>Checking your account…</Loading>;
  return user ? <Navigate to={portalHome(user.role)} replace /> : <Outlet />;
}
function NotFound() {
  const { user } = useAuth();
  return (
    <Empty
      title="We couldn’t find that page"
      to={user ? portalHome(user.role) : "/"}
      action={user ? "Back to dashboard" : "Go to login"}
    >
      Check the address or return to your dashboard.
    </Empty>
  );
}
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      }
    >
      <Route element={<GuestRoute />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

      <Route element={<ProtectedRoute role="user" />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/create-trip" element={<CreateTripPage />} />
          <Route path="/edit-trip/:id" element={<CreateTripPage />} />
          <Route path="/view-trip/:id" element={<CreateTripPage />} />
          <Route path="/itinerary" element={<ItineraryPage />} />
          <Route path="/itinerary/:id" element={<ItineraryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/security-tips" element={<SecurityTipsPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPage section="Overview" />} />
          <Route path="users" element={<AdminPage section="Users" />} />
          <Route path="trips" element={<AdminPage section="Trips" />} />
          <Route
            path="announcements"
            element={<AdminPage section="Announcements" />}
          />
          <Route path="feedback" element={<AdminPage section="Feedback" />} />
          <Route path="security" element={<AdminPage section="Security" />} />
          <Route path="settings" element={<ProfilePage admin />} />
          <Route path="security-tips" element={<SecurityTipsPage admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);
export default function App() {
  return <RouterProvider router={router} />;
}
