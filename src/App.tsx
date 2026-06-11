import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import Feeding from "./pages/Feeding";
import Health from "./pages/Health";
import Inventory from "./pages/Inventory";
import Communication from "./pages/Communication";
import Schedule from "./pages/Schedule";
import Settlement from "./pages/Settlement";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="feeding" element={<Feeding />} />
          <Route path="health" element={<Health />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="communication" element={<Communication />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="settlement" element={<Settlement />} />
        </Route>
      </Routes>
    </Router>
  );
}
