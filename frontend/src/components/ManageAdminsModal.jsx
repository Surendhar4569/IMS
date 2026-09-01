import { useState, useMemo } from "react";
import { X, UserMinus, UserPlus, Search } from "lucide-react";

const ManageAdminsModal = ({
  isOpen,
  onClose,
  group,
  groupAdmins,
  allAdmins,
  isLoading,
  onRemove,
  onAdd,
}) => {
    
  const [selectedAdminsToAdd, setSelectedAdminsToAdd] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to safely get display name from the complex JSON structure
  const getDisplayName = (admin) => {
    if (admin?.member_id?.displayName) return admin.member_id.displayName;
    if (admin?.member_id?.first_name)
      return `${admin.member_id.first_name} ${admin.member_id?.last_name || ""}`;
    return admin?.username || "Unknown Admin";
  };

  // Get IDs of admins already in the group so we can filter them out of the "Available" list
  const currentAdminIds = useMemo(
    () => new Set(groupAdmins.map((ga) => ga.admin_id?.id)),
    [groupAdmins],
  );

  // Filter allAdmins to only show those NOT in the group, and apply search
  const availableAdmins = useMemo(() => {
    return allAdmins.filter((admin) => {
      const isNotInGroup = !currentAdminIds.has(admin.id);
      const name = getDisplayName(admin).toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      return isNotInGroup && matchesSearch;
    });
  }, [allAdmins, currentAdminIds, searchQuery]);

  // Handle Checkbox toggle
  const handleCheckboxChange = (adminId) => {
    setSelectedAdminsToAdd((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId],
    );
  };

  const handleAddSelected = () => {
    onAdd(selectedAdminsToAdd);
    setSelectedAdminsToAdd([]); // Clear selection after sending
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#0B1D3A]">
            Manage Admins - {group?.name || ""}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT SIDE: Current Admins */}
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Admins in this Group ({groupAdmins.length})
            </h3>
            <div className="flex-1 border border-gray-200 rounded-lg overflow-y-auto max-h-[50vh]">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading...</div>
              ) : groupAdmins.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No admins in this group yet.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {groupAdmins.map((ga) => (
                    <li
                      key={ga.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {getDisplayName(ga.admin_id)}
                        </span>
                        <span className="text-xs text-gray-500">
                          @{ga.admin_id?.username}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemove(ga.id)} // ga.id is the admins_groups mapping ID (e.g. "101018427136549434")
                        className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      >
                        <UserMinus className="w-3 h-3" />
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Available Admins to Add */}
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Add New Admins
            </h3>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1D3A] focus:border-[#0B1D3A] outline-none"
              />
            </div>

            <div className="flex-1 border border-gray-200 rounded-lg overflow-y-auto max-h-[42vh]">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading...</div>
              ) : availableAdmins.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  {searchQuery
                    ? "No admins match your search."
                    : "All admins are already in this group."}
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {availableAdmins.map((admin) => (
                    <li
                      key={admin.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selectedAdminsToAdd.includes(admin.id)}
                          onChange={() => handleCheckboxChange(admin.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0B1D3A] focus:ring-[#0B1D3A]"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {getDisplayName(admin)}
                          </span>
                          <span className="text-xs text-gray-500">
                            @{admin.username}
                          </span>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add Button Footer */}
            <button
              onClick={handleAddSelected}
              disabled={selectedAdminsToAdd.length === 0}
              className={`mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedAdminsToAdd.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#0B1D3A] text-white hover:bg-[#15294a]"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Add Selected ({selectedAdminsToAdd.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAdminsModal;
