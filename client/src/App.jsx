import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardShell from "./components/DashboardShell";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSkeleton from "./components/LoadingSkeleton";

const About = lazy(() => import("./pages/About"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AppointmentManagement = lazy(() => import("./pages/AppointmentManagement"));
const Contact = lazy(() => import("./pages/Contact"));
const ClientManagement = lazy(() => import("./pages/ClientManagement"));
const Home = lazy(() => import("./pages/Home"));
const Lawyers = lazy(() => import("./pages/Lawyers"));
const Login = lazy(() => import("./pages/Login"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Register = lazy(() => import("./pages/Register"));
const Services = lazy(() => import("./pages/Services"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminDashboard = lazy(() => import("./pages/dashboards/AdminDashboard"));
const ClientDashboard = lazy(() => import("./pages/dashboards/ClientDashboard"));
const LawyerDashboard = lazy(() => import("./pages/dashboards/LawyerDashboard"));
const StaffDashboard = lazy(() => import("./pages/dashboards/StaffDashboard"));

export default function App() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={6} />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/lawyers" element={<Lawyers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute roles={["client", "lawyer", "staff", "admin"]} />}>
          <Route element={<DashboardShell />}>
            <Route element={<ProtectedRoute roles={["client"]} />}>
              <Route path="/client" element={<ClientDashboard />} />
            </Route>
            <Route element={<ProtectedRoute roles={["lawyer"]} />}>
              <Route path="/lawyer" element={<LawyerDashboard />} />
            </Route>
            <Route element={<ProtectedRoute roles={["staff"]} />}>
              <Route path="/staff" element={<StaffDashboard />} />
            </Route>
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route element={<ProtectedRoute roles={["staff", "admin"]} />}>
              <Route path="/appointments" element={<AppointmentManagement />} />
            </Route>
            <Route path="/notifications" element={<Notifications />} />
            <Route element={<ProtectedRoute roles={["admin", "staff"]} />}>
              <Route path="/clients" element={<ClientManagement />} />
            </Route>
            <Route element={<ProtectedRoute roles={["admin", "staff", "lawyer"]} />}>
              <Route path="/analytics" element={<Analytics />} />
            </Route>
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
