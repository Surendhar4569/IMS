import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Save,
    RefreshCw,
    Building2,
    Loader,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import vgtAPI from "../utils/axiosConfig";


const Departments = () => {
    // ==========================================
    // STATE
    // ==========================================
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        status: 'active'
    });

    // ==========================================
    // API & LOGIC
    // ==========================================
    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await vgtAPI.get('/department/');
            const data = response.data;

            if (data?.error_response && data.error_response.error_code !== 0) {
                throw new Error(data.error_response.error_message || 'Failed to fetch departments');
            }

            setDepartments(data?.department || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
            toast.error(
                error.response?.data?.error_response?.error_message ||
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch departments'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        setEditingId(null);
        setFormData({ name: '', code: '', status: 'active' });
        setShowModal(true);
    };

    const handleEdit = (department) => {
        setEditingId(department.id);
        setFormData({
            name: department.name || '',
            code: department.code || '',
            status: department.status || 'active'
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', code: '', status: 'active' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Department name is required');
            return;
        }

        if (!formData.code.trim()) {
            toast.error('Department code is required');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
                status: formData.status
            };

            if (!editingId) {
                // CREATE
                const response = await vgtAPI.post('/department/', payload);
                const data = response.data;
                if (data?.error_response && data.error_response.error_code !== 0) {
                    throw new Error(data.error_response.error_message || 'Department creation failed');
                }
                toast.success('Department created successfully');
            } else {
                // UPDATE
                const response = await vgtAPI.put(`/department/${editingId}`, payload);
                const data = response.data;
                if (data?.error_response && data.error_response.error_code !== 0) {
                    throw new Error(data.error_response.error_message || 'Department update failed');
                }
                toast.success('Department updated successfully');
            }

            handleCloseModal();
            await fetchDepartments(); // Re-fetch list to ensure data matches perfectly

        } catch (error) {
            console.error('Department save error:', error);
            const errorMessage =
                error.response?.data?.error_response?.error_message ||
                error.response?.data?.message ||
                error.message ||
                'Failed to save department';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (department) => {

        toast(
            ({ closeToast }) => (
                <div className="w-full">

                    <p className="font-semibold text-gray-900 mb-1">
                        Delete Department?
                    </p>

                    <p className="text-sm text-gray-600 mb-3">
                        Are you sure you want to delete "{department.name}"?
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
                                        await vgtAPI.delete(
                                            `/department/${department.id}`
                                        );

                                    const data =
                                        response.data;

                                    if (
                                        data?.error_response &&
                                        data.error_response.error_code !== 0
                                    ) {
                                        throw new Error(
                                            data.error_response.error_message ||
                                            'Failed to delete department'
                                        );
                                    }

                                    toast.success(
                                        'Department deleted successfully'
                                    );

                                    await fetchDepartments();

                                } catch (error) {

                                    console.error(
                                        'Delete department error:',
                                        error
                                    );

                                    toast.error(
                                        error.response?.data
                                            ?.error_response
                                            ?.error_message ||

                                        error.response?.data?.message ||

                                        error.message ||

                                        'Failed to delete department'
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

    // Derived States
    const filteredDepartments = departments.filter(department => {
        const searchValue = search.toLowerCase().trim();
        if (!searchValue) return true;
        return (
            department.name?.toLowerCase().includes(searchValue) ||
            department.code?.toLowerCase().includes(searchValue) ||
            department.status?.toLowerCase().includes(searchValue)
        );
    });

    const totalDepartments = departments.length;
    const activeDepartments = departments.filter(d => d.status === 'active').length;
    const inactiveDepartments = departments.filter(d => d.status === 'inactive').length;

    // ==========================================
    // UI RENDER
    // ==========================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="container mx-auto max-w-7xl">

                {/* Header Section */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-gradient-to-r from-[#0B1D3A] via-[#132D5E] to-[#1A3A6E] p-6 text-white shadow-xl">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div>
                                {/* <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="w-5 h-5 text-blue-300" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                                        Organization Settings
                                    </span>
                                </div> */}
                                <h1 className="text-3xl font-bold">Departments</h1>
                                <p className="text-blue-100 mt-1">Manage and organize departments</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 min-w-[400px]">
                                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                                    <div className="text-2xl font-bold">{totalDepartments}</div>
                                    <div className="text-xs text-blue-200 mt-1">Total</div>
                                </div>
                                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                                    <div className="text-2xl font-bold text-green-300">{activeDepartments}</div>
                                    <div className="text-xs text-blue-200 mt-1">Active</div>
                                </div>
                                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                                    <div className="text-2xl font-bold text-gray-300">{inactiveDepartments}</div>
                                    <div className="text-xs text-blue-200 mt-1">Inactive</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

                    {/* Search & Actions Bar */}
                    <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search departments..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A] transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={fetchDepartments}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                type="button"
                                onClick={handleAdd}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1D3A] text-white text-sm font-semibold hover:bg-[#132D5E] transition-all shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                Add Department
                            </button>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        {loading && departments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader className="w-8 h-8 animate-spin text-[#0B1D3A]" />
                                <p className="mt-3 text-gray-500">Loading departments...</p>
                            </div>
                        ) : filteredDepartments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="bg-gray-50 rounded-full p-4 mb-4">
                                    <Building2 className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No departments found</h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    {search ? 'Try adjusting your search query' : 'Add your first department to get started'}
                                </p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">Department</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">Code</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                                        {/* Created At removed from here */}
                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredDepartments.map((department) => (
                                        // Removed 'group' class from tr
                                        <tr key={department.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B1D3A] to-[#1A3A6E] flex items-center justify-center text-white shadow-sm">
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{department.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-mono font-semibold tracking-wider">
                                                    {department.code || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${department.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {department.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {department.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {/* Created At removed from here */}
                                            <td className="px-6 py-4 text-right">
                                                {/* Removed opacity-0 and group-hover:opacity-100 so buttons are always visible */}
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(department)}
                                                        className="p-2 text-gray-600 hover:text-[#0B1D3A] hover:bg-gray-100 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(department)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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

                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingId ? 'Edit Department' : 'Add New Department'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {editingId ? 'Update department details' : 'Create a new department record'}
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

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Human Resources"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A] transition-all"
                                    disabled={saving}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="e.g., HR"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A] transition-all"
                                    disabled={saving}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A] transition-all"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

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
                                            {editingId ? 'Update Department' : 'Create Department'}
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

export default Departments;