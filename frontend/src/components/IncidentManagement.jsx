import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Plus,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  EyeOff,
  Loader,
  Grid,
  Activity,
  Calendar,
  Hash,
  FileText,
  ChevronLeft,
  ChevronRight,
  Tag,
  Link as LinkIcon,
  TrendingUp,
  PieChart,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Check,
  Clock,
  BarChart3,
  MapPin,
  Phone,
  AlertOctagon,
  Flame,
  Ambulance,
  Shield,
  Wrench,
  Eye,
  Camera,
  ArrowLeft,
  Maximize2,
  Cloud,
  Plane,
  ClipboardCheck,
  CheckCircle2,
  MessageSquare,
  MinusCircle,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import airportVideo from "../assets/ccFootage/airport-footage.mp4";
import { checklistData } from "../../../backend/src/utils/checkListData.js";

const incidentsApi = `${import.meta.env.VITE_API_URL}/incidents`;
const employeesApi = `${import.meta.env.VITE_API_URL}/employees`;

function Incidents() {
  // State Management
  const [incidents, setIncidents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  //states for camera
  const [showCamModal, setShowCamModal] = useState(false);
  const [activeCam, setActiveCam] = useState(null); // null means grid view, number means full screen

  //states for checkList
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({ sec1: true }); // Open first section by default
  const [openComments, setOpenComments] = useState({}); // Track which comment boxes are open
  const [checklistResponses, setChecklistResponses] = useState({}); // Stores the Yes/No/NA, comments, and photos

  //states for view checkList
  const [showViewChecklistModal, setShowViewChecklistModal] = useState(false);

  // State to hold the dynamic time
  const [currentTimestamp, setCurrentTimestamp] = useState("");

  // Effect to update the clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      // Format: YYYY-MM-DD HH:MM:SS UTC
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, "0");
      const day = String(now.getUTCDate()).padStart(2, "0");
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");

      setCurrentTimestamp(
        `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`,
      );
    };

    // Set immediately on mount
    updateClock();

    // Update every 1 second
    const intervalId = setInterval(updateClock, 1000);

    // Cleanup interval on unmount to prevent memory leaks
    return () => clearInterval(intervalId);
  }, []);

  // Filter States
  const [filters, setFilters] = useState({
    search: "",
    incident_status: "",
    severity_level: "",
    incident_type: "",
    room_id: "",
    reported_by: "",
    from_date: "",
    to_date: "",
    sort_by: "created_at",
    sort_order: "DESC",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // UI States
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form Data
  const [formData, setFormData] = useState({
    incident_type: "",
    incident_title: "",
    location_details: "",
    description: "",
    severity_level: "MEDIUM",
    incident_status: "OPEN",
    reported_by: "",
  });

  // Statistics
  const [stats, setStats] = useState({
    total_incidents: 0,
    open_incidents: 0,
    in_progress_incidents: 0,
    resolved_incidents: 0,
    closed_incidents: 0,
    low_severity: 0,
    medium_severity: 0,
    high_severity: 0,
    critical_severity: 0,
    total_people_affected: 0,
    avg_resolution_hours: 0,
  });

  // Incident Types Summary
  const [incidentTypes, setIncidentTypes] = useState([]);

  // Status Summary
  const [statusSummary, setStatusSummary] = useState([]);

  useEffect(() => {
    fetchIncidents();
    fetchEmployees();
    fetchStats();
    fetchIncidentTypes();
    fetchStatusSummary();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchIncidents();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [
    filters.search,
    filters.incident_status,
    filters.severity_level,
    filters.incident_type,
    filters.room_id,
    currentPage,
  ]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${incidentsApi}/statistics`,
        getAuthConfig(),
      );
      setStats(response.data.data.overview);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchIncidentTypes = async () => {
    try {
      const response = await axios.get(
        `${incidentsApi}/types/summary`,
        getAuthConfig(),
      );
      setIncidentTypes(response.data.data || []);
    } catch (err) {
      console.error("Error fetching incident types:", err);
    }
  };

  const fetchStatusSummary = async () => {
    try {
      const response = await axios.get(
        `${incidentsApi}/status/summary`,
        getAuthConfig(),
      );
      setStatusSummary(response.data.data || []);
    } catch (err) {
      console.error("Error fetching status summary:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(employeesApi, getAuthConfig());
      setEmployees(response.data.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await axios.get(incidentsApi, {
        params,
        ...getAuthConfig(),
      });
      setIncidents(response.data.data || []);
      console.log(response.data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to fetch incidents",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const applyFilters = async () => {
    setCurrentPage(1);
    await fetchIncidents();
    setShowFilters(false);
  };

  const resetFilters = async () => {
    setFilters({
      search: "",
      incident_status: "",
      severity_level: "",
      incident_type: "",
      room_id: "",
      reported_by: "",
      from_date: "",
      to_date: "",
      sort_by: "created_at",
      sort_order: "DESC",
    });
    setCurrentPage(1);
    await fetchIncidents();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      incident_type: "",
      incident_title: "",
      location_details: "",
      description: "",
      severity_level: "MEDIUM",
      incident_status: "OPEN",
      reported_by: "",
    });
    setEditingId(null);
  };

  const { user } = useAuth();

  // ref for title input so we can focus without scrolling
  const titleRef = useRef(null);

  useEffect(() => {
    if (activeTab === "form") {
      try {
        requestAnimationFrame(() => {
          titleRef.current?.focus?.({ preventScroll: true });
        });
      } catch (e) {
        requestAnimationFrame(() => {
          titleRef.current?.focus?.();
        });
      }
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.incident_type) {
      setMessage({ type: "error", text: "Incident type is required" });
      return;
    }

    if (!formData.incident_title) {
      setMessage({ type: "error", text: "Incident title is required" });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const payload = {
        incident_type: formData.incident_type,
        incident_title: formData.incident_title.trim(),
        location_details: formData.location_details || null,
        description: formData.description || null,
        severity_level: formData.severity_level,
        incident_status: formData.incident_status,
        reported_by: user?.id ? Number(user.id) : null,
      };

      if (editingId) {
        await axios.put(
          `${incidentsApi}/${editingId}`,
          payload,
          getAuthConfig(),
        );
        setMessage({ type: "success", text: "Incident updated successfully" });
      } else {
        await axios.post(incidentsApi, payload, getAuthConfig());
        setMessage({ type: "success", text: "Incident added successfully" });
        //window.location.href = "https://ak.voicegateindia.com/gmrlive/index.php?module=CreateCampaign";
        window.open(
          "https://ak.voicegateindia.com/gmrlive/index.php?module=CreateCampaign",
          "_blank",
        );
        // return;
      }

      resetForm();
      await fetchIncidents();
      await fetchStats();
      await fetchIncidentTypes();
      await fetchStatusSummary();
      setActiveTab("list");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save incident",
      });
    } finally {
      setSaving(false);
    }
  };

  //submit check list
  const submitChecklist = async () => {
    try {
      // console.log(selectedIncident);
      const response = await axios.put(`${incidentsApi}/submit-checklist`, {
        incident_id: selectedIncident.id,
        checklist_data: checklistResponses,
      });

      // console.log(response.data);
      setSelectedIncident(null);
      setShowChecklistModal(false);

      //reset checklist states
      setOpenAccordions({ sec1: true });
      setOpenComments({});
      setChecklistResponses({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (incident) => {
    setEditingId(incident.id);
    setFormData({
      incident_type: incident.incident_type,
      incident_title: incident.incident_title,
      location_details: incident.location_details || "",
      description: incident.description || "",
      severity_level: incident.severity_level,
      incident_status: incident.incident_status,
      reported_by: incident.reported_by || "",
    });
    setActiveTab("form");
  };

  const handleDelete = async (id, title, code) => {
    if (
      !window.confirm(
        `Are you sure you want to delete incident "${title}" (${code})?`,
      )
    )
      return;

    try {
      setDeletingId(id);
      await axios.delete(`${incidentsApi}/${id}`, getAuthConfig());
      setMessage({ type: "success", text: "Incident deleted successfully" });
      await fetchIncidents();
      await fetchStats();
      await fetchIncidentTypes();
      await fetchStatusSummary();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete incident",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleReleaseIncident = async (id) => {
    if (!window.confirm("Are you sure you want to release this incident?"))
      return;

    try {
      setTogglingId(id);
      await axios.put(
        `${incidentsApi}/${id}/release`,
        {
          release_notes: "Incident released from incident management",
          closed_by: user?.id ? Number(user.id) : null,
        },
        getAuthConfig(),
      );
      setMessage({ type: "success", text: "Incident released successfully" });
      await fetchIncidents();
      await fetchStats();
      await fetchStatusSummary();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to release incident",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "LOW":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "MEDIUM":
        return <AlertCircle className="w-3.5 h-3.5" />;
      case "HIGH":
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case "CRITICAL":
        return <AlertOctagon className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getSeverityButtonStyle = (level, isActive) => {
    if (!isActive)
      return "border-2 border-gray-200 text-gray-500 bg-white hover:bg-gray-50 hover:border-gray-300";
    switch (level) {
      case "LOW":
        return "bg-green-500 text-white border-2 border-green-500 shadow-md shadow-green-200";
      case "MEDIUM":
        return "bg-yellow-500 text-white border-2 border-yellow-500 shadow-md shadow-yellow-200";
      case "HIGH":
        return "bg-orange-500 text-white border-2 border-orange-500 shadow-md shadow-orange-200";
      case "CRITICAL":
        return "bg-red-600 text-white border-2 border-red-600 shadow-md shadow-red-200";
      default:
        return "bg-gray-500 text-white border-2 border-gray-500 shadow-md";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-800 border-red-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "RESOLVED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CLOSED":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="w-3 h-3" />;
      case "IN_PROGRESS":
        return <Clock className="w-3 h-3" />;
      case "RESOLVED":
        return <CheckCircle className="w-3 h-3" />;
      case "CLOSED":
        return <Check className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getIncidentTypeIcon = (type) => {
    const icons = {
      RUNWAY_INCURSIONS: <Plane className="w-4 h-4" />,
      GROUND_HANDLING_ACCIDENTS: <Wrench className="w-4 h-4" />,
      FOREIGN_OBJECT_DEBRIS: <AlertCircle className="w-4 h-4" />,
      SLIPS_TRIPS_FALLS: <UserX className="w-4 h-4" />,
      AIRCRAFT_REFUELLING: <Flame className="w-4 h-4" />,
      WILDLIFE_STRIKES: <AlertTriangle className="w-4 h-4" />,
      VEHICLE_COLLISIONS_AIRSIDE: <AlertOctagon className="w-4 h-4" />,
      PASSENGER_SECURITY: <Shield className="w-4 h-4" />,
      FIRE_AND_SMOKE: <Flame className="w-4 h-4" />,
      DANGEROUS_GOODS: <AlertTriangle className="w-4 h-4" />,
      MANUAL_HANDLING: <Users className="w-4 h-4" />,
      EQUIPMENT_FAILURES: <Wrench className="w-4 h-4" />,
      WEATHER_RELATED: <Cloud className="w-4 h-4" />,
      COMMUNICATION_FAILURES: <Phone className="w-4 h-4" />,
      NEAR_MISSES: <AlertCircle className="w-4 h-4" />,
    };
    return icons[type] || <AlertCircle className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = incidents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(incidents.length / itemsPerPage);

  const airportCams = [
    {
      id: 1,
      name: "Terminal 1 - Main Hall",
      src: airportVideo,
    },
    {
      id: 2,
      name: "Gate A12 - Boarding",
      src: airportVideo,
    },
    {
      id: 3,
      name: "Baggage Claim",
      src: airportVideo,
    },
    {
      id: 4,
      name: "Runway 09L - Approach",
      src: airportVideo,
    },
    {
      id: 5,
      name: "Security Checkpoint B",
      src: airportVideo,
    },
    {
      id: 6,
      name: "ATC Tower View",
      src: airportVideo,
    },
    {
      id: 7,
      name: "Parking Garage L2",
      src: airportVideo,
    },
    {
      id: 8,
      name: "Duty Free Shop",
      src: airportVideo,
    },
    {
      id: 9,
      name: "Cargo Facility",
      src: airportVideo,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="rounded-2xl bg-gradient-to-r from-[#0B1D3A] via-[#132D5E] to-[#1A3A6E] p-8 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-300" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                    Safety & Security
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-2">Incident Management</h1>
                <p className="text-red-100 max-w-2xl">
                  Track, manage, and resolve facility incidents with real-time
                  monitoring
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <AlertTriangle className="w-5 h-5 mb-2 text-red-300" />
                  <div className="text-2xl font-bold">
                    {stats.total_incidents}
                  </div>
                  <div className="text-xs text-white/80 mt-1">
                    Total Incidents
                  </div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <Clock className="w-5 h-5 mb-2 text-yellow-300" />
                  <div className="text-2xl font-bold">
                    {stats.open_incidents}
                  </div>
                  <div className="text-xs text-white/80 mt-1">Open Cases</div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <Users className="w-5 h-5 mb-2 text-blue-300" />
                  <div className="text-2xl font-bold">
                    {stats.total_people_affected}
                  </div>
                  <div className="text-xs text-white/80 mt-1">
                    People Allocated
                  </div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <CheckCircle className="w-5 h-5 mb-2 text-green-300" />
                  <div className="text-2xl font-bold">
                    {stats.resolved_incidents}
                  </div>
                  <div className="text-xs text-white/80 mt-1">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex gap-1">
            <button
              onClick={() => {
                setActiveTab("list");
                setMessage({ type: "", text: "" });
              }}
              className={`flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "list"
                  ? "bg-[#0B1D3A] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid className="w-4 h-4" />
              Incidents List
              {incidents.length > 0 && activeTab !== "list" && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {incidents.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab("form");
              }}
              className={`flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "form"
                  ? "bg-[#0B1D3A] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Plus className="w-4 h-4" />
              {editingId ? "Edit Incident" : "Add Incident"}
            </button>
            {/* <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'analytics' 
                  ? 'bg-[#0B1D3A] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button> */}
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <div
            className={`mb-6 rounded-xl p-4 flex items-start gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="flex-1 text-sm">{message.text}</p>
            <button onClick={() => setMessage({ type: "", text: "" })}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Analytics Section */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.total_incidents}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Total Incidents
                </h3>
                <p className="text-xs text-gray-500 mt-1">All incidents</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.open_incidents + stats.in_progress_incidents}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Active Cases
                </h3>
                <p className="text-xs text-gray-500 mt-1">Open + In Progress</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.total_people_affected}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-700">
                  People Allocated
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Total impacted individuals
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.avg_resolution_hours || 0)}h
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Avg Resolution Time
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Average hours to resolve
                </p>
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Severity Distribution
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Critical</span>
                    <span className="text-gray-600">
                      {stats.critical_severity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#0B1D3A] to-[#1A3A6E] h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(stats.critical_severity / stats.total_incidents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">High</span>
                    <span className="text-gray-600">{stats.high_severity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(stats.high_severity / stats.total_incidents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Medium</span>
                    <span className="text-gray-600">
                      {stats.medium_severity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(stats.medium_severity / stats.total_incidents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Low</span>
                    <span className="text-gray-600">{stats.low_severity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(stats.low_severity / stats.total_incidents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Types Distribution */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Incident Types Distribution
              </h3>
              <div className="space-y-4">
                {incidentTypes.map((type) => (
                  <div key={type.incident_type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        {getIncidentTypeIcon(type.incident_type)}
                        {type.incident_type}
                      </span>
                      <span className="text-gray-600">
                        {type.count} incidents
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(type.count / stats.total_incidents) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {incidentTypes.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No incident data available
                  </p>
                )}
              </div>
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statusSummary.map((status) => (
                <div
                  key={status.incident_status}
                  className={`p-4 rounded-xl border ${getStatusColor(status.incident_status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.incident_status)}
                      <span className="font-semibold">
                        {status.incident_status.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-2xl font-bold">{status.count}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {status.total_people_affected > 0 && (
                      <div>Affected: {status.total_people_affected}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Section */}
        {activeTab === "form" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Incident" : "Add New Incident"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {editingId
                  ? "Update incident details"
                  : "Add a new facility incident"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Incident Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        name="incident_type"
                        value={formData.incident_type}
                        onChange={handleInputChange}
                        className="w-full pl-10 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      >
                        <option value="">Select Type</option>
                        <option value="RUNWAY_INCURSIONS">
                          ✈️ Runway Incursions
                        </option>
                        <option value="GROUND_HANDLING_ACCIDENTS">
                          🔧 Ground Handling Accidents
                        </option>
                        <option value="FOREIGN_OBJECT_DEBRIS">
                          🧹 Foreign Object Debris (FOD)
                        </option>
                        <option value="SLIPS_TRIPS_FALLS">
                          ⚠️ Slips, Trips and Falls
                        </option>
                        <option value="AIRCRAFT_REFUELLING">
                          ⛽ Aircraft Refuelling Incidents
                        </option>
                        <option value="WILDLIFE_STRIKES">
                          🦅 Wildlife Strikes
                        </option>
                        <option value="VEHICLE_COLLISIONS_AIRSIDE">
                          🚗 Vehicle Collisions on the Airside
                        </option>
                        <option value="PASSENGER_SECURITY">
                          👮 Passenger Security Incidents
                        </option>
                        <option value="FIRE_AND_SMOKE">
                          🔥 Fire and Smoke Incidents
                        </option>
                        <option value="DANGEROUS_GOODS">
                          ☢️ Dangerous Goods Incidents
                        </option>
                        <option value="MANUAL_HANDLING">
                          🏋️ Manual Handling Injuries
                        </option>
                        <option value="EQUIPMENT_FAILURES">
                          🔩 Equipment Failures
                        </option>
                        <option value="WEATHER_RELATED">
                          🌧️ Weather-Related Incidents
                        </option>
                        <option value="COMMUNICATION_FAILURES">
                          📡 Communication Failures
                        </option>
                        <option value="NEAR_MISSES">⚡ Near Misses</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Incident Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="incident_title"
                      value={formData.incident_title}
                      onChange={handleInputChange}
                      placeholder="e.g., Fire alarm triggered, Medical emergency"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      ref={titleRef}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location Details
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="location_details"
                        value={formData.location_details}
                        onChange={handleInputChange}
                        placeholder="Specific area, room corner, floor section..."
                        className="w-full pl-10 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {/* Severity Level — Button Group */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Severity Level
                    </label>
                    <div className="flex gap-2">
                      {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              severity_level: level,
                            }))
                          }
                          className={`flex-1 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${getSeverityButtonStyle(level, formData.severity_level === level)}`}
                        >
                          {getSeverityIcon(level)}
                          {level === "LOW"
                            ? "Low"
                            : level === "MEDIUM"
                              ? "Medium"
                              : level === "HIGH"
                                ? "High"
                                : "Critical"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Status
                    </label>
                    <select
                      name="incident_status"
                      value={formData.incident_status}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    >
                      <option value="OPEN">Open - Initial Entry</option>
                      <option value="IN_PROGRESS">
                        In Progress - Being Addressed
                      </option>
                      <option value="RESOLVED">Resolved - Action Taken</option>
                      <option value="CLOSED">Closed - Case Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Detailed description of the incident, actions taken, witness statements..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-100 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0B1D3A] text-white rounded-xl text-sm font-semibold hover:bg-[#132D5E] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingId ? (
                        <RefreshCw className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {editingId ? "Update Incident" : "Add Incident"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    if (!editingId) setActiveTab("list");
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Section */}
        {activeTab === "list" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Filters Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Incidents Directory
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Track and manage all incidents across your facilities
                  </p>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>

              <div className={`mt-4 ${showFilters ? "block" : "hidden"}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      placeholder="Search incidents..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <select
                    value={filters.incident_status}
                    onChange={(e) =>
                      handleFilterChange("incident_status", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>

                  <select
                    value={filters.severity_level}
                    onChange={(e) =>
                      handleFilterChange("severity_level", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Severity</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>

                  <select
                    value={filters.incident_type}
                    onChange={(e) =>
                      handleFilterChange("incident_type", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="RUNWAY_INCURSIONS">Runway Incursions</option>
                    <option value="GROUND_HANDLING_ACCIDENTS">
                      Ground Handling Accidents
                    </option>
                    <option value="FOREIGN_OBJECT_DEBRIS">
                      Foreign Object Debris (FOD)
                    </option>
                    <option value="SLIPS_TRIPS_FALLS">
                      Slips, Trips and Falls
                    </option>
                    <option value="AIRCRAFT_REFUELLING">
                      Aircraft Refuelling Incidents
                    </option>
                    <option value="WILDLIFE_STRIKES">Wildlife Strikes</option>
                    <option value="VEHICLE_COLLISIONS_AIRSIDE">
                      Vehicle Collisions on the Airside
                    </option>
                    <option value="PASSENGER_SECURITY">
                      Passenger Security Incidents
                    </option>
                    <option value="FIRE_AND_SMOKE">
                      Fire and Smoke Incidents
                    </option>
                    <option value="DANGEROUS_GOODS">
                      Dangerous Goods Incidents
                    </option>
                    <option value="MANUAL_HANDLING">
                      Manual Handling Injuries
                    </option>
                    <option value="EQUIPMENT_FAILURES">
                      Equipment Failures
                    </option>
                    <option value="WEATHER_RELATED">
                      Weather-Related Incidents
                    </option>
                    <option value="COMMUNICATION_FAILURES">
                      Communication Failures
                    </option>
                    <option value="NEAR_MISSES">Near Misses</option>
                  </select>

                  <input
                    type="date"
                    value={filters.from_date}
                    onChange={(e) =>
                      handleFilterChange("from_date", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="From Date"
                  />

                  <input
                    type="date"
                    value={filters.to_date}
                    onChange={(e) =>
                      handleFilterChange("to_date", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="To Date"
                  />
                </div>

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-[#0B1D3A] text-white rounded-lg text-sm font-semibold"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Incidents Table View */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader className="w-8 h-8 animate-spin text-red-600" />
                <p className="mt-3 text-gray-500">Loading incidents...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-gray-50 rounded-full p-4 mb-4">
                  <AlertTriangle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No incidents found
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {filters.search ||
                  filters.incident_status ||
                  filters.severity_level ||
                  filters.incident_type
                    ? "Try adjusting your filters"
                    : "Add your first incident to get started"}
                </p>
                {(filters.search ||
                  filters.incident_status ||
                  filters.severity_level ||
                  filters.incident_type) && (
                  <button
                    onClick={resetFilters}
                    className="text-red-600 text-sm font-semibold"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Incident
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentItems.map((incident) => (
                      <tr
                        key={incident.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                              {getIncidentTypeIcon(incident.incident_type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">
                                  {incident.incident_title}
                                </p>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${incident.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}
                                >
                                  {incident.is_active ? "Active" : "Archived"}
                                </span>
                              </div>
                              <p className="mt-1 text-xs font-mono text-gray-500">
                                {incident.incident_code}
                              </p>
                              {incident.description && (
                                <p className="mt-2 max-w-md text-xs text-gray-500 line-clamp-2">
                                  {incident.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${getSeverityColor(incident.severity_level)}`}
                          >
                            {getSeverityIcon(incident.severity_level)}
                            {incident.severity_level}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${getStatusColor(incident.incident_status)}`}
                          >
                            {getStatusIcon(incident.incident_status)}
                            {incident.incident_status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(incident.created_at)}</span>
                          </div>
                          {incident.reported_by_details && (
                            <p className="mt-1 text-xs text-gray-500">
                              By: {incident.reported_by_details.employee_name}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top text-right">
                          <div className="flex justify-end gap-2">
                            {/* CONDITIONAL CHECKLIST BUTTONS */}
                            {incident.checklist_data &&
                            Object.keys(incident.checklist_data).length > 0 ? (
                              // If data exists: Show View Checklist Button
                              <button
                                onClick={() => {
                                  setSelectedIncident(incident);
                                  setShowViewChecklistModal(true);
                                }}
                                className="px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
                              >
                                <ClipboardList className="w-3 h-3" />
                                View Checklist
                              </button>
                            ) : (
                              // If data is null/empty: Show Fill Checklist Button
                              <button
                                onClick={() => {
                                  setSelectedIncident(incident);
                                  setChecklistResponses({}); // Clear any old form data
                                  setShowChecklistModal(true);
                                }}
                                className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                              >
                                <ClipboardCheck className="w-3 h-3" />
                                Checklist
                              </button>
                            )}

                            {/* view button */}
                            <button
                              onClick={() => {
                                setSelectedIncident(incident);
                                setShowDetailsModal(true);
                              }}
                              className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && incidents.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, incidents.length)} of{" "}
                  {incidents.length} incidents
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            currentPage === pageNum
                              ? "bg-[#0B1D3A] text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDetailsModal(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-[#0B1D3A] to-[#1A3A6E] p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedIncident.incident_title}
                    </h3>
                    <p className="text-sm text-white/70 mt-1 font-mono">
                      {selectedIncident.incident_code}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white/70 hover:text-white p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {getIncidentTypeIcon(selectedIncident.incident_type)}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedIncident.incident_type}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {getSeverityIcon(selectedIncident.severity_level)}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Severity</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedIncident.severity_level}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {getStatusIcon(selectedIncident.incident_status)}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedIncident.incident_status.replace("_", " ")}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Affected</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedIncident.people_affected || 0}
                    </p>
                  </div>
                </div>

                {/* Location */}
                {selectedIncident.location_details && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      Location Details
                    </h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                      {selectedIncident.location_details}
                    </p>
                  </div>
                )}

                {/* Description */}
                {selectedIncident.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Description
                    </h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl whitespace-pre-wrap">
                      {selectedIncident.description}
                    </p>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Timeline
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(selectedIncident.created_at) || "-"}
                      </span>
                    </div>
                    {selectedIncident.updated_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Updated:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(selectedIncident.updated_at) || "-"}
                        </span>
                      </div>
                    )}
                    {selectedIncident.resolved_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Resolved:</span>
                        <span className="font-medium text-gray-900">
                          {selectedIncident.resolved_at}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reporter */}
                {selectedIncident.reported_by_details && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      Added By
                    </h4>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#0B1D3A] text-white flex items-center justify-center text-sm font-bold">
                        {selectedIncident.reported_by_details.employee_name?.charAt(
                          0,
                        ) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedIncident.reported_by_details.employee_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedIncident.reported_by_details.department ||
                            ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 rounded-b-2xl">
                {/*CAMERA BUTTON */}
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowCamModal(true);
                    setActiveCam(null); // Reset to grid view when opening
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  CC TV
                </button>

                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedIncident);
                  }}
                  className="px-4 py-2 bg-[#0B1D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#132D5E] transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showCamModal && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-4 md:p-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-3">
                {activeCam !== null ? (
                  <button
                    onClick={() => setActiveCam(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
                {activeCam !== null
                  ? `CAM ${activeCam.id} - ${activeCam.name}`
                  : "Airport CCTV Control Center"}
              </h2>
              <button
                onClick={() => setShowCamModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-all"
              >
                Close
              </button>
            </div>

            {/* Video Content Area */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              {/* GRID VIEW (9 Cams) */}
              {activeCam === null ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl">
                  {airportCams.map((cam) => (
                    <div
                      key={cam.id}
                      onClick={() => setActiveCam(cam)}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all aspect-video bg-black flex items-center justify-center"
                    >
                      {/* Center Camera Label */}
                      <span className="text-white/30 text-3xl font-bold font-mono tracking-widest group-hover:text-white/80 transition-colors">
                        CAM {cam.id.toString().padStart(2, "0")}
                      </span>

                      {/* CCTV Overlay - Top */}
                      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start text-xs font-mono text-white bg-gradient-to-b from-black/80 to-transparent">
                        <span className="bg-red-600/80 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>{" "}
                          REC
                        </span>
                        <span className="text-[10px] opacity-80">
                          ID:{cam.id.toString().padStart(3, "0")}
                        </span>
                      </div>

                      {/* CCTV Overlay - Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end text-xs font-mono text-white bg-gradient-to-t from-black/80 to-transparent">
                        <span className="font-bold text-sm drop-shadow-md">
                          {cam.name}
                        </span>
                        <span className="text-[10px] opacity-80">
                          {currentTimestamp}
                        </span>
                      </div>

                      {/* CRT Scanline Effect */}
                      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_1px,transparent_1px,transparent_3px)]"></div>

                      {/* Vignette */}
                      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]"></div>

                      {/* Enlarge icon on hover */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-3 rounded-full">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* FULL SCREEN VIEW (Single Cam) */
                <div className="relative w-full h-full max-w-6xl aspect-video rounded-lg overflow-hidden bg-black border border-white/10">
                  <video
                    className="w-full h-full object-contain opacity-90"
                    src={activeCam.src}
                    autoPlay
                    loop
                    muted
                    controls
                    playsInline
                  />

                  {/* CCTV Overlay for Full Screen */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start text-sm font-mono text-white bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
                    <span className="bg-red-600/80 px-2 py-1 rounded text-xs flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>{" "}
                      REC
                    </span>
                    <span className="text-xs">
                      CAM {activeCam.id.toString().padStart(2, "0")} |{" "}
                      {activeCam.name}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end text-sm font-mono text-white bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                    <span className="opacity-80">
                      LAT: 40.7128° N | LON: 74.0060° W
                    </span>
                    <span className="opacity-80">{currentTimestamp}</span>
                  </div>

                  {/* CRT Scanline Effect */}
                  <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_1px,transparent_1px,transparent_3px)]"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* check list modal */}
        {showChecklistModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-green-600" />
                  Fire Suppression Inspection Checklist
                </h2>
                <button
                  onClick={() => setShowChecklistModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {checklistData.map((section) => (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() =>
                        setOpenAccordions((prev) => ({
                          ...prev,
                          [section.id]: !prev[section.id],
                        }))
                      }
                      className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-800 text-left">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform ${openAccordions[section.id] ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Accordion Content */}
                    {openAccordions[section.id] && (
                      <div className="p-4 space-y-6 bg-white">
                        {section.items.map((item) => {
                          const currentResponse = checklistResponses[
                            item.id
                          ] || { status: null, comment: "", photoName: "" };
                          const isCommentOpen = openComments[item.id];

                          return (
                            <div
                              key={item.id}
                              className="border-b border-gray-100 pb-4 last:border-b-0"
                            >
                              <p className="font-medium text-gray-700 mb-3">
                                {item.text}
                              </p>

                              {/* Buttons Row */}
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                {/* Yes/No/NA Buttons */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      setChecklistResponses((prev) => ({
                                        ...prev,
                                        [item.id]: {
                                          ...prev[item.id],
                                          status: "Yes",
                                        },
                                      }))
                                    }
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-all ${currentResponse.status === "Yes" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Yes
                                  </button>
                                  <button
                                    onClick={() =>
                                      setChecklistResponses((prev) => ({
                                        ...prev,
                                        [item.id]: {
                                          ...prev[item.id],
                                          status: "No",
                                        },
                                      }))
                                    }
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-all ${currentResponse.status === "No" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                  >
                                    <X className="w-4 h-4" /> No
                                  </button>
                                  <button
                                    onClick={() =>
                                      setChecklistResponses((prev) => ({
                                        ...prev,
                                        [item.id]: {
                                          ...prev[item.id],
                                          status: "N/A",
                                        },
                                      }))
                                    }
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-all ${currentResponse.status === "N/A" ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                  >
                                    <MinusCircle className="w-4 h-4" /> N/A
                                  </button>
                                </div>
                                <div className="flex-grow"></div> {/* Spacer */}
                                {/* Photo & Comment Buttons */}
                                <div className="flex gap-2">
                                  {/* <label className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center gap-1 cursor-pointer">
                                    <Camera className="w-4 h-4" /> Photo
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files[0]) {
                                          setChecklistResponses((prev) => ({
                                            ...prev,
                                            [item.id]: {
                                              ...prev[item.id],
                                              photoName: e.target.files[0].name,
                                            },
                                          }));
                                        }
                                      }}
                                    />
                                  </label> */}
                                  <button
                                    onClick={() =>
                                      setOpenComments((prev) => ({
                                        ...prev,
                                        [item.id]: !prev[item.id],
                                      }))
                                    }
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${isCommentOpen ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
                                  >
                                    <MessageSquare className="w-4 h-4" />{" "}
                                    Comment
                                  </button>
                                </div>
                              </div>

                              {/* Conditional UI: Photo Name & Comment Textarea */}
                              {(isCommentOpen || currentResponse.photoName) && (
                                <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 space-y-3">
                                  {currentResponse.photoName && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                                      <Camera className="w-4 h-4 text-green-600" />
                                      <span>{currentResponse.photoName}</span>
                                    </div>
                                  )}

                                  {isCommentOpen && (
                                    <textarea
                                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                      rows={3}
                                      placeholder="Add remarks or details here..."
                                      value={currentResponse.comment}
                                      onChange={(e) =>
                                        setChecklistResponses((prev) => ({
                                          ...prev,
                                          [item.id]: {
                                            ...prev[item.id],
                                            comment: e.target.value,
                                          },
                                        }))
                                      }
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setShowChecklistModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitChecklist}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Checklist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View checklist modal */}
        {showViewChecklistModal && selectedIncident && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  Submitted Checklist Data
                </h2>
                <button
                  onClick={() => setShowViewChecklistModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {checklistData.map((section) => (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Section Title */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <span className="font-semibold text-gray-800 text-left">
                        {section.title}
                      </span>
                    </div>

                    {/* Section Items */}
                    <div className="divide-y divide-gray-100">
                      {section.items.map((item) => {
                        // Find the matching answer from the backend data
                        const response =
                          selectedIncident.checklist_data?.[item.id] || {};

                        // Helper function to color code the status
                        const getStatusClass = (status) => {
                          if (status === "Yes")
                            return "bg-green-100 text-green-800 border border-green-200";
                          if (status === "No")
                            return "bg-red-100 text-red-800 border border-red-200";
                          if (status === "N/A")
                            return "bg-gray-100 text-gray-800 border border-gray-200";
                          return "bg-gray-100 text-gray-500 border border-gray-200";
                        };

                        return (
                          <div
                            key={item.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-start gap-4 bg-white"
                          >
                            {/* Question Label */}
                            <div className="flex-1">
                              <p className="font-medium text-gray-700 text-sm mb-2">
                                {item.text}
                              </p>

                              {/* Show Comment if it exists */}
                              {response.comment && (
                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-200">
                                  <span className="font-semibold text-gray-700">
                                    Comment:
                                  </span>{" "}
                                  {response.comment}
                                </div>
                              )}

                              {/* Show Photo Name if it exists */}
                              {response.photoName && (
                                <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-md border border-blue-200 flex items-center gap-2 w-fit">
                                  <Camera className="w-4 h-4 text-blue-600" />
                                  <span className="font-semibold text-blue-700">
                                    Photo:
                                  </span>{" "}
                                  {response.photoName}
                                </div>
                              )}
                            </div>

                            {/* Status Badge */}
                            <div className="flex-shrink-0">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold inline-block min-w-[60px] text-center ${getStatusClass(response.status)}`} 
                              >
                                {response.status || "Skipped"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setShowViewChecklistModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Incidents;
