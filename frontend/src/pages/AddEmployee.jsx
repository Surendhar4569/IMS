import React, { useEffect, useState, useCallback } from "react";
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
  Eye,
  EyeOff,
  Loader,
  Users,
  Calendar,
  Activity,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  UserPlus,
  Download,
  Upload,
  Key,
  Lock,
  Shield,
  Briefcase,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import bcrypt from "bcryptjs";
import vgtAPI from "../utils/axiosConfig";
import { toast } from "react-toastify";
import { sha256 } from "../utils/sha.js";

const employeesApi = `${import.meta.env.VITE_API_URL}/employees`;
const rolesApi = `${import.meta.env.VITE_API_URL}/roles`;

function Employees() {
  // State Management
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAction, setPasswordAction] = useState(null);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [emsEditData, setEmsEditData] = useState({
    member: null,
    phone: null,
    email: null,
  });
  const { user } = useAuth();

  // Filter States
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    role_id: "",
    from_date: "",
    to_date: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // UI States
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form Data
  const [formData, setFormData] = useState({
    role_id: "",
    role: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    phone_type: "",
    email: "",

    password: "",
    confirmPassword: "",

    is_active: true,

    department_id: "",
    display_name: "",
    date_of_birth: "",
    gender: "",
    preferred_language: "",
    timezone: "",

    user_code: "",

    // Phone preferences
    is_primary: true,
    is_sms_enabled: true,
    is_voice_enabled: false,
    is_whatsapp_enabled: false,

    // Email preference
    is_primary_email: true,
  });

  // Statistics
  const [stats, setStats] = useState({
    total_employees: 0,
    active_employees: 0,
    inactive_employees: 0,
    roles_occupied: 0,
    joined_this_month: 0,
  });

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
    // fetchStats();
    fetchDepartments();
  }, []);

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

  //   const fetchStats = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${import.meta.env.VITE_API_URL}/stats/employees`,
  //         getAuthConfig(),
  //       );
  //       setStats(response.data.data);
  //     } catch (err) {
  //       console.error("Error fetching stats:", err);
  //     }
  //   };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(rolesApi, getAuthConfig());
      setRoles(response.data.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await vgtAPI.get(`/department/`);
      setDepartments(response.data.department || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };
  const fetchEMSMember = async (memberId) => {
    try {
      if (!memberId) {
        throw new Error("EMS member ID not found");
      }

      console.log("Fetching EMS member:", memberId);

      const response = await vgtAPI.get(`/members/${memberId}`);

      console.log("EMS member response:", response.data);

      const emsData = response.data;

      // Check EMS error response
      if (emsData?.error_response?.error_code !== 0) {
        throw new Error(
          emsData?.error_response?.error_message ||
            "Failed to fetch EMS member",
        );
      }

      const emsMember = emsData?.members?.[0];

      if (!emsMember) {
        throw new Error("EMS member data not found");
      }

      return emsMember;
    } catch (error) {
      console.error("EMS member fetch error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch EMS employee",
        { cause: error },
      );
    }
  };
  const fetchEMSMemberPhone = async (memberId) => {
    try {
      console.log("Fetching EMS phone:", memberId);
      const response = await vgtAPI.get(`/members_phones/`, {
        params: {
          query: `member_id:${memberId}`,
        },
      });

      console.log("EMS Phone GET Response:", response.data);

      const data = response.data;

      if (data?.error_response?.error_code !== 0) {
        throw new Error(
          data?.error_response?.error_message || "Failed to fetch EMS phone",
        );
      }

      return data;
    } catch (error) {
      console.error("EMS Phone GET Error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch EMS phone",
        { cause: error },
      );
    }
  };

  const fetchEMSMemberEmail = async (memberId) => {
    try {
      console.log("Fetching EMS email:", memberId);
      const response = await vgtAPI.get(`/members_emails/`, {
        params: {
          query: `member_id:${memberId}`,
        },
      });

      console.log("EMS Email GET Response:", response.data);

      const data = response.data;

      if (data?.error_response?.error_code !== 0) {
        throw new Error(
          data?.error_response?.error_message || "Failed to fetch EMS email",
        );
      }

      return data;
    } catch (error) {
      console.error("EMS Email GET Error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch EMS email",
        { cause: error },
      );
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        user_id: user?.id,
        salt: user?.salt,
      };

      if (filters.search) params.search = filters.search;
      if (filters.status !== "all")
        params.is_active = filters.status === "active";
      if (filters.role_id) params.role_id = filters.role_id;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;

      const response = await axios.get(employeesApi, {
        params,
        ...getAuthConfig(),
      });
      setEmployees(response.data.data || []);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to fetch users",
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
    await fetchEmployees();
    setShowFilters(false);
  };

  const resetFilters = async () => {
    setFilters({
      search: "",
      status: "all",
      role_id: "",
      from_date: "",
      to_date: "",
    });
    setCurrentPage(1);
    await fetchEmployees();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "role_id") {
      const selectedRole = roles.find((role) => String(role.id) === value);

      setFormData((prev) => ({
        ...prev,
        role_id: selectedRole.id,
        role: selectedRole.name,
      }));

      return;
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      role_id: "",
      role: "",
      first_name: "",
      last_name: "",
      contact_number: "",
      email: "",

      password: "",
      confirmPassword: "",

      is_active: true,

      department_id: "",
      display_name: "",
      date_of_birth: "",
      gender: "",
      preferred_language: "",
      timezone: "",

      user_code: "",
    });

    setEditingId(null);
    setSelectedEmployee(null);
  };

  const createEMSMember = async (emsPayload) => {
    try {
      const response = await vgtAPI.post(`/members/`, emsPayload);

      console.log("EMS create response:", response.data);

      const emsData = response.data;

      // Check EMS business-level error
      if (emsData?.error_response?.error_code !== 0) {
        throw new Error(
          emsData?.error_response?.error_message ||
            "EMS employee creation failed",
        );
      }

      const emsMember = emsData?.members?.[0];

      if (!emsMember) {
        throw new Error("EMS employee was not returned after creation");
      }

      return emsMember;
    } catch (error) {
      console.error("EMS employee creation error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS employee creation failed",
        { cause: error },
      );
    }
  };

  const makeMemberAsAdmin = async (adminPayload) => {
    try {
      const response = await vgtAPI.post(`/admins/`, adminPayload);

      console.log("EMS create response:", response.data);

      const emsAdminData = response.data;

      // Check EMS business-level error
      if (emsAdminData?.error_response?.error_code !== 0) {
        throw new Error(
          emsAdminData?.error_response?.error_message ||
            "EMS admin creation failed",
        );
      }

      const emsAdmin = emsAdminData?.admins?.[0];

      if (!emsAdmin) {
        throw new Error("EMS employee was not returned after creation");
      }

      return emsAdmin;
    } catch (error) {
      console.error("EMS Admin creation error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS employee creation failed",
        { cause: error },
      );
    }
  };

  const assignRoleToAdmin = async (adminRolePayload) => {
    try {
      const response = await vgtAPI.post(`/admin_roles/`, adminRolePayload);

      console.log("EMS admin role response:", response.data);

      const emsAdminRoleRes = response.data;

      // Check EMS business-level error
      if (emsAdminRoleRes?.error_response?.error_code !== 0) {
        throw new Error(
          emsAdminRoleRes?.error_response?.error_message ||
            "EMS admin creation failed",
        );
      }

      const emsAdminRole = emsAdminRoleRes?.admins_roles?.[0];

      if (!emsAdminRole) {
        throw new Error("EMS admin role was not returned after creation");
      }

      return emsAdminRole;
    } catch (error) {
      console.error("EMS Admin creation error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS employee creation failed",
        { cause: error },
      );
    }
  };

  const createEMSMemberPhone = async (phonePayload) => {
    try {
      console.log("EMS phone payload:", phonePayload);
      const response = await vgtAPI.post(`/members_phones/`, phonePayload);

      console.log("EMS phone response:", response.data);

      const data = response.data;

      if (data?.error_response && data.error_response.error_code !== 0) {
        throw new Error(
          data.error_response.error_message || "EMS phone creation failed",
        );
      }

      return data;
    } catch (error) {
      console.error("EMS phone creation error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS phone creation failed",
        { cause: error },
      );
    }
  };

  const createEMSMemberEmail = async (emailPayload) => {
    try {
      console.log("EMS email payload:", emailPayload);
      const response = await vgtAPI.post(`/members_emails/`, emailPayload);

      console.log("EMS email response:", response.data);

      const data = response.data;

      if (data?.error_response && data.error_response.error_code !== 0) {
        throw new Error(
          data.error_response.error_message || "EMS email creation failed",
        );
      }

      return data;
    } catch (error) {
      console.error("EMS email creation error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS email creation failed",
        { cause: error },
      );
    }
  };

  const updateEMSMember = async (memberId, payload) => {
    try {
      const response = await vgtAPI.put(`/members/${memberId}`, payload);

      console.log("EMS Member Update Response:", response.data);

      const data = response.data;

      if (data?.error_response && data.error_response.error_code !== 0) {
        throw new Error(
          data.error_response.error_message || "EMS member update failed",
        );
      }

      return data;
    } catch (error) {
      console.error("EMS Member Update Error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS member update failed",
        { cause: error },
      );
    }
  };

  const updateEMSMemberPhone = async (phoneId, payload) => {
    try {
      const response = await vgtAPI.put(`/members_phones/${phoneId}`, payload);

      console.log("EMS Phone Update Response:", response.data);

      const data = response.data;

      if (data?.error_response && data.error_response.error_code !== 0) {
        throw new Error(
          data.error_response.error_message || "EMS phone update failed",
        );
      }

      return data;
    } catch (error) {
      console.error("EMS Phone Update Error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS phone update failed",
        { cause: error },
      );
    }
  };

  const updateEMSMemberEmail = async (emailId, payload) => {
    try {
      const response = await vgtAPI.put(`/members_emails/${emailId}`, payload);

      console.log("EMS Email Update Response:", response.data);

      const data = response.data;

      if (data?.error_response && data.error_response.error_code !== 0) {
        throw new Error(
          data.error_response.error_message || "EMS email update failed",
        );
      }

      return data;
    } catch (error) {
      console.error("EMS Email Update Error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS email update failed",
        { cause: error },
      );
    }
  };

  const deleteEMSMember = async (memberId) => {
    try {
      console.log("Deleting EMS Member:", memberId);

      const response = await vgtAPI.delete(`/members/${memberId}`);

      console.log("EMS Member Delete Response:", response.data);

      const data = response.data;

      if (data?.error_response && data.error_response.error_code !== 0) {
        throw new Error(
          data.error_response.error_message || "EMS member deletion failed",
        );
      }

      return data;
    } catch (error) {
      console.error("EMS Member Delete Error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS member deletion failed",
        { cause: error },
      );
    }
  };

  const deleteEMSMemberPhone = async (phoneId) => {
    try {
      console.log("Deleting EMS Phone:", phoneId);

      const response = await vgtAPI.delete(`/members_phones/${phoneId}`);

      console.log("EMS Phone Delete Response:", response.data);

      const data = response.data;

      if (data?.error_response && data.error_response.error_code !== 0) {
        throw new Error(
          data.error_response.error_message || "EMS phone deletion failed",
        );
      }

      return data;
    } catch (error) {
      console.error("EMS Phone Delete Error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS phone deletion failed",
        { cause: error },
      );
    }
  };

  const deleteEMSMemberEmail = async (emailId) => {
    try {
      console.log("Deleting EMS Email:", emailId);

      const response = await vgtAPI.delete(`/members_emails/${emailId}`);

      console.log("EMS Email Delete Response:", response.data);

      const data = response.data;

      if (data?.error_response && data.error_response.error_code !== 0) {
        throw new Error(
          data.error_response.error_message || "EMS email deletion failed",
        );
      }

      return data;
    } catch (error) {
      console.error("EMS Email Delete Error:", error);

      throw new Error(
        error.response?.data?.error_response?.error_message ||
          error.response?.data?.message ||
          error.message ||
          "EMS email deletion failed",
        { cause: error },
      );
    }
  };

  const confirmDelete = (id, name) => {
    toast(
      ({ closeToast }) => (
        <div className="w-full">
          <p className="font-semibold text-gray-800 mb-2">Delete User?</p>

          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete "{name}"?
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeToast}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                closeToast();
                handleDelete(id, name);
              }}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim() ||
      !formData.contact_number.trim() ||
      !formData.role_id
    ) {
      setMessage({
        type: "error",
        text: "First name, last name, email, contact number, and role are required",
      });
      return;
    }

    if (!editingId) {
      if (!formData.password) {
        toast.error("Password is required");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      let hashedPassword = null;

      if (!editingId) {
        hashedPassword = await bcrypt.hash(formData.password, 10);
      }

      const payload = {
        role_id: formData.role_id || null,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        contact_number: formData.contact_number || null,
        email: formData.email.trim(),
        is_active: formData.is_active,
      };
      if (!editingId) {
        payload.password = hashedPassword;
      }

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const dateandtime = new Date().toISOString();

      const EMSPayload = {
        createdat: dateandtime,

        department_id: {
          code: "",
          createdat: dateandtime,
          id: formData.department_id,
          name: "",
          status: "",
          updatedat: dateandtime,
        },

        displayName: formData.display_name,

        dob: formData.date_of_birth
          ? `${formData.date_of_birth}T00:00:00.000Z`
          : null,

        first_name: formData.first_name.trim(),

        gender: formData.gender,

        last_name: formData.last_name.trim(),

        member_code: formData.user_code,

        passwordhash: hashedPassword,

        preferredLanguage: formData.preferred_language,

        status: formData.is_active ? "active" : "inactive",

        timezone: timeZone,

        updateat: dateandtime,
      };

      const EMS_Members_phone_payload = {
        createdat: dateandtime,
        is_primary: formData.is_primary ? 1 : 0,
        is_sms_enabled: formData.is_sms_enabled ? 1 : 0,
        is_voice_enabled: formData.is_voice_enabled ? 1 : 0,
        is_whatsapp_enabled: formData.is_whatsapp_enabled ? 1 : 0,
        member_id: {
          createdat: dateandtime,
          department_id: {
            code: "",
            createdat: dateandtime,
            id: formData.department_id,
            name: "",
            status: "active",
            updatedat: dateandtime,
          },
          displayName: formData.display_name,
          dob: formData.date_of_birth
            ? `${formData.date_of_birth}T00:00:00.000Z`
            : null,
          first_name: formData.first_name.trim(),
          gender: formData.gender,
          id: "",
          last_name: formData.last_name.trim(),
          member_code: formData.user_code,
          passwordhash: "",
          preferredLanguage: formData.preferred_language,
          status: "active",
          timezone: "",
          updateat: dateandtime,
        },
        phone_number: formData.contact_number,
        phone_type: formData.phone_type,
        status: "active",
        updatedat: dateandtime,
      };

      const EMS_Members_email_payload = {
        createdat: dateandtime,
        email: formData.email.trim(),
        is_primary: formData.is_primary_email ? 1 : 0,
        member_id: {
          createdat: dateandtime,
          department_id: {
            code: "",
            createdat: dateandtime,
            id: formData.department_id,
            name: "",
            status: "active",
            updatedat: dateandtime,
          },
          displayName: formData.display_name,
          dob: formData.date_of_birth
            ? `${formData.date_of_birth}T00:00:00.000Z`
            : null,
          first_name: formData.first_name.trim(),
          gender: formData.gender,
          id: "",
          last_name: formData.last_name.trim(),
          member_code: formData.user_code,
          passwordhash: "",
          preferredLanguage: formData.preferred_language,
          status: "active",
          timezone: "",
          updateat: dateandtime,
        },
        status: "active",
        updatedat: dateandtime,
      };

      if (editingId) {
        try {
          console.log("Updating employee...");
          // ==========================================
          // MEMBER UPDATE PAYLOAD
          // ==========================================

          const EMSUpdatePayload = {
            createdat: emsEditData.member.createdat,

            department_id: {
              ...emsEditData.member.department_id,
              id: formData.department_id,
            },

            displayName: formData.display_name,

            dob: formData.date_of_birth
              ? `${formData.date_of_birth}T00:00:00.000Z`
              : null,

            first_name: formData.first_name.trim(),

            gender: formData.gender,

            id: emsEditData.member.id,

            last_name: formData.last_name.trim(),

            member_code: formData.user_code,

            // KEEP EXISTING PASSWORD
            passwordhash: emsEditData.member.passwordhash,

            preferredLanguage: formData.preferred_language,

            status: formData.is_active ? "active" : "inactive",

            timezone: timeZone,

            updateat: dateandtime,
          };

          // ==========================================
          // PHONE UPDATE PAYLOAD
          // ==========================================

          const EMSPhoneUpdatePayload = {
            createdat: emsEditData.phone.createdat,

            id: emsEditData.phone.id,

            is_primary: formData.is_primary ? 1 : 0,

            is_sms_enabled: formData.is_sms_enabled ? 1 : 0,

            is_voice_enabled: formData.is_voice_enabled ? 1 : 0,

            is_whatsapp_enabled: formData.is_whatsapp_enabled ? 1 : 0,

            member_id: {
              ...emsEditData.phone.member_id,

              id: emsEditData.member.id,

              department_id: {
                ...emsEditData.phone.member_id.department_id,
                id: formData.department_id,
              },

              displayName: formData.display_name,

              dob: formData.date_of_birth
                ? `${formData.date_of_birth}T00:00:00.000Z`
                : null,

              first_name: formData.first_name.trim(),

              gender: formData.gender,

              last_name: formData.last_name.trim(),

              member_code: formData.user_code,

              preferredLanguage: formData.preferred_language,

              status: formData.is_active ? "active" : "inactive",

              timezone: formData.timezone,

              updateat: dateandtime,
            },

            phone_number: formData.contact_number,

            phone_type: formData.phone_type,

            status: formData.is_active ? "active" : "inactive",

            updatedat: dateandtime,
          };

          // ==========================================
          // EMAIL UPDATE PAYLOAD
          // ==========================================

          const EMSEmailUpdatePayload = {
            createdat: emsEditData.email.createdat,

            email: formData.email.trim(),

            id: emsEditData.email.id,

            is_primary: formData.is_primary_email ? 1 : 0,

            member_id: {
              ...emsEditData.email.member_id,

              id: emsEditData.member.id,

              department_id: {
                ...emsEditData.email.member_id.department_id,
                id: formData.department_id,
              },

              displayName: formData.display_name,

              dob: formData.date_of_birth
                ? `${formData.date_of_birth}T00:00:00.000Z`
                : null,

              first_name: formData.first_name.trim(),

              gender: formData.gender,

              last_name: formData.last_name.trim(),

              member_code: formData.user_code,

              preferredLanguage: formData.preferred_language,

              status: formData.is_active ? "active" : "inactive",

              timezone: timeZone,

              updateat: dateandtime,
            },

            status: formData.is_active ? "active" : "inactive",

            updatedat: dateandtime,
          };

          // ==========================================
          // STEP 1
          // UPDATE EMS MEMBER
          // ==========================================

          console.log("STEP 1: Updating EMS Member...");

          await updateEMSMember(emsEditData.member.id, EMSUpdatePayload);

          console.log("STEP 1 SUCCESS: EMS Member updated");

          // ==========================================
          // STEP 2
          // UPDATE EMS PHONE
          // ==========================================

          console.log("STEP 2: Updating EMS Phone...");

          await updateEMSMemberPhone(
            emsEditData.phone.id,
            EMSPhoneUpdatePayload,
          );

          console.log("STEP 2 SUCCESS: EMS Phone updated");

          // ==========================================
          // STEP 3
          // UPDATE EMS EMAIL
          // ==========================================

          console.log("STEP 3: Updating EMS Email...");

          await updateEMSMemberEmail(
            emsEditData.email.id,
            EMSEmailUpdatePayload,
          );

          console.log("STEP 3 SUCCESS: EMS Email updated");

          // ==========================================
          // STEP 4
          // UPDATE LOCAL DATABASE
          // ==========================================

          console.log("STEP 4: Updating local employee...");

          const response = await axios.put(
            `${employeesApi}/${editingId}`,
            payload,
            getAuthConfig(),
          );

          if (response.status >= 200 && response.status < 300) {
            console.log("STEP 4 SUCCESS: Local employee updated");

            setMessage({
              type: "success",
              text: response.data?.message || "User updated successfully",
            });

            toast.success(
              response.data?.message || "User updated successfully",
            );
          }
        } catch (error) {
          console.error("Employee update sequence failed:", error);

          toast.error(error.message || "Employee update failed");

          return;
        }
      } else {
        try {
          // =====================================================
          // STEP 1: CREATE EMS MEMBER
          // =====================================================

          console.log("STEP 1: Creating EMS member...");

          const emsMember = await createEMSMember(EMSPayload);

          console.log("EMS member created successfully:", emsMember);

          // Make sure EMS generated ID exists

          if (!emsMember?.id) {
            throw new Error(
              "EMS member ID was not returned after member creation",
            );

            // ==========================================
            // GET EMPLOYEE FROM LOCAL LIST
            // ==========================================
          }

          // =====================================================
          // STEP 2: CREATE EMS PHONE
          // =====================================================

          console.log("STEP 2: Creating EMS phone...");

          const phonePayload = {
            ...EMS_Members_phone_payload,

            member_id: {
              ...EMS_Members_phone_payload.member_id,
              id: emsMember.id,
            },
          };

          const phoneResponse = await createEMSMemberPhone(phonePayload);

          console.log("EMS phone created successfully:", phoneResponse);

          // =====================================================
          // STEP 3: CREATE EMS EMAIL
          // =====================================================

          console.log("STEP 3: Creating EMS email...");

          const emailPayload = {
            ...EMS_Members_email_payload,

            member_id: {
              ...EMS_Members_email_payload.member_id,
              id: emsMember.id,
            },
          };

          const emailResponse = await createEMSMemberEmail(emailPayload);

          console.log("EMS email created successfully:", emailResponse);

          //   making member as admin
          const adminPayload = {
            member_id: {
              department_id: {
                id: formData.department_id,
              },
              id: emsMember.id,
            },
            passwordhash: await sha256(formData.email + formData.password),
            status: "active",
            updatedat: dateandtime,
            username: formData.display_name,
          };
          console.log(adminPayload);

          const adminResponse = await makeMemberAsAdmin(adminPayload);
          console.log(adminResponse);

          const adminRolePayload = {
            admin_id: {
              id: adminResponse?.id,
              member_id: {
                id: emsMember.id,
              },
            },
            role: formData.role,
          };
          const adminRoleResponse = await assignRoleToAdmin(adminRolePayload);
          console.log(adminRoleResponse);

          // =====================================================
          // STEP 4: ONLY NOW CREATE LOCAL EMPLOYEE
          // =====================================================

          console.log("STEP 4: Creating employee in local database...");

          const localPayload = {
            ...payload,

            member_id: emsMember.id,

            member_code: emsMember.member_code,
          };

          const response = await axios.post(
            `${employeesApi}/register`,
            {
              payload: localPayload,
            },
            {
              ...getAuthConfig(),
            },
          );

          if (response.status >= 200 && response.status < 300) {
            setMessage({
              type: "success",
              text: response.data?.message || "User registered successfully",
            });

            toast.success(
              response.data?.message || "User registered successfully",
            );
          }
        } catch (error) {
          console.error("Employee registration process failed:", error);

          toast.error(error.message || "Employee registration failed");

          return;
        }
      }

      resetForm();
      setShowAddUserModal(false);

      await fetchEmployees();
      //   await fetchStats();
    } catch (err) {
      console.error("Employee save error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save user";

      setMessage({
        type: "error",
        text: errorMessage,
      });

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (employee) => {
    try {
      setSaving(true);

      console.log("Editing employee:", employee);

      // ============================================
      // LOCAL EMPLOYEE ID
      // ============================================

      const localEmployeeId = employee.id;

      // ============================================
      // EMS MEMBER ID
      // ============================================

      const memberId = employee.member_id;

      console.log("Local ID:", localEmployeeId);
      console.log("EMS Member ID:", memberId);

      if (!memberId) {
        toast.error("EMS member ID not found for this employee");
        return;
      }

      setEditingId(localEmployeeId);
      setSelectedEmployee(employee);

      // ============================================
      // FETCH ALL THREE EMS APIs
      // ============================================

      console.log("Fetching EMS member, phone and email...");

      const [emsMember, phoneResponse, emailResponse] = await Promise.all([
        fetchEMSMember(memberId),
        fetchEMSMemberPhone(memberId),
        fetchEMSMemberEmail(memberId),
      ]);

      console.log("EMS Member Response:", emsMember);

      console.log("EMS Phone Response:", phoneResponse);

      console.log("EMS Email Response:", emailResponse);

      // ============================================
      // GET PHONE DATA
      // ============================================

      const phoneData = phoneResponse?.members_phones?.[0];

      if (!phoneData) {
        throw new Error("EMS phone data not found");
      }

      // ============================================
      // GET EMAIL DATA
      // ============================================

      const emailData = emailResponse?.members_emails?.[0];

      if (!emailData) {
        throw new Error("EMS email data not found");
      }

      console.log("Phone Data:", phoneData);

      console.log("Email Data:", emailData);

      setEmsEditData({
        member: emsMember,
        phone: phoneData,
        email: emailData,
      });

      // ============================================
      // FILL FORM DATA
      // ============================================

      setFormData({
        // ==========================================
        // LOCAL EMPLOYEE DATA
        // ==========================================

        role_id: employee.role_id ? String(employee.role_id) : "",

        is_active: employee.is_active ?? true,

        // ==========================================
        // EMS MEMBER DATA
        // ==========================================

        first_name: emsMember?.first_name || employee.first_name || "",

        last_name: emsMember?.last_name || employee.last_name || "",

        display_name: emsMember?.displayName || "",

        date_of_birth: emsMember?.dob ? emsMember.dob.substring(0, 10) : "",

        gender: emsMember?.gender || "",

        department_id: emsMember?.department_id?.id
          ? String(emsMember.department_id.id)
          : "",

        preferred_language: emsMember?.preferredLanguage || "",

        timezone: emsMember?.timezone || "",

        user_code: emsMember?.member_code || employee.member_code || "",

        // ==========================================
        // PHONE DATA
        // ==========================================

        contact_number:
          phoneData?.phone_number || employee.contact_number || "",

        phone_type: phoneData?.phone_type || "",

        is_primary: Number(phoneData?.is_primary) === 1,

        is_sms_enabled: Number(phoneData?.is_sms_enabled) === 1,

        is_voice_enabled: Number(phoneData?.is_voice_enabled) === 1,

        is_whatsapp_enabled: Number(phoneData?.is_whatsapp_enabled) === 1,

        // ==========================================
        // EMAIL DATA
        // ==========================================

        email: emailData?.email || employee.email || "",

        is_primary_email: Number(emailData?.is_primary) === 1,

        // ==========================================
        // PASSWORD
        // ==========================================

        password: "",
        confirmPassword: "",
      });

      // ============================================
      // OPEN FORM
      // ============================================

      setShowAddUserModal(true);
    } catch (error) {
      console.error("Error loading employee details:", error);

      toast.error(error.message || "Failed to load employee details");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    try {
      setDeletingId(id);

      console.log("Deleting employee:", id, name);

      // ==========================================
      // GET EMPLOYEE FROM LOCAL LIST
      // ==========================================

      const employee = employees.find((emp) => emp.id === id);

      if (!employee) {
        throw new Error("Employee data not found");
      }

      console.log("Employee selected for deletion:", employee);

      // ==========================================
      // GET EMS MEMBER ID
      // ==========================================

      const memberId = employee.member_id;

      if (!memberId) {
        throw new Error("EMS member ID not found for this employee");
      }

      console.log("EMS Member ID:", memberId);

      // ==========================================
      // GET PHONE + EMAIL DATA
      // ==========================================

      console.log("Fetching EMS phone and email before deletion...");

      const [phoneResponse, emailResponse] = await Promise.all([
        fetchEMSMemberPhone(memberId),
        fetchEMSMemberEmail(memberId),
      ]);

      // ==========================================
      // EXTRACT PHONE
      // ==========================================

      const phoneData = phoneResponse?.members_phones?.[0];

      if (!phoneData) {
        throw new Error("EMS phone data not found");
      }

      // ==========================================
      // EXTRACT EMAIL
      // ==========================================

      const emailData = emailResponse?.members_emails?.[0];

      if (!emailData) {
        throw new Error("EMS email data not found");
      }

      console.log("EMS Phone:", phoneData);

      console.log("EMS Email:", emailData);

      // ==========================================
      // STEP 1
      // DELETE EMS PHONE
      // ==========================================

      console.log("STEP 1: Deleting EMS Phone...");

      await deleteEMSMemberPhone(phoneData.id);

      console.log("STEP 1 SUCCESS: EMS Phone deleted");

      // ==========================================
      // STEP 2
      // DELETE EMS EMAIL
      // ==========================================

      console.log("STEP 2: Deleting EMS Email...");

      await deleteEMSMemberEmail(emailData.id);

      console.log("STEP 2 SUCCESS: EMS Email deleted");

      // ==========================================
      // STEP 3
      // DELETE EMS MEMBER
      // ==========================================

      console.log("STEP 3: Deleting EMS Member...");

      await deleteEMSMember(memberId);

      console.log("STEP 3 SUCCESS: EMS Member deleted");

      // ==========================================
      // STEP 4
      // DELETE LOCAL EMPLOYEE
      // ==========================================

      console.log("STEP 4: Deleting local employee...");

      const response = await axios.delete(
        `${employeesApi}/${id}`,
        getAuthConfig(),
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("STEP 4 SUCCESS: Local employee deleted");

        toast.success(response.data?.message || "User deleted successfully");

        await fetchEmployees();
        // await fetchStats();
      }
    } catch (error) {
      console.error("Employee deletion sequence failed:", error);

      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (employee) => {
    try {
      setTogglingId(employee.id);
      const action = employee.is_active ? "deactivate" : "activate";
      await axios.patch(
        `${employeesApi}/${employee.id}/${action}`,
        {},
        getAuthConfig(),
      );
      setMessage({ type: "success", text: `User ${action}d successfully` });
      await fetchEmployees();
      //   await fetchStats();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update status",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleResetPassword = async (id, name) => {
    if (!window.confirm(`Reset password for "${name}" to default "welcome"?`))
      return;

    try {
      setResettingId(id);
      const response = await axios.post(
        `${employeesApi}/${id}/reset-password`,
        {},
        getAuthConfig(),
      );
      setMessage({ type: "success", text: response.data.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to reset password",
      });
    } finally {
      setResettingId(null);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.current_password || !passwordData.new_password) {
      setMessage({ type: "error", text: "Both passwords are required" });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      return;
    }

    try {
      await axios.post(
        `${employeesApi}/${passwordAction.id}/change-password`,
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        },
        getAuthConfig(),
      );
      setMessage({ type: "success", text: "Password changed successfully" });
      setShowPasswordModal(false);
      setPasswordData({ current_password: "", new_password: "" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password",
      });
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : "No Role";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="rounded-2xl bg-gradient-to-r from-[#0B1D3A] via-[#132D5E] to-[#1A3A6E] p-8 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-300" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                    User Management
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-2">User Management</h1>
                <p className="text-blue-100 max-w-2xl">
                  Manage user records, roles, and account settings
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">
                    {stats.total_employees}
                  </div>
                  <div className="text-xs text-blue-200 mt-1">Total</div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <UserCheck className="w-5 h-5 mb-2 text-green-300" />
                  <div className="text-2xl font-bold">
                    {stats.active_employees}
                  </div>
                  <div className="text-xs text-blue-200 mt-1">Active</div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <UserX className="w-5 h-5 mb-2 text-gray-300" />
                  <div className="text-2xl font-bold">
                    {stats.inactive_employees}
                  </div>
                  <div className="text-xs text-blue-200 mt-1">Inactive</div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <Briefcase className="w-5 h-5 mb-2 text-yellow-300" />
                  <div className="text-2xl font-bold">
                    {stats.roles_occupied}
                  </div>
                  <div className="text-xs text-blue-200 mt-1">Roles</div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <CalendarIcon className="w-5 h-5 mb-2 text-purple-300" />
                  <div className="text-2xl font-bold">
                    {stats.joined_this_month}
                  </div>
                  <div className="text-xs text-blue-200 mt-1">New (Month)</div>
                </div>
              </div>
            </div>
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

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          current_password: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          new_password: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-[#0B1D3A] text-white rounded-lg py-2 hover:bg-[#132D5E] transition-colors"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Form Section - Section Wise Layout */}
        {showAddUserModal && (
          // Modal Overlay Background
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => {
              resetForm();
              setShowAddUserModal(false);
            }}
          >
            {/* Modal Content Container */}
            <div
              // Changed to w-[80vw] and h-[80vh] to cover 80% of the screen
              className="bg-white rounded-2xl shadow-xl border border-[#0B1D3A] w-[80vw] h-[80vh] max-w-[95vw] max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-[#0B1D3A] px-6 py-5 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingId ? "Edit User" : "Add New User"}
                  </h2>
                  <p className="text-sm text-white mt-1">
                    {editingId
                      ? "Update user information and account details"
                      : "Enter user information and account details"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddUserModal(false);
                  }}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-8">
                  {/* =====================================================
                    PERSONAL INFORMATION
                ====================================================== */}
                  <section>
                    <div className="flex items-center gap-3 mb-5">
                      <h3 className="text-sm font-bold text-[#0B1D3A] uppercase tracking-wider whitespace-nowrap">
                        Personal Information
                      </h3>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="display_name"
                          value={formData.display_name}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* =====================================================
                    USER LEVEL
                ====================================================== */}
                  <section className="border-t border-gray-200 pt-7">
                    <div className="flex items-center gap-3 mb-5">
                      <h3 className="text-sm font-bold text-[#0B1D3A] uppercase tracking-wider whitespace-nowrap">
                        User Level
                      </h3>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          User Role <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleInputChange}
                            className="w-full appearance-none pl-10 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                            required
                          >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            name="department_id"
                            value={formData.department_id}
                            onChange={handleInputChange}
                            className="w-full appearance-none pl-10 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                            required
                          >
                            <option value="">Select Department</option>
                            {departments.map((department) => (
                              <option key={department.id} value={department.id}>
                                {department.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          User Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="user_code"
                          value={formData.user_code}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </section>
                  {/* =====================================================
    CONTACT INFORMATION
===================================================== */}

                  <section className="border-t border-gray-200 pt-7">
                    <div className="flex items-center gap-3 mb-5">
                      <h3 className="text-sm font-bold text-[#0B1D3A] uppercase tracking-wider whitespace-nowrap">
                        Contact Information
                      </h3>

                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* =====================================================
      CONTACT NUMBER + TYPE
  ====================================================== */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contact Number */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number
                          <span className="text-red-500"> *</span>
                        </label>

                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                          <input
                            type="tel"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleInputChange}
                            placeholder="Enter contact number"
                            className="w-full pl-10 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all"
                            required
                          />
                        </div>
                      </div>

                      {/* Contact Number Type */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number Type
                          <span className="text-red-500"> *</span>
                        </label>

                        <div className="flex flex-wrap gap-2">
                          {[
                            {
                              value: "mobile",
                              label: "Mobile",
                            },
                            {
                              value: "home",
                              label: "Home",
                            },
                            {
                              value: "work",
                              label: "Work",
                            },
                            {
                              value: "other",
                              label: "Other",
                            },
                          ].map((type) => (
                            <label
                              key={type.value}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                                formData.phone_type === type.value
                                  ? "border-[#0B1D3A] bg-blue-50 text-[#0B1D3A]"
                                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="phone_type"
                                value={type.value}
                                checked={formData.phone_type === type.value}
                                onChange={handleInputChange}
                                className="w-4 h-4 accent-[#0B1D3A]"
                                required
                              />

                              <span className="text-sm font-medium">
                                {type.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* =====================================================
      COMMUNICATION PREFERENCES
  ====================================================== */}

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Communication Preferences
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Is Primary */}

                        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Is Primary?
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              Set this as the primary contact number
                            </p>
                          </div>

                          <div className="flex items-center rounded-lg border border-gray-300 bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_primary: true,
                                }))
                              }
                              className={`px-4 py-1.5 text-sm font-medium transition-all ${
                                formData.is_primary
                                  ? "bg-[#0B1D3A] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              Yes
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_primary: false,
                                }))
                              }
                              className={`px-4 py-1.5 text-sm font-medium transition-all ${
                                !formData.is_primary
                                  ? "bg-[#0B1D3A] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>

                        {/* SMS Enabled */}

                        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              SMS Enabled?
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              Allow SMS notifications
                            </p>
                          </div>

                          <div className="flex items-center rounded-lg border border-gray-300 bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_sms_enabled: true,
                                }))
                              }
                              className={`px-4 py-1.5 text-sm font-medium transition-all ${
                                formData.is_sms_enabled
                                  ? "bg-[#0B1D3A] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              Yes
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_sms_enabled: false,
                                }))
                              }
                              className={`px-4 py-1.5 text-sm font-medium transition-all ${
                                !formData.is_sms_enabled
                                  ? "bg-[#0B1D3A] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>

                        {/* Voice Enabled */}

                        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Voice Enabled?
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              Allow voice calls
                            </p>
                          </div>

                          <div className="flex items-center rounded-lg border border-gray-300 bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_voice_enabled: true,
                                }))
                              }
                              className={`px-4 py-1.5 text-sm font-medium transition-all ${
                                formData.is_voice_enabled
                                  ? "bg-[#0B1D3A] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              Yes
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_voice_enabled: false,
                                }))
                              }
                              className={`px-4 py-1.5 text-sm font-medium transition-all ${
                                !formData.is_voice_enabled
                                  ? "bg-[#0B1D3A] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>

                        {/* WhatsApp Enabled */}

                        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              WhatsApp Enabled?
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              Allow WhatsApp messages
                            </p>
                          </div>

                          <div className="flex items-center rounded-lg border border-gray-300 bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_whatsapp_enabled: true,
                                }))
                              }
                              className={`px-4 py-1.5 text-sm font-medium transition-all ${
                                formData.is_whatsapp_enabled
                                  ? "bg-[#0B1D3A] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              Yes
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_whatsapp_enabled: false,
                                }))
                              }
                              className={`px-4 py-1.5 text-sm font-medium transition-all ${
                                !formData.is_whatsapp_enabled
                                  ? "bg-[#0B1D3A] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =====================================================
      EMAIL
  ====================================================== */}

                    <div className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                            <span className="text-red-500"> *</span>
                          </label>

                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter email address"
                              className="w-full pl-10 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all"
                              required
                            />
                          </div>
                        </div>

                        {/* Primary Email */}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Is this your primary email address?
                            <span className="text-red-500"> *</span>
                          </label>

                          <div className="flex items-center rounded-lg border border-gray-300 bg-white overflow-hidden w-fit">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_primary_email: true,
                                }))
                              }
                              className={`px-5 py-2 text-sm font-medium transition-all ${
                                formData.is_primary_email
                                  ? "bg-[#0B1D3A] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              Yes
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_primary_email: false,
                                }))
                              }
                              className={`px-5 py-2 text-sm font-medium transition-all ${
                                !formData.is_primary_email
                                  ? "bg-[#0B1D3A] text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* =====================================================
                    PREFERENCES
                ====================================================== */}
                  <section className="border-t border-gray-200 pt-7">
                    <div className="flex items-center gap-3 mb-5">
                      <h3 className="text-sm font-bold text-[#0B1D3A] uppercase tracking-wider whitespace-nowrap">
                        Preferences
                      </h3>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Language{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="preferred_language"
                          value={formData.preferred_language}
                          onChange={handleInputChange}
                          className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                          required
                        >
                          <option value="">Select Language</option>
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="zh">Chinese</option>
                          <option value="ja">Japanese</option>
                          <option value="ko">Korean</option>
                          <option value="pt">Portuguese</option>
                          <option value="ru">Russian</option>
                        </select>
                      </div>

                      {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <input
                        type="text"
                        value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                        readOnly
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600 focus:outline-none"
                      />
                    </div> */}
                    </div>
                  </section>

                  {/* =====================================================
                    ACCOUNT SECURITY
                ====================================================== */}
                  <section className="border-t border-gray-200 pt-7">
                    <div className="flex items-center gap-3 mb-5">
                      <h3 className="text-sm font-bold text-[#0B1D3A] uppercase tracking-wider whitespace-nowrap">
                        Account Security
                      </h3>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      {!editingId && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                              <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter password"
                                className="w-full pl-10 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all"
                                required={!editingId}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm Password{" "}
                              <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                              <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm password"
                                className="w-full pl-10 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0B1D3A] focus:ring-2 focus:ring-blue-100 transition-all"
                                required={!editingId}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="lg:col-span-2 flex items-center gap-3 min-h-[42px]">
                        <label
                          htmlFor="is_active"
                          className="relative inline-flex items-center cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B1D3A]" />
                        </label>
                        <span className="text-sm font-medium text-gray-700">
                          {formData.is_active
                            ? "Active Account"
                            : "Inactive Account"}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#0B1D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#132D5E] transition-all disabled:opacity-50 flex items-center gap-2"
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
                          <UserPlus className="w-4 h-4" />
                        )}
                        {editingId ? "Update User" : "Register User"}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowAddUserModal(false);
                    }}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex align-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    User Directory
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage and monitor all users in the system
                  </p>
                </div>
              </div>
              {/* Add button */}
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1D3A] text-white text-sm font-semibold hover:bg-[#132D5E] transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            <div
              className={`mt-4 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#0B1D3A] focus:ring-1 focus:ring-blue-100"
                  />
                </div>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#0B1D3A] focus:ring-1 focus:ring-blue-100 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={filters.role_id}
                  onChange={(e) =>
                    handleFilterChange("role_id", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#0B1D3A] focus:ring-1 focus:ring-blue-100 bg-white"
                >
                  <option value="">All Roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-[#0B1D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#132D5E] transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader className="w-8 h-8 animate-spin text-[#0B1D3A]" />
                <p className="mt-3 text-gray-500">Loading users...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-gray-50 rounded-full p-4 mb-4">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No users found
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {Object.values(filters).some((v) => v)
                    ? "Try adjusting your filters"
                    : "Add your first user to get started"}
                </p>
                {Object.values(filters).some((v) => v) && (
                  <button
                    onClick={resetFilters}
                    className="text-[#0B1D3A] text-sm font-semibold hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {currentItems.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B1D3A] to-[#1A3A6E] flex items-center justify-center text-white font-semibold text-sm">
                            {employee.first_name[0]}
                            {employee.last_name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {employee.contact_number || "-"}
                        </p>
                        {employee.address?.city && (
                          <p className="text-xs text-gray-400">
                            {employee.address.city}, {employee.address.country}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                          <Briefcase className="w-3 h-3" />
                          {employee.role_name || "No Role"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            employee.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {employee.is_active ? (
                            <Activity className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {employee.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-2 text-gray-600 hover:text-[#0B1D3A] hover:bg-gray-100 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* <button
                              onClick={() => {
                                setPasswordAction(employee);
                                setShowPasswordModal(true);
                              }}
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                              title="Change Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(employee.id, `${employee.first_name} ${employee.last_name}`)}
                              disabled={resettingId === employee.id}
                              className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all disabled:opacity-50"
                              title="Reset to Default Password"
                            >
                              {resettingId === employee.id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </button> */}
                          {/* <button
                              onClick={() => handleToggleStatus(employee)}
                              disabled={togglingId === employee.id}
                              className={`p-2 rounded-lg transition-all disabled:opacity-50 ${employee.is_active
                                ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                }`}
                              title={employee.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {togglingId === employee.id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </button> */}
                          <button
                            onClick={() =>
                              confirmDelete(
                                employee.id,
                                `${employee.first_name} ${employee.last_name}`,
                              )
                            }
                            disabled={deletingId === employee.id}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === employee.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && employees.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, employees.length)} of{" "}
                {employees.length} users
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
                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
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
      </div>
    </div>
  );
}

export default Employees;
