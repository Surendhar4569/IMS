import React, { useEffect, useMemo, useState } from 'react';
import {
    Plus,
    Search,
    RefreshCw,
    Users,
    UsersRound,
    Pencil,
    Trash2,
    X,
    Loader,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import vgtAPI from '../utils/axiosConfig';

const MemberGroups = () => {

    // ============================================================
    // DATA
    // ============================================================

    const [groups, setGroups] = useState([]);
    const [members, setMembers] = useState([]);
    const [memberGroups, setMemberGroups] = useState([]);

    // ============================================================
    // LOADING
    // ============================================================

    const [loading, setLoading] = useState(false);
    const [addingMembers, setAddingMembers] = useState(false);
    const [updatingMember, setUpdatingMember] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // ============================================================
    // PAGE SEARCH
    // ============================================================

    const [search, setSearch] = useState('');

    // ============================================================
    // MODAL
    // ============================================================

    const [showModal, setShowModal] = useState(false);

    const [modalMode, setModalMode] = useState('create');
    // create | edit

    const [editingId, setEditingId] = useState(null);

    // ============================================================
    // FORM
    // ============================================================

    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);

    const [memberSearch, setMemberSearch] = useState('');

    // ============================================================
    // DELETE CONFIRMATION
    // ============================================================

    const [deleteRecord, setDeleteRecord] = useState(null);


    // ============================================================
    // GET GROUPS
    // ============================================================

    const fetchGroups = async () => {

        try {

            const response = await vgtAPI.get('/groups/');

            console.log(
                'GET GROUPS RESPONSE:',
                response.data
            );

            const errorResponse =
                response.data?.error_response;

            if (
                errorResponse &&
                Number(errorResponse.error_code) !== 0
            ) {

                throw new Error(
                    errorResponse.error_message ||
                    'Failed to fetch groups'
                );

            }

            setGroups(
                response.data?.groups || []
            );

        } catch (error) {

            console.error(
                'Error fetching groups:',
                error
            );

            toast.error(
                error.response?.data
                    ?.error_response
                    ?.error_message ||
                error.message ||
                'Failed to fetch groups'
            );

        }

    };

    // ============================================================
    // GET MEMBERS
    // ============================================================

    const fetchMembers = async () => {

        try {

            const response = await vgtAPI.get('/members/');

            console.log(
                'GET MEMBERS RESPONSE:',
                response.data
            );

            const errorResponse =
                response.data?.error_response;

            if (
                errorResponse &&
                Number(errorResponse.error_code) !== 0
            ) {

                throw new Error(
                    errorResponse.error_message ||
                    'Failed to fetch members'
                );

            }

            setMembers(
                response.data?.members || []
            );

        } catch (error) {

            console.error(
                'Error fetching members:',
                error
            );

            toast.error(
                error.response?.data
                    ?.error_response
                    ?.error_message ||
                error.message ||
                'Failed to fetch members'
            );

        }

    };

    // ============================================================
    // GET MEMBERS GROUPS
    //
    // THIS IS THE MAIN TABLE DATA
    // ============================================================

    const fetchMemberGroups = async () => {

        try {

            const response =
                await vgtAPI.get('/members_groups/');

            console.log(
                'GET MEMBERS GROUPS RESPONSE:',
                response.data
            );

            const errorResponse =
                response.data?.error_response;

            if (
                errorResponse &&
                Number(errorResponse.error_code) !== 0
            ) {

                throw new Error(
                    errorResponse.error_message ||
                    'Failed to fetch member groups'
                );

            }

            setMemberGroups(
                response.data?.members_groups || []
            );

        } catch (error) {

            console.error(
                'Error fetching member groups:',
                error
            );

            toast.error(
                error.response?.data
                    ?.error_response
                    ?.error_message ||
                error.message ||
                'Failed to fetch member groups'
            );

        }

    };

    // ============================================================
    // INITIAL PAGE LOAD
    // ============================================================

    useEffect(() => {

        const loadData = async () => {

            setLoading(true);

            await Promise.all([
                fetchGroups(),
                fetchMembers(),
                fetchMemberGroups()
            ]);

            setLoading(false);

        };

        loadData();

    }, []);


    // ============================================================
    // REFRESH
    // ============================================================

    const handleRefresh = async () => {

        setLoading(true);

        await Promise.all([
            fetchGroups(),
            fetchMembers(),
            fetchMemberGroups()
        ]);

        setLoading(false);

    };

    // ============================================================
    // CALCULATE GROUP STATISTICS
    // ============================================================

    const activeGroups = useMemo(() => {
        return groups.filter(g => g.status === 'active').length;
    }, [groups]);

    const inactiveGroups = useMemo(() => {
        return groups.filter(g => g.status !== 'active').length;
    }, [groups]);


    // ============================================================
    // GET MEMBER NAME
    // ============================================================

    const getMemberName = (member) => {

        if (member?.displayName) {
            return member.displayName;
        }

        const name =
            `${member?.first_name || ''} ${member?.last_name || ''
                }`.trim();

        return name || '-';

    };

    // ============================================================
    // FILTER TABLE
    //
    // TABLE IS BASED ON members_groups
    // ============================================================

    const filteredMemberGroups = useMemo(() => {

        const searchValue =
            search.toLowerCase().trim();

        if (!searchValue) {
            return memberGroups;
        }

        return memberGroups.filter(item => {

            const groupName =
                item.group_id?.name?.toLowerCase() || '';

            const groupCode =
                item.group_id?.code?.toLowerCase() || '';

            const memberName =
                getMemberName(
                    item.member_id
                ).toLowerCase();

            const memberCode =
                item.member_id?.member_code
                    ?.toLowerCase() || '';

            return (
                groupName.includes(searchValue) ||
                groupCode.includes(searchValue) ||
                memberName.includes(searchValue) ||
                memberCode.includes(searchValue)
            );

        });

    }, [
        memberGroups,
        search
    ]);


    // ============================================================
    // OPEN CREATE MODAL
    // ============================================================

    const handleOpenCreate = () => {

        setModalMode('create');

        setEditingId(null);

        setSelectedGroupId('');

        setSelectedMemberIds([]);

        setMemberSearch('');

        setShowModal(true);

    };

    // ============================================================
    // OPEN EDIT MODAL
    //
    // row comes directly from members_groups
    // ============================================================

    const handleEdit = (row) => {

        console.log(
            'EDIT MEMBER GROUP:',
            row
        );

        setModalMode('edit');

        setEditingId(row.id);

        // Prefill group
        setSelectedGroupId(
            row.group_id?.id || ''
        );

        // Prefill member
        setSelectedMemberIds(
            row.member_id?.id
                ? [row.member_id.id]
                : []
        );

        setMemberSearch('');

        setShowModal(true);

    };

    // ============================================================
    // CLOSE MODAL
    // ============================================================

    const handleCloseModal = () => {

        if (
            addingMembers ||
            updatingMember
        ) {
            return;
        }

        setShowModal(false);

        setModalMode('create');

        setEditingId(null);

        setSelectedGroupId('');

        setSelectedMemberIds([]);

        setMemberSearch('');

    };

    // ============================================================
    // EXISTING MEMBER IDS FOR SELECTED GROUP
    // ============================================================

    const existingMemberIdsForSelectedGroup =
        useMemo(() => {

            if (!selectedGroupId) {
                return [];
            }

            return memberGroups
                .filter(item =>
                    String(item.group_id?.id) ===
                    String(selectedGroupId)
                )
                .filter(item => {

                    // During edit, don't consider the
                    // current record as a duplicate.

                    if (
                        modalMode === 'edit' &&
                        String(item.id) ===
                        String(editingId)
                    ) {
                        return false;
                    }

                    return true;

                })
                .map(item =>
                    String(item.member_id?.id)
                );

        }, [
            memberGroups,
            selectedGroupId,
            modalMode,
            editingId
        ]);


    // ============================================================
    // MEMBER SEARCH
    // ============================================================

    const filteredMembers = useMemo(() => {

        const searchValue =
            memberSearch.toLowerCase().trim();

        if (!searchValue) {
            return members;
        }

        return members.filter(member => {

            const displayName =
                member.displayName?.toLowerCase() || '';

            const firstName =
                member.first_name?.toLowerCase() || '';

            const lastName =
                member.last_name?.toLowerCase() || '';

            const memberCode =
                member.member_code?.toLowerCase() || '';

            return (
                displayName.includes(searchValue) ||
                firstName.includes(searchValue) ||
                lastName.includes(searchValue) ||
                memberCode.includes(searchValue)
            );

        });

    }, [
        members,
        memberSearch
    ]);


    // ============================================================
    // MEMBER ALREADY IN CURRENT GROUP
    // ============================================================

    const isAlreadyInSelectedGroup = (
        memberId
    ) => {

        return existingMemberIdsForSelectedGroup
            .includes(
                String(memberId)
            );

    };

    // ============================================================
    // MEMBER SELECTION
    // ============================================================

    const handleMemberSelect = (memberId) => {

        // Edit mode = only one member
        if (modalMode === 'edit') {

            if (
                isAlreadyInSelectedGroup(memberId)
            ) {

                toast.error(
                    'This member is already assigned to this group'
                );

                return;

            }

            setSelectedMemberIds([
                memberId
            ]);

            return;

        }


        // Create mode
        if (
            isAlreadyInSelectedGroup(memberId)
        ) {

            return;

        }


        setSelectedMemberIds(prev => {

            const exists =
                prev.some(
                    id =>
                        String(id) ===
                        String(memberId)
                );

            if (exists) {

                return prev.filter(
                    id =>
                        String(id) !==
                        String(memberId)
                );

            }

            return [
                ...prev,
                memberId
            ];

        });

    };

    // ============================================================
    // REMOVE SELECTED MEMBER
    // ============================================================

    const handleRemoveSelectedMember = (
        memberId
    ) => {

        if (modalMode === 'edit') {
            return;
        }

        setSelectedMemberIds(prev =>
            prev.filter(
                id =>
                    String(id) !==
                    String(memberId)
            )
        );

    };

    // ============================================================
    // SELECT ALL
    // ============================================================

    const handleSelectAll = () => {

        if (!selectedGroupId) {

            toast.error(
                'Please select a group first'
            );

            return;

        }

        if (modalMode === 'edit') {
            return;
        }

        const selectableIds =
            filteredMembers
                .filter(member =>
                    !isAlreadyInSelectedGroup(
                        member.id
                    )
                )
                .map(member =>
                    member.id
                );

        setSelectedMemberIds(
            selectableIds
        );

    };

    // ============================================================
    // CLEAR SELECTION
    // ============================================================

    const handleClearSelection = () => {

        if (modalMode === 'edit') {
            return;
        }

        setSelectedMemberIds([]);

    };

    // ============================================================
    // SELECTED MEMBER OBJECTS
    // ============================================================

    const selectedMembers = useMemo(() => {

        return selectedMemberIds
            .map(memberId =>
                members.find(
                    member =>
                        String(member.id) ===
                        String(memberId)
                )
            )
            .filter(Boolean);

    }, [
        selectedMemberIds,
        members
    ]);


    // ============================================================
    // CREATE
    //
    // POST /members-groups/
    // ============================================================

    const handleCreate = async () => {

        if (!selectedGroupId) {

            toast.error(
                'Please select a group'
            );

            return;

        }

        if (selectedMemberIds.length === 0) {

            toast.error(
                'Please select at least one member'
            );

            return;

        }


        try {

            setAddingMembers(true);

            let successCount = 0;


            // ========================================================
            // ADD EACH MEMBER
            // ========================================================

            for (
                const memberId of selectedMemberIds
            ) {

                const payload = {

                    group_id: {
                        id: selectedGroupId
                    },

                    member_id: {
                        id: memberId
                    }

                };

                console.log(
                    'CREATE MEMBER GROUP PAYLOAD:',
                    payload
                );

                const response =
                    await vgtAPI.post('/members_groups/', payload);


                console.log(
                    'CREATE MEMBER GROUP RESPONSE:',
                    response.data
                );

                const errorResponse =
                    response.data?.error_response;


                if (
                    errorResponse &&
                    Number(errorResponse.error_code) !== 0
                ) {

                    throw new Error(
                        errorResponse.error_message ||
                        'Failed to add member to group'
                    );

                }


                successCount++;

            }


            // Refresh main table
            await fetchMemberGroups();


            toast.success(
                `${successCount} member${successCount === 1
                    ? ''
                    : 's'
                } added successfully`
            );


            handleCloseModal();

        } catch (error) {

            console.error(
                'Error adding members:',
                error
            );

            toast.error(
                error.response?.data
                    ?.error_response
                    ?.error_message ||
                error.message ||
                'Failed to add members'
            );

        } finally {

            setAddingMembers(false);

        }

    };

    // ============================================================
    // UPDATE
    //
    // PUT /members-groups/{id}
    // ============================================================

    const handleUpdate = async () => {

        if (!editingId) {

            toast.error(
                'Invalid member group record'
            );

            return;

        }

        if (!selectedGroupId) {

            toast.error(
                'Please select a group'
            );

            return;

        }

        if (selectedMemberIds.length === 0) {

            toast.error(
                'Please select a member'
            );

            return;

        }


        try {

            setUpdatingMember(true);


            const payload = {

                group_id: {
                    id: selectedGroupId
                },

                member_id: {
                    id: selectedMemberIds[0]
                }

            };

            console.log(
                'UPDATE MEMBER GROUP ID:',
                editingId
            );

            console.log(
                'UPDATE MEMBER GROUP PAYLOAD:',
                payload
            );

            const response =
                await vgtAPI.put(`/members_groups/${editingId}/`,
                    payload
                );

            console.log(
                'UPDATE MEMBER GROUP RESPONSE:',
                response.data
            );

            const errorResponse =
                response.data?.error_response;

            if (
                errorResponse &&
                Number(errorResponse.error_code) !== 0
            ) {

                throw new Error(
                    errorResponse.error_message ||
                    'Failed to update member group'
                );

            }


            await fetchMemberGroups();


            toast.success(
                'Member group updated successfully'
            );


            handleCloseModal();

        } catch (error) {

            console.error(
                'Error updating member group:',
                error
            );

            toast.error(
                error.response?.data
                    ?.error_response
                    ?.error_message ||
                error.message ||
                'Failed to update member group'
            );

        } finally {

            setUpdatingMember(false);

        }

    };

    // ============================================================
    // DELETE CONFIRMATION
    // ============================================================

    const handleDeleteClick = (row) => {

        setDeleteRecord(row);

    };

    // ============================================================
    // CANCEL DELETE
    // ============================================================

    const handleCancelDelete = () => {

        if (deletingId) {
            return;
        }

        setDeleteRecord(null);

    };

    // ============================================================
    // DELETE
    //
    // DELETE /members-groups/{id}
    // ============================================================

    const handleDelete = async () => {

        if (!deleteRecord?.id) {

            toast.error(
                'Invalid member group record'
            );

            return;

        }


        try {

            setDeletingId(
                deleteRecord.id
            );

            console.log(
                'DELETE MEMBER GROUP ID:',
                deleteRecord.id
            );

            const response =
                await vgtAPI.delete(`/members_groups/${deleteRecord.id}/`);

            console.log(
                'DELETE MEMBER GROUP RESPONSE:',
                response.data
            );

            const errorResponse =
                response.data?.error_response;

            if (
                errorResponse &&
                Number(errorResponse.error_code) !== 0
            ) {

                throw new Error(
                    errorResponse.error_message ||
                    'Failed to delete member group'
                );

            }


            await fetchMemberGroups();


            toast.success(
                'Member removed from group successfully'
            );


            setDeleteRecord(null);

        } catch (error) {

            console.error(
                'Error deleting member group:',
                error
            );

            toast.error(
                error.response?.data
                    ?.error_response
                    ?.error_message ||
                error.message ||
                'Failed to delete member group'
            );

        } finally {

            setDeletingId(null);

        }

    };

    // ============================================================
    // GET SELECTED GROUP NAME
    // ============================================================

    const selectedGroup = groups.find(
        group =>
            String(group.id) ===
            String(selectedGroupId)
    );

    // ============================================================
    // MODAL SUBMIT
    // ============================================================

    const handleSubmit = () => {

        if (modalMode === 'edit') {

            handleUpdate();

        } else {

            handleCreate();

        }

    };

    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">

            <div className="max-w-7xl mx-auto">

                {/* ======================================================
            PAGE HEADER (GRADIENT DESIGN)
        ====================================================== */}

                <div className="mb-8">
                    <div className="rounded-2xl bg-gradient-to-r from-[#0B1D3A] via-[#132D5E] to-[#1A3A6E] p-6 sm:p-8 text-white shadow-xl">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <UsersRound className="w-5 h-5 text-blue-300" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                                        Group Management
                                    </span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-bold">Member Groups</h1>
                                <p className="text-blue-100 mt-1">Manage and organize groups</p>
                            </div>

                            {/* Statistics */}
                            <div className="grid grid-cols-3 gap-4 w-full lg:w-auto lg:min-w-[400px]">
                                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                                    <div className="text-2xl font-bold">{groups.length}</div>
                                    <div className="text-xs text-blue-200 mt-1">Total Groups</div>
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


                {/* ======================================================
            TABLE CARD
        ====================================================== */}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">


                    {/* ====================================================
              TABLE TOOLBAR
          ==================================================== */}

                    <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search group or member..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A]"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto md:justify-end">
                            <div className="text-sm text-gray-500 flex items-center justify-center px-2">
                                {filteredMemberGroups.length}
                                {' '}
                                assignment
                                {filteredMemberGroups.length === 1 ? '' : 's'}
                            </div>

                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleOpenCreate}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B1D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#132D5E] shadow-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Members to Group
                            </button>
                        </div>

                    </div>


                    {/* ====================================================
              TABLE
          ==================================================== */}

                    <div className="overflow-x-auto">

                        {loading ? (

                            <div className="py-16 flex flex-col items-center justify-center">

                                <Loader className="w-8 h-8 animate-spin text-[#0B1D3A]" />

                                <p className="text-sm text-gray-500 mt-3">
                                    Loading member groups...
                                </p>

                            </div>

                        ) : filteredMemberGroups.length === 0 ? (

                            <div className="py-16 flex flex-col items-center justify-center">

                                <Users className="w-12 h-12 text-gray-300" />

                                <p className="text-lg font-semibold text-gray-700 mt-3">
                                    No member groups found
                                </p>

                                <p className="text-sm text-gray-500 mt-1 text-center px-4">
                                    Add members to a group to see assignments here.
                                </p>

                            </div>

                        ) : (

                            <table className="min-w-full divide-y divide-gray-200">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Group
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Group Code
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Member
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Member Code
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>

                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="bg-white divide-y divide-gray-100">

                                    {filteredMemberGroups.map(row => {

                                        const member =
                                            row.member_id;

                                        const group =
                                            row.group_id;

                                        const memberName =
                                            getMemberName(member);


                                        return (

                                            <tr
                                                key={row.id}
                                                className="hover:bg-gray-50"
                                            >


                                                {/* GROUP */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">

                                                            <Users className="w-4 h-4 text-[#0B1D3A]" />

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-semibold text-gray-900">

                                                                {group?.name || '-'}

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* GROUP CODE */}

                                                <td className="px-6 py-4">

                                                    <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-mono text-gray-700">

                                                        {group?.code || '-'}

                                                    </span>

                                                </td>


                                                {/* MEMBER */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">

                                                            {memberName
                                                                .charAt(0)
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-medium text-gray-900">

                                                                {memberName}

                                                            </p>

                                                            <p className="text-xs text-gray-500">

                                                                {member?.gender || '-'}

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* MEMBER CODE */}

                                                <td className="px-6 py-4">

                                                    <span className="text-sm font-mono text-gray-600">

                                                        {member?.member_code || '-'}

                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${group?.status === 'active'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                    >

                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${group?.status === 'active'
                                                                ? 'bg-green-500'
                                                                : 'bg-gray-400'
                                                                }`}
                                                        />

                                                        {group?.status || 'inactive'}

                                                    </span>

                                                </td>


                                                {/* ACTIONS */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(row)
                                                            }
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0B1D3A]"
                                                            title="Edit"
                                                        >

                                                            <Pencil className="w-4 h-4" />

                                                            <span className="hidden sm:inline">Edit</span>

                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    row
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                row.id
                                                            }
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                            title="Delete"
                                                        >

                                                            {deletingId === row.id ? (

                                                                <Loader className="w-4 h-4 animate-spin" />

                                                            ) : (

                                                                <Trash2 className="w-4 h-4" />

                                                            )}

                                                            <span className="hidden sm:inline">Delete</span>

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


            {/* ========================================================
          ADD / EDIT MODAL
      ======================================================== */}

            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 overflow-y-auto">

                    <div className="w-full max-w-5xl my-8 max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">


                        {/* ==================================================
                MODAL HEADER
            ================================================== */}

                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">

                            <div>

                                <h2 className="text-xl font-bold text-gray-900">

                                    {modalMode === 'edit'
                                        ? 'Edit Member Group'
                                        : 'Add Members to Group'}

                                </h2>

                                <p className="text-sm text-gray-500 mt-1">

                                    {modalMode === 'edit'
                                        ? 'Update the group or member for this assignment.'
                                        : 'Select a group and multiple members.'}

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={
                                    addingMembers ||
                                    updatingMember
                                }
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                            >

                                <X className="w-5 h-5" />

                            </button>

                        </div>


                        {/* ==================================================
                MODAL BODY
            ================================================== */}

                        <div className="p-6 overflow-y-auto flex-1">


                            {/* GROUP */}

                            <div className="mb-5">

                                <label className="block text-sm font-medium text-gray-700 mb-2">

                                    Group

                                    <span className="text-red-500 ml-1">
                                        *
                                    </span>

                                </label>


                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => {

                                        setSelectedGroupId(
                                            e.target.value
                                        );

                                        // In create mode changing group
                                        // clears current selection.

                                        if (
                                            modalMode === 'create'
                                        ) {

                                            setSelectedMemberIds([]);

                                        }

                                    }}
                                    disabled={
                                        addingMembers ||
                                        updatingMember
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A] bg-white"
                                >

                                    <option value="">
                                        Select Group
                                    </option>


                                    {groups.map(group => (

                                        <option
                                            key={group.id}
                                            value={group.id}
                                        >

                                            {group.name}

                                            {group.code
                                                ? ` (${group.code})`
                                                : ''}

                                        </option>

                                    ))}

                                </select>


                                {selectedGroup && (

                                    <div className="mt-2 text-xs text-gray-500">

                                        {selectedGroup.description || ''}

                                    </div>

                                )}

                            </div>


                            {/* =================================================
                  MEMBER SELECTION
              ================================================= */}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">


                                {/* =================================================
                    AVAILABLE MEMBERS
                ================================================= */}

                                <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col max-h-[500px]">


                                    <div className="px-4 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">

                                        <div className="flex items-center justify-between mb-3">

                                            <div>

                                                <h3 className="text-sm font-semibold text-gray-900">

                                                    {modalMode === 'edit'
                                                        ? 'Member'
                                                        : 'Available Members'}

                                                </h3>

                                                <p className="text-xs text-gray-500 mt-1">

                                                    {modalMode === 'edit'
                                                        ? 'Select the member for this assignment.'
                                                        : 'Select members to add.'}

                                                </p>

                                            </div>


                                            {modalMode === 'create' && (

                                                <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200">

                                                    {filteredMembers.length}

                                                </span>

                                            )}

                                        </div>


                                        {/* SEARCH */}

                                        <div className="relative">

                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                            <input
                                                type="text"
                                                value={memberSearch}
                                                onChange={(e) =>
                                                    setMemberSearch(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Search members..."
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A]"
                                            />

                                        </div>

                                    </div>

                                    {/* MEMBER LIST */}
                                    <div className="flex-1 overflow-y-auto p-2 bg-white">
                                        {filteredMembers.length === 0 ? (
                                            <div className="py-10 text-center">
                                                <Users className="w-8 h-8 text-gray-300 mx-auto" />
                                                <p className="text-sm text-gray-500 mt-2">No members found.</p>
                                            </div>
                                        ) : (
                                            filteredMembers.map(member => {
                                                const isSelected = selectedMemberIds.includes(member.id);
                                                const isAlreadyIn = isAlreadyInSelectedGroup(member.id);
                                                return (
                                                    <div
                                                        key={member.id}
                                                        onClick={() => !isAlreadyIn && handleMemberSelect(member.id)}
                                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 transition-colors 
                                                            ${isAlreadyIn ? 'opacity-60 cursor-not-allowed bg-gray-50' :
                                                                isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
                                                    >
                                                        <div className="flex items-center gap-3">

                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                                                                {getMemberName(member).charAt(0).toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{getMemberName(member)}</p>
                                                                <p className="text-xs text-gray-500 truncate">{member.member_code || '-'}</p>
                                                            </div>

                                                        </div>

                                                        <div className="flex-shrink-0">
                                                            {isAlreadyIn ? (
                                                                <span className="text-xs text-gray-400 italic">In group</span>
                                                            ) : isSelected ? (
                                                                <CheckCircle className="w-5 h-5 text-[#0B1D3A]" />
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                </div>


                                {/* =================================================
                    SELECTED MEMBERS
                ================================================= */}

                                {modalMode === 'create' ? (

                                    <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col max-h-[500px]">

                                        <div className="px-4 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">

                                            <div className="flex items-center justify-between mb-3">

                                                <div>

                                                    <h3 className="text-sm font-semibold text-gray-900">
                                                        Selected Members
                                                    </h3>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Review your selection.
                                                    </p>

                                                </div>

                                                <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200">
                                                    {selectedMembers.length}
                                                </span>

                                            </div>

                                            <div className="flex items-center gap-3 text-xs">
                                                <button
                                                    type="button"
                                                    onClick={handleSelectAll}
                                                    className="font-medium text-[#0B1D3A] hover:underline"
                                                >
                                                    Select All
                                                </button>

                                                <span className="text-gray-200">|</span>

                                                <button
                                                    type="button"
                                                    onClick={handleClearSelection}
                                                    className="font-medium text-red-600 hover:underline"
                                                >
                                                    Clear
                                                </button>
                                            </div>

                                        </div>


                                        {/* SELECTED LIST */}
                                        <div className="flex-1 overflow-y-auto p-2 bg-white">
                                            {selectedMembers.length === 0 ? (
                                                <div className="py-10 text-center">
                                                    <Users className="w-8 h-8 text-gray-300 mx-auto" />
                                                    <p className="text-sm text-gray-500 mt-2">No members selected yet.</p>
                                                </div>
                                            ) : (
                                                selectedMembers.map(member => (
                                                    <div
                                                        key={member.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-1 border border-gray-100"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                                                                {getMemberName(member).charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{getMemberName(member)}</p>
                                                                <p className="text-xs text-gray-500 truncate">{member.member_code || '-'}</p>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSelectedMember(member.id)}
                                                            className="p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                    </div>

                                ) : null}

                            </div>

                        </div>


                        {/* ==================================================
                MODAL FOOTER
            ================================================== */}

                        <div className="px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 bg-white flex-shrink-0">

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={
                                    addingMembers ||
                                    updatingMember
                                }
                                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={
                                    addingMembers ||
                                    updatingMember ||
                                    (modalMode === 'create' && selectedMemberIds.length === 0)
                                }
                                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-[#0B1D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#132D5E] shadow-sm disabled:opacity-50 transition-colors"
                            >
                                {addingMembers || updatingMember ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                                {modalMode === 'edit' ? 'Update Assignment' : 'Add to Group'}
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ========================================================
          DELETE CONFIRMATION MODAL
      ======================================================== */}

            {deleteRecord && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">

                        <div className="p-6 text-center">

                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">

                                <AlertCircle className="h-6 w-6 text-red-600" />

                            </div>

                            <h3 className="text-lg font-medium text-gray-900 mt-4">
                                Delete Assignment
                            </h3>

                            <p className="text-sm text-gray-500 mt-2">
                                Are you sure you want to remove
                                <span className="font-semibold text-gray-700"> {getMemberName(deleteRecord.member_id)} </span>
                                from the group
                                <span className="font-semibold text-gray-700"> {deleteRecord.group_id?.name}</span>?
                            </p>

                        </div>

                        <div className="bg-gray-50 px-4 py-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">

                            <button
                                type="button"
                                onClick={handleCancelDelete}
                                disabled={!!deletingId}
                                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={!!deletingId}
                                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {deletingId ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};

export default MemberGroups;