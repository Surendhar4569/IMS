import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Power,
    X,
    Save,
    RefreshCw,
    Settings,
    Loader,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const rolesApi = `${import.meta.env.VITE_API_URL}/roles`;

const Roles = () => {

    // ==========================================
    // STATE
    // ==========================================

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        is_active: true
    });


    // ==========================================
    // API & LOGIC
    // ==========================================

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');

        return token
            ? {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            : {};
    };


    // ==========================================
    // FETCH ROLES
    // ==========================================

    const fetchRoles = async () => {
        try {

            setLoading(true);

            const response = await axios.get(
                rolesApi,
                getAuthConfig()
            );

            console.log(
                'Roles GET Response:',
                response.data
            );

            const data = response.data;

            setRoles(
                data?.data ||
                data?.roles ||
                []
            );

        } catch (error) {

            console.error(
                'Error fetching roles:',
                error
            );

            toast.error(
                error.response?.data?.message ||
                'Failed to fetch roles'
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        fetchRoles();
    }, []);


    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleInputChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]:
                type === 'checkbox'
                    ? checked
                    : value
        }));

    };


    // ==========================================
    // ADD
    // ==========================================

    const handleAdd = () => {

        setEditingId(null);

        setFormData({
            name: '',
            is_active: true
        });

        setShowModal(true);

    };


    // ==========================================
    // EDIT
    // ==========================================

    const handleEdit = (role) => {

        console.log(
            'Editing role:',
            role
        );

        setEditingId(role.id);

        setFormData({
            name: role.name || '',
            is_active:
                role.is_active ??
                role.status === 'active'
        });

        setShowModal(true);

    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const handleCloseModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingId(null);

        setFormData({
            name: '',
            is_active: true
        });

    };


    // ==========================================
    // CREATE / UPDATE
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.name.trim()) {

            toast.error(
                'Role name is required'
            );

            return;
        }

        try {

            setSaving(true);

            const payload = {
                name:
                    formData.name
                        .trim(),

                is_active:
                    formData.is_active
            };


            // ==================================
            // CREATE
            // ==================================

            if (!editingId) {

                const response =
                    await axios.post(
                        rolesApi,
                        payload,
                        getAuthConfig()
                    );

                console.log(
                    'Role POST Response:',
                    response.data
                );

                toast.success(
                    'Role created successfully'
                );

            }

            // ==================================
            // UPDATE
            // ==================================

            else {

                const response =
                    await axios.put(
                        `${rolesApi}/${editingId}`,
                        payload,
                        getAuthConfig()
                    );

                console.log(
                    'Role PUT Response:',
                    response.data
                );

                toast.success(
                    'Role updated successfully'
                );

            }

            handleCloseModal();

            await fetchRoles();

        } catch (error) {

            console.error(
                'Role save error:',
                error
            );

            toast.error(
                error.response?.data?.message ||
                'Failed to save role'
            );

        } finally {

            setSaving(false);

        }

    };


    // ==========================================
    // DELETE
    // ==========================================

    const handleDelete = async (role) => {

        toast(
            ({ closeToast }) => (

                <div className="w-full">

                    <p className="font-semibold text-gray-900 mb-1">
                        Delete Role?
                    </p>

                    <p className="text-sm text-gray-600 mb-3">
                        Are you sure you want to delete "{role.name}"?
                    </p>

                    <div className="flex justify-end gap-2">

                        <button
                            type="button"
                            onClick={closeToast}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={async () => {

                                closeToast();

                                try {

                                    setLoading(true);

                                    const response =
                                        await axios.delete(
                                            `${rolesApi}/${role.id}`,
                                            getAuthConfig()
                                        );

                                    console.log(
                                        'Role DELETE Response:',
                                        response.data
                                    );

                                    toast.success(
                                        'Role deleted successfully'
                                    );

                                    await fetchRoles();

                                } catch (error) {

                                    console.error(
                                        'Delete role error:',
                                        error
                                    );

                                    toast.error(
                                        error.response?.data?.message ||
                                        'Failed to delete role'
                                    );

                                } finally {

                                    setLoading(false);

                                }

                            }}
                            className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                closeButton: false
            }
        );

    };


    // ==========================================
    // ACTIVATE / DEACTIVATE
    // ==========================================

    const handleToggleStatus = async (role) => {

        try {

            setLoading(true);

            const isActive =
                role.is_active ??
                role.status === 'active';

            const action =
                isActive
                    ? 'deactivate'
                    : 'activate';

            await axios.patch(
                `${rolesApi}/${role.id}/${action}`,
                {},
                getAuthConfig()
            );

            toast.success(
                `Role ${
                    isActive
                        ? 'deactivated'
                        : 'activated'
                } successfully`
            );

            await fetchRoles();

        } catch (error) {

            console.error(
                'Role status error:',
                error
            );

            toast.error(
                error.response?.data?.message ||
                'Failed to update role status'
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // SEARCH
    // ==========================================

    const filteredRoles =
        roles.filter(role => {

            const searchValue =
                search
                    .toLowerCase()
                    .trim();

            if (!searchValue) {
                return true;
            }

            return (
                role.name
                    ?.toLowerCase()
                    .includes(searchValue)
            );

        });


    // ==========================================
    // STATISTICS
    // ==========================================

    const totalRoles =
        roles.length;

    const activeRoles =
        roles.filter(role =>
            role.is_active ??
            role.status === 'active'
        ).length;

    const inactiveRoles =
        roles.filter(role =>
            !(role.is_active ??
                role.status === 'active')
        ).length;


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">

            <div className="container mx-auto max-w-7xl">


                {/* =====================================
                    HEADER
                ====================================== */}

                <div className="mb-8">

                    <div className="rounded-2xl bg-gradient-to-r from-[#0B1D3A] via-[#132D5E] to-[#1A3A6E] p-6 text-white shadow-xl">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                            <div>

                                <div className="flex items-center gap-2 mb-2">

                                    <Settings
                                        className="w-5 h-5 text-blue-300"
                                    />

                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                                        Organization Settings
                                    </span>

                                </div>

                                <h1 className="text-3xl font-bold">
                                    Roles
                                </h1>

                                <p className="text-blue-100 mt-1">
                                    Manage and organize roles
                                </p>

                            </div>


                            {/* Statistics */}

                            <div className="grid grid-cols-3 gap-4 min-w-[400px]">

                                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">

                                    <div className="text-2xl font-bold">
                                        {totalRoles}
                                    </div>

                                    <div className="text-xs text-blue-200 mt-1">
                                        Total
                                    </div>

                                </div>


                                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">

                                    <div className="text-2xl font-bold text-green-300">
                                        {activeRoles}
                                    </div>

                                    <div className="text-xs text-blue-200 mt-1">
                                        Active
                                    </div>

                                </div>


                                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">

                                    <div className="text-2xl font-bold text-gray-300">
                                        {inactiveRoles}
                                    </div>

                                    <div className="text-xs text-blue-200 mt-1">
                                        Inactive
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    TABLE
                ====================================== */}

                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">


                    {/* Search & Actions */}

                    <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">

                        <div className="relative flex-1 max-w-md">

                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search roles..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A] transition-all"
                            />

                        </div>


                        <div className="flex items-center gap-3">

                            <button
                                type="button"
                                onClick={fetchRoles}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                            >

                                <RefreshCw
                                    className={`w-4 h-4 ${
                                        loading
                                            ? 'animate-spin'
                                            : ''
                                    }`}
                                />

                                Refresh

                            </button>


                            <button
                                type="button"
                                onClick={handleAdd}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1D3A] text-white text-sm font-semibold hover:bg-[#132D5E] transition-all shadow-md"
                            >

                                <Plus className="w-4 h-4" />

                                Add Role

                            </button>

                        </div>

                    </div>


                    {/* =====================================
                        TABLE CONTENT
                    ====================================== */}

                    <div className="overflow-x-auto">

                        {loading && roles.length === 0 ? (

                            <div className="flex flex-col items-center justify-center py-16">

                                <Loader
                                    className="w-8 h-8 animate-spin text-[#0B1D3A]"
                                />

                                <p className="mt-3 text-gray-500">
                                    Loading roles...
                                </p>

                            </div>

                        ) : filteredRoles.length === 0 ? (

                            <div className="flex flex-col items-center justify-center py-16">

                                <div className="bg-gray-50 rounded-full p-4 mb-4">

                                    <Settings
                                        className="w-12 h-12 text-gray-400"
                                    />

                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    No roles found
                                </h3>

                                <p className="text-gray-500 text-sm mb-4">

                                    {search
                                        ? 'Try adjusting your search query'
                                        : 'Add your first role to get started'}

                                </p>

                            </div>

                        ) : (

                            <table className="min-w-full divide-y divide-gray-200">

                                <thead className="bg-gray-50">

                                    <tr>

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

                                    {filteredRoles.map(
                                        role => {

                                            const isActive =
                                                role.is_active ??
                                                role.status === 'active';

                                            return (

                                                <tr
                                                    key={role.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >


                                                    {/* ROLE */}

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B1D3A] to-[#1A3A6E] flex items-center justify-center text-white shadow-sm">

                                                                <Settings
                                                                    className="w-5 h-5"
                                                                />

                                                            </div>


                                                            <div>

                                                                <p className="font-semibold text-gray-900">
                                                                    {role.name}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                isActive
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                        >

                                                            {isActive ? (

                                                                <CheckCircle
                                                                    className="w-3 h-3"
                                                                />

                                                            ) : (

                                                                <XCircle
                                                                    className="w-3 h-3"
                                                                />

                                                            )}

                                                            {isActive
                                                                ? 'Active'
                                                                : 'Inactive'}

                                                        </span>

                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td className="px-6 py-4 text-right">

                                                        <div className="flex items-center justify-end gap-1">


                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        role
                                                                    )
                                                                }
                                                                className="p-2 text-gray-600 hover:text-[#0B1D3A] hover:bg-gray-100 rounded-lg transition-all"
                                                                title="Edit"
                                                            >

                                                                <Edit2
                                                                    className="w-4 h-4"
                                                                />

                                                            </button>


                                                            {/* ACTIVATE / DEACTIVATE */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleToggleStatus(
                                                                        role
                                                                    )
                                                                }
                                                                className={`p-2 rounded-lg transition-all ${
                                                                    isActive
                                                                        ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                                }`}
                                                                title={
                                                                    isActive
                                                                        ? 'Deactivate'
                                                                        : 'Activate'
                                                                }
                                                            >

                                                                <Power
                                                                    className="w-4 h-4"
                                                                />

                                                            </button>


                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        role
                                                                    )
                                                                }
                                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Delete"
                                                            >

                                                                <Trash2
                                                                    className="w-4 h-4"
                                                                />

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>

                </div>

            </div>


            {/* =====================================
                ADD / EDIT MODAL
            ====================================== */}

            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">


                        {/* MODAL HEADER */}

                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200 flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-gray-900">

                                    {editingId
                                        ? 'Edit Role'
                                        : 'Add New Role'}

                                </h2>

                                <p className="text-sm text-gray-500 mt-1">

                                    {editingId
                                        ? 'Update role details'
                                        : 'Create a new role record'}

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={saving}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-all"
                            >

                                <X className="w-5 h-5" />

                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <form
                            onSubmit={handleSubmit}
                            className="p-6 space-y-5"
                        >


                            {/* ROLE NAME */}

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">

                                    Role Name

                                    <span className="text-red-500">
                                        *
                                    </span>

                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Administrator"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A] transition-all"
                                    disabled={saving}
                                    required
                                />

                            </div>


                            {/* STATUS */}

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>

                                <select
                                    name="is_active"
                                    value={
                                        formData.is_active
                                            ? 'active'
                                            : 'inactive'
                                    }
                                    onChange={(e) =>
                                        setFormData(
                                            prev => ({
                                                ...prev,
                                                is_active:
                                                    e.target.value ===
                                                    'active'
                                            })
                                        )
                                    }
                                    disabled={saving}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A] transition-all"
                                >

                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>

                                </select>

                            </div>


                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={saving}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0B1D3A] text-white text-sm font-semibold hover:bg-[#132D5E] disabled:opacity-50 transition-all shadow-md"
                                >

                                    {saving ? (

                                        <>

                                            <Loader className="w-4 h-4 animate-spin" />

                                            Saving...

                                        </>

                                    ) : (

                                        <>

                                            <Save className="w-4 h-4" />

                                            {editingId
                                                ? 'Update Role'
                                                : 'Create Role'}

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );
};

export default Roles;