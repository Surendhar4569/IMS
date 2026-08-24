
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";

import Employees from "./pages/AddEmployee";
import Blocks from "./pages/Blocks";
import Floors from "./pages/Floors";
import Rooms from "./pages/Rooms";
import Roles from "./pages/Roles";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Terminals from "./pages/Terminals";
import IncidentDashboard from "./pages/IncidentDashboard";
import Incidents from "./pages/IncidentManagement";
import RoomAllocation from "./pages/incideintRoomAllocation";
import InvestigationManager from "./pages/incidentInvestigation";
import PostIncidentReviewForm from "./pages/RCA";
import TerminalHierarchy from "./pages/RoomsAvaiblity";
import { Toaster } from 'react-hot-toast';
import Departments from "./pages/departments";
import Groups from "./pages/Groups";
import MemberGroups from "./pages/MemberGroups";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Default Route */}
          <Route
            index
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          {/* Employee Management */}
          <Route
            path="employees"
            element={<Employees />}
          />

          <Route
            path="roles"
            element={<Roles />}
          />

          {/* Building Management */}
          <Route
            path="terminals"
            element={<Terminals />}
          />

          <Route
            path="blocks"
            element={<Blocks />}
          />

          <Route
            path="floors"
            element={<Floors />}
          />

          <Route
            path="rooms"
            element={<Rooms />}
          />

          <Route
            path="rooms-availability"
            element={<TerminalHierarchy />}
          />

          {/* Incident Management */}
          <Route
            path="incident/dashboard"
            element={<IncidentDashboard />}
          />

          <Route
            path="incident/add-incident"
            element={<Incidents />}
          />

          <Route
            path="incident/room-allocation"
            element={<RoomAllocation />}
          />

          <Route
            path="incident/investigation"
            element={<InvestigationManager />}
          />

          <Route
            path="incident/post-incident-review"
            element={<PostIncidentReviewForm />}
          />

          <Route
            path="departments"
            element={<Departments />}
          />

          <Route
            path="groups"
            element={<Groups />}
          />
          <Route
            path="member-groups"
            element={<MemberGroups />}
          />
        </Route>





        {/* Invalid URL */}
        <Route
          path="*"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;