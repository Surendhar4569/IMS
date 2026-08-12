// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import AdminDashboard from './pages/AdminDashboard';
// import EmployeeDashboard from './pages/EmployeeDashboard';
// import { AuthProvider, useAuth } from './context/AuthContext';

// function App() {
//   return (
//     <AuthProvider>
//       <AppRoutes />
//     </AuthProvider>
//   );
// }

// function AppRoutes() {
//   const { token, user, loading, logout } = useAuth();

//   if (loading) {
//     return null;
//   }

//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={
//           !token ? <Login /> : <Navigate to="/" />
//         } />
//         <Route path="/" element={
//           token ? (
//             user?.role === 'admin' ? 
//               <AdminDashboard handleLogout={logout} /> : 
//               <EmployeeDashboard handleLogout={logout} />
//           ) : <Navigate to="/login" />
//         } />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
        path="/incident/dashboard"
        element={<IncidentDashboard />}
      />

      <Route
        path="/incident/add-incident"
        element={<Incidents />}
      />

      <Route
        path = "/incident/room-allocation"
        element={<RoomAllocation />}
      />

      <Route
        path = "/incident/investigation"
        element={<InvestigationManager />}
      />

      <Route
        path = "/incident/post-incident-review"
        element={<PostIncidentReviewForm />}
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
  );
}

export default App;