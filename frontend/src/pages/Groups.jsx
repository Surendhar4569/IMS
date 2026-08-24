import { useEffect, useState } from "react";
import vgtAPI from "../utils/axiosConfig";
import {
  CheckCircle,
  Edit2,
  Loader,
  Loader2,
  LoaderCircle,
  Plus,
  Power,
  Search,
  Trash2,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

function Groups() {
  const [groups, setGroups] = useState([]);
  //   filter by group name or group code
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    status: "active", // Default status
  });

  //group admin state
  const [groupAdminId, setGroupAdminId] = useState("");
  const [selectedGroupAdmin, setSelectedGroupAdmin] = useState(null);

  const [editingId, setEditingId] = useState(null);

  //admin state
  const [admins, setAdmins] = useState([]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      status: "active",
    });

    setGroupAdminId("");
    setSelectedGroupAdmin(null);
  };

  const handleEdit = async (group) => {
    // console.log(group);

    setEditingId(group.id);

    setFormData({
      name: group.name || "",
      code: group.code || "",
      description: group.description || "",
      status: group.status || "active",

      createdby_admin_id: {
        id: group.createdby_admin_id?.id || "",
      },
    });

    // calling fetchAdminGroupsByGroupId for edit
    await fetchAdminGroupsByGroupId(group.id);
    setIsModalOpen(true);
  };

  //API call
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let response;
    try {
      if (editingId) {
        // console.log(formData);
        // console.log(selectedGroupAdmin);
        // console.log(groupAdminId);

        response = await vgtAPI.put(`/groups/${editingId}`, formData);
        // console.log("group update response" , response.data);

        // if the group admin changes, update admin groups
        if (groupAdminId !== selectedGroupAdmin?.admin_id?.id) {
          // Admin Groups Payload
          const payload = {
            admin_id: {
              id: groupAdminId,
            },
            group_id: {
              id: editingId,
            },
          };

          let res = await vgtAPI.put(
            `/admins_groups/${selectedGroupAdmin.id}`,
            payload,
          );
          // console.log("admin res" , res.data);
        }
      } else {
        // console.log(formData);
        // console.log(groupAdminId);

        response = await vgtAPI.post("/groups/", formData);
        // console.log(
        //   "API Call Successful! Response Data:",
        //   response.data.groups[0].id,
        // );

        // Log the data as requested
        // console.log("API Call Successful! Response Data:", response.data);

        // Admin Groups Payload
        const adminGroupsPayload = {
          admin_id: {
            id: groupAdminId,
          },
          group_id: {
            id: response.data.groups[0].id,
          },
        };

        const adminGroupResponse = await vgtAPI.post(
          "/admins_groups/",
          adminGroupsPayload,
        );
        // console.log(adminGroupResponse);
      }

      fetchGroups();
      // Close modal and reset form on success
      resetForm();
      setIsModalOpen(false);

      toast.success(
        response?.data?.error_response?.error_message ||
          `Group ${editingId ? "Updated" : "Created"} successfully`,
      );

      setEditingId(null);
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  //get admin groups by group Id
  const fetchAdminGroupsByGroupId = async (group_id) => {
    try {
      setLoading(true);
      const response = await vgtAPI.get("/admins_groups/", {
        params: {
          query: `group_id:${group_id}`,
        },
      });
      // console.log(response.data);
      let adminGroups = response.data.admins_groups;
      setGroupAdminId(adminGroups ? adminGroups[0].admin_id.id : "");
      setSelectedGroupAdmin(adminGroups ? adminGroups[0] : null);
    } catch (err) {
      console.error("Error fetching Admin Groups:", err);
    } finally {
      setLoading(false);
    }
  };

  // handle delete group
  const handleDelete = async (group) => {
    setLoading(true);
    try {
      const response = await vgtAPI.delete(`/groups/${group.id}`);

      //   console.log("Delete response:", response.data);

      // Remove deleted group from existing state
      setGroups((prev) => prev.filter((item) => item.id !== group.id));
    } catch (error) {
      console.error(
        "Failed to delete group:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  //fetch groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await vgtAPI.get("/groups/");
      // console.log(response.data);
      setGroups(response.data.groups);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  //fetch admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await vgtAPI.get("/admins/");
      // console.log(response.data.admins);
      setAdmins(response.data.admins);
    } catch (err) {
      console.error("Error fetching Admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchAdmins();
  }, []);

  //   Stats
  const activeGroups = groups.filter(
    (group) => group.status === "active",
  ).length;

  const inactiveGroups = groups.filter(
    (group) => group.status === "inactive",
  ).length;

  //   filter by group name or group code
  const filterGroups = () => {
    if (!filter.trim()) {
      return groups;
    }

    const search = filter.trim().toLowerCase();

    return groups.filter(
      (group) =>
        group.name?.toLowerCase().includes(search) ||
        group.code?.toLowerCase().includes(search),
    );
  };
  const filteredGroups = filterGroups();

  if (loading || isSubmitting) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center py-16">
        <Loader className="w-8 h-8 animate-spin text-[#0B1D3A]" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="rounded-2xl bg-gradient-to-r from-[#0B1D3A] via-[#132D5E] to-[#1A3A6E] p-6 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UsersRound className="w-5 h-5 text-blue-300" />

                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                    Group Management
                  </span>
                </div>

                <h1 className="text-3xl font-bold">Groups</h1>

                <p className="text-blue-100 mt-1">Manage and organize groups</p>
              </div>

              {/* Statistics */}

              <div className="grid grid-cols-3 gap-4 min-w-[400px]">
                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{groups.length}</div>

                  <div className="text-xs text-blue-200 mt-1">Total</div>
                </div>

                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-green-300">
                    {activeGroups}
                  </div>

                  <div className="text-xs text-blue-200 mt-1">Active</div>
                </div>

                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-gray-300">
                    {inactiveGroups}
                  </div>

                  <div className="text-xs text-blue-200 mt-1">Inactive</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Search & Actions */}

          <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search groups..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A] transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1D3A] text-white text-sm font-semibold hover:bg-[#132D5E] transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Group
              </button>
            </div>
          </div>

          {/*TABLE CONTENT */}
          <div className="overflow-x-auto">
            {loading && groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader className="w-8 h-8 animate-spin text-[#0B1D3A]" />

                <p className="mt-3 text-gray-500">Loading groups...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-gray-50 rounded-full p-4 mb-4">
                  <UsersRound className="w-12 h-12 text-gray-400" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No groups found
                </h3>

                <p className="text-gray-500 text-sm mb-4">
                  {filter
                    ? "Try adjusting your search query"
                    : "Add your first group to get started"}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Id
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Group Name
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Code
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Created By
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredGroups.map((group) => {
                    const isActive = group.status === "active";

                    return (
                      <tr
                        key={group.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* ID */}
                        <td className="px-6 py-4">{group.id}</td>

                        {/* group */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-gray-900">
                              {group.name}
                            </p>
                          </div>
                        </td>

                        {/* ID */}
                        <td className="px-6 py-4">{group.code}</td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isActive ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}

                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* created by admin */}
                        <td className="px-6 py-4">
                          {group.createdby_admin_id.username || "NA"}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() => handleEdit(group)}
                              className="p-2 text-gray-600 hover:text-[#0B1D3A] hover:bg-gray-100 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* DELETE */}
                            <button
                              type="button"
                              onClick={() => handleDelete(group)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal Overlay & Container */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#0B1D3A]">
              <h2 className="text-lg font-semibold text-white">
                Create New Group
              </h2>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsModalOpen(false);
                }}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateGroup} className="p-6 space-y-5">
              {/* Name & Code Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter group name"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter group code"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent transition-all"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Admins Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Admin <span className="text-red-500">*</span>
                </label>
                <select
                  name="group_admin_id"
                  value={groupAdminId}
                  onChange={(e) => setGroupAdminId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Group Admin</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter group description (optional)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Modal Footer / Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-lg text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-all border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1D3A] text-white text-sm font-semibold hover:bg-[#132D5E] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      `${editingId ? "Updating..." : "Creating..."}`
                    </>
                  ) : (
                    `${editingId ? "Update Group" : "Create Group"}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;
