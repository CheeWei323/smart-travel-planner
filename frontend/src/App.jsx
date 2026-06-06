import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import TripsPage from "./pages/TripsPage";
import CreateTripPage from "./pages/CreateTripPage";
import ItineraryPage from "./pages/ItineraryPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* APP */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips" element={<TripsPage />} />

          {/* CREATE */}
          <Route path="/create-trip" element={<CreateTripPage />} />

          {/* EDIT (reuse CreateTripPage) */}
          <Route path="/edit-trip/:id" element={<CreateTripPage />} />
          <Route path="/view-trip/:id" element={<CreateTripPage />} />

          <Route path="/Itinerary" element={<ItineraryPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;