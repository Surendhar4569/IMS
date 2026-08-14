import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Welcome to Incident Management System
      </p>
    </div>
  );
};

export default Dashboard;
