// import React, { useEffect, useMemo, useState } from 'react';
// import {
//     Plus,
//     Search,
//     RefreshCw,
//     Users,
//     UsersRound,
//     X,
//     Loader,
//     CheckCircle,
//     AlertCircle,
//     UserPlus,
//     Settings2
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import vgtAPI from '../utils/axiosConfig';

// const GROUPS_API = '/groups/';
// const MEMBERS_API = '/members/';
// const MEMBER_GROUPS_API = '/members_groups/';

// const MemberGroups = () => {

//     const [groups, setGroups] = useState([]);
//     const [members, setMembers] = useState([]);
//     const [memberGroups, setMemberGroups] = useState([]);

//     const [loading, setLoading] = useState(false);
//     const [addingMembers, setAddingMembers] = useState(false);
//     const [updatingMembers, setUpdatingMembers] = useState(false);

//     const [search, setSearch] = useState('');

//     const [showModal, setShowModal] = useState(false);

//     const [modalMode, setModalMode] = useState('create');

//     const [selectedGroupId, setSelectedGroupId] = useState('');

//     const [selectedGroup, setSelectedGroup] = useState(null);

//     const [selectedMemberIds, setSelectedMemberIds] = useState([]);

//     const [originalMemberIds, setOriginalMemberIds] = useState([]);

//     const [memberSearch, setMemberSearch] = useState('');

//     useEffect(() => {

//         loadPageData();

//     }, []);

//     const loadPageData = async () => {

//         setLoading(true);

//         try {

//             await Promise.all([
//                 fetchGroups(),
//                 fetchMembers(),
//                 fetchMemberGroups()
//             ]);

//         } finally {

//             setLoading(false);

//         }

//     };

//     const fetchGroups = async () => {

//         try {

//             const response =
//                 await vgtAPI.get(GROUPS_API);

//             console.log(
//                 'GET GROUPS RESPONSE:',
//                 response.data
//             );

//             const errorResponse =
//                 response.data?.error_response;

//             if (
//                 errorResponse &&
//                 Number(errorResponse.error_code) !== 0
//             ) {

//                 throw new Error(
//                     errorResponse.error_message ||
//                     'Failed to fetch groups'
//                 );

//             }

//             setGroups(
//                 response.data?.groups || []
//             );

//         } catch (error) {

//             console.error(
//                 'Error fetching groups:',
//                 error
//             );

//             toast.error(
//                 error.response?.data
//                     ?.error_response
//                     ?.error_message ||
//                 error.message ||
//                 'Failed to fetch groups'
//             );

//         }

//     };

//     const fetchMembers = async () => {

//         try {

//             const response =
//                 await vgtAPI.get(MEMBERS_API);

//             console.log(
//                 'GET MEMBERS RESPONSE:',
//                 response.data
//             );

//             const errorResponse =
//                 response.data?.error_response;

//             if (
//                 errorResponse &&
//                 Number(errorResponse.error_code) !== 0
//             ) {

//                 throw new Error(
//                     errorResponse.error_message ||
//                     'Failed to fetch members'
//                 );

//             }

//             setMembers(
//                 response.data?.members || []
//             );

//         } catch (error) {

//             console.error(
//                 'Error fetching members:',
//                 error
//             );

//             toast.error(
//                 error.response?.data
//                     ?.error_response
//                     ?.error_message ||
//                 error.message ||
//                 'Failed to fetch members'
//             );

//         }

//     };


//     const fetchMemberGroups = async () => {

//         try {

//             const response =
//                 await vgtAPI.get(
//                     MEMBER_GROUPS_API
//                 );

//             console.log(
//                 'GET MEMBERS GROUPS RESPONSE:',
//                 response.data
//             );

//             const errorResponse =
//                 response.data?.error_response;

//             if (
//                 errorResponse &&
//                 Number(errorResponse.error_code) !== 0
//             ) {

//                 throw new Error(
//                     errorResponse.error_message ||
//                     'Failed to fetch member groups'
//                 );

//             }

//             setMemberGroups(
//                 response.data?.members_groups || []
//             );

//         } catch (error) {

//             console.error(
//                 'Error fetching member groups:',
//                 error
//             );

//             toast.error(
//                 error.response?.data
//                     ?.error_response
//                     ?.error_message ||
//                 error.message ||
//                 'Failed to fetch member groups'
//             );

//         }

//     };


//     const handleRefresh = async () => {

//         await loadPageData();

//     };


//     const getMemberName = (member) => {

//         if (member?.displayName) {

//             return member.displayName;

//         }

//         const name =
//             `${member?.first_name || ''} ${member?.last_name || ''
//                 }`.trim();

//         return name || 'Unnamed Member';

//     };


//     const getGroupMemberCount = (groupId) => {

//         return memberGroups.filter(item =>
//             String(item.group_id?.id) ===
//             String(groupId)
//         ).length;

//     };


//     const getGroupMemberGroups = (groupId) => {

//         return memberGroups.filter(item =>
//             String(item.group_id?.id) ===
//             String(groupId)
//         );

//     };


//     const getCurrentMemberIds = (groupId) => {

//         return getGroupMemberGroups(groupId)
//             .map(item =>
//                 String(item.member_id?.id)
//             )
//             .filter(Boolean);

//     };


//     const filteredGroups = useMemo(() => {

//         const searchValue =
//             search.toLowerCase().trim();

//         if (!searchValue) {

//             return groups;

//         }

//         return groups.filter(group => {

//             const groupName =
//                 group.name?.toLowerCase() || '';

//             const groupCode =
//                 group.code?.toLowerCase() || '';

//             const description =
//                 group.description?.toLowerCase() || '';

//             return (
//                 groupName.includes(searchValue) ||
//                 groupCode.includes(searchValue) ||
//                 description.includes(searchValue)
//             );

//         });

//     }, [
//         groups,
//         search
//     ]);



//     const activeGroups = useMemo(() => {

//         return groups.filter(
//             group =>
//                 group.status === 'active'
//         ).length;

//     }, [groups]);


//     const inactiveGroups = useMemo(() => {

//         return groups.filter(
//             group =>
//                 group.status !== 'active'
//         ).length;

//     }, [groups]);


//     const handleOpenAddModal = () => {

//         setModalMode('create');

//         setSelectedGroup(null);

//         setSelectedGroupId('');

//         setSelectedMemberIds([]);

//         setOriginalMemberIds([]);

//         setMemberSearch('');

//         setShowModal(true);

//     };


//     const handleOpenManageModal = (group) => {

//         console.log(
//             'MANAGE GROUP:',
//             group
//         );

//         const currentMemberIds =
//             getCurrentMemberIds(group.id);

//         console.log(
//             'CURRENT MEMBER IDS:',
//             currentMemberIds
//         );

//         setModalMode('manage');

//         setSelectedGroup(group);

//         setSelectedGroupId(group.id);



//         setOriginalMemberIds(
//             [...currentMemberIds]
//         );

//         setSelectedMemberIds(
//             [...currentMemberIds]
//         );

//         setMemberSearch('');

//         setShowModal(true);

//     };


//     const handleCloseModal = () => {

//         if (
//             addingMembers ||
//             updatingMembers
//         ) {

//             return;

//         }

//         setShowModal(false);

//         setModalMode('create');

//         setSelectedGroup(null);

//         setSelectedGroupId('');

//         setSelectedMemberIds([]);

//         setOriginalMemberIds([]);

//         setMemberSearch('');

//     };



//     const handleGroupChange = (groupId) => {

//         setSelectedGroupId(groupId);

//         const group =
//             groups.find(
//                 item =>
//                     String(item.id) ===
//                     String(groupId)
//             );

//         setSelectedGroup(group || null);


//         if (modalMode === 'create') {

//             setSelectedMemberIds([]);

//         }

//     };


//     const isMemberAlreadyInGroup = (
//         memberId
//     ) => {

//         if (!selectedGroupId) {

//             return false;

//         }

//         return memberGroups.some(item =>
//             String(item.group_id?.id) ===
//             String(selectedGroupId) &&
//             String(item.member_id?.id) ===
//             String(memberId)
//         );

//     };



//     const filteredMembers = useMemo(() => {

//         const searchValue =
//             memberSearch.toLowerCase().trim();

//         if (!searchValue) {

//             return members;

//         }

//         return members.filter(member => {

//             const displayName =
//                 member.displayName?.toLowerCase() || '';

//             const firstName =
//                 member.first_name?.toLowerCase() || '';

//             const lastName =
//                 member.last_name?.toLowerCase() || '';

//             const memberCode =
//                 member.member_code?.toLowerCase() || '';

//             return (
//                 displayName.includes(searchValue) ||
//                 firstName.includes(searchValue) ||
//                 lastName.includes(searchValue) ||
//                 memberCode.includes(searchValue)
//             );

//         });

//     }, [
//         members,
//         memberSearch
//     ]);



//     const handleMemberSelect = (memberId) => {

//         const memberIdString =
//             String(memberId);


//         if (modalMode === 'create') {

//             if (
//                 isMemberAlreadyInGroup(
//                     memberId
//                 )
//             ) {

//                 toast.info(
//                     'This member is already in this group'
//                 );

//                 return;

//             }

//         }


//         setSelectedMemberIds(prev => {

//             const exists =
//                 prev.some(
//                     id =>
//                         String(id) ===
//                         memberIdString
//                 );

//             if (exists) {

//                 return prev.filter(
//                     id =>
//                         String(id) !==
//                         memberIdString
//                 );

//             }

//             return [
//                 ...prev,
//                 memberId
//             ];

//         });

//     };



//     const handleRemoveSelectedMember = (
//         memberId
//     ) => {

//         setSelectedMemberIds(prev =>
//             prev.filter(
//                 id =>
//                     String(id) !==
//                     String(memberId)
//             )
//         );

//     };

//     const handleSelectAll = () => {

//         if (!selectedGroupId) {

//             toast.error(
//                 'Please select a group first'
//             );

//             return;

//         }

//         const availableMemberIds =
//             filteredMembers
//                 .filter(member => {


//                     if (
//                         modalMode === 'create'
//                     ) {

//                         return !isMemberAlreadyInGroup(
//                             member.id
//                         );

//                     }



//                     return !selectedMemberIds.some(
//                         id =>
//                             String(id) ===
//                             String(member.id)
//                     );

//                 })
//                 .map(
//                     member =>
//                         member.id
//                 );

//         setSelectedMemberIds(prev => {

//             const updated = [
//                 ...prev
//             ];

//             availableMemberIds.forEach(
//                 id => {

//                     const exists =
//                         updated.some(
//                             existingId =>
//                                 String(existingId) ===
//                                 String(id)
//                         );

//                     if (!exists) {

//                         updated.push(id);

//                     }

//                 }
//             );

//             return updated;

//         });

//     };


//     const handleClearSelection = () => {

//         if (modalMode === 'create') {

//             setSelectedMemberIds([]);

//             return;

//         }


//         setSelectedMemberIds([]);

//     };


//     const selectedMembers = useMemo(() => {

//         return selectedMemberIds
//             .map(memberId =>
//                 members.find(
//                     member =>
//                         String(member.id) ===
//                         String(memberId)
//                 )
//             )
//             .filter(Boolean);

//     }, [
//         selectedMemberIds,
//         members
//     ]);


//     const currentGroupMemberGroups =
//         useMemo(() => {

//             if (!selectedGroupId) {

//                 return [];

//             }

//             return getGroupMemberGroups(
//                 selectedGroupId
//             );

//         }, [getGroupMemberGroups, selectedGroupId]);



//     const handleAddMembers = async () => {

//         if (!selectedGroupId) {

//             toast.error(
//                 'Please select a group'
//             );

//             return;

//         }

//         if (
//             selectedMemberIds.length === 0
//         ) {

//             toast.error(
//                 'Please select at least one member'
//             );

//             return;

//         }


//         try {

//             setAddingMembers(true);

//             let successCount = 0;


//             for (
//                 const memberId of selectedMemberIds
//             ) {

//                 const payload = {

//                     group_id: {
//                         id: selectedGroupId
//                     },

//                     member_id: {
//                         id: memberId
//                     }

//                 };


//                 console.log(
//                     'ADD MEMBER TO GROUP PAYLOAD:',
//                     payload
//                 );


//                 const response =
//                     await vgtAPI.post(
//                         MEMBER_GROUPS_API,
//                         payload
//                     );


//                 console.log(
//                     'ADD MEMBER TO GROUP RESPONSE:',
//                     response.data
//                 );


//                 const errorResponse =
//                     response.data?.error_response;


//                 if (
//                     errorResponse &&
//                     Number(
//                         errorResponse.error_code
//                     ) !== 0
//                 ) {

//                     throw new Error(
//                         errorResponse.error_message ||
//                         'Failed to add member'
//                     );

//                 }


//                 successCount++;

//             }


//             /*
//                 Refresh relationships.

//                 This updates the member count
//                 displayed on the main group table.
//             */

//             await fetchMemberGroups();


//             toast.success(
//                 `${successCount} member${successCount === 1
//                     ? ''
//                     : 's'
//                 } added successfully`
//             );


//             handleCloseModal();

//         } catch (error) {

//             console.error(
//                 'Error adding members:',
//                 error
//             );

//             toast.error(
//                 error.response?.data
//                     ?.error_response
//                     ?.error_message ||
//                 error.message ||
//                 'Failed to add members'
//             );

//         } finally {

//             setAddingMembers(false);

//         }

//     };



//     const handleUpdateMembers = async () => {

//         if (!selectedGroupId) {

//             toast.error(
//                 'Invalid group'
//             );

//             return;

//         }


//         try {

//             setUpdatingMembers(true);


//             const addedMemberIds =
//                 selectedMemberIds.filter(
//                     memberId =>
//                         !originalMemberIds.some(
//                             originalId =>
//                                 String(originalId) ===
//                                 String(memberId)
//                         )
//                 );



//             const removedMemberIds =
//                 originalMemberIds.filter(
//                     originalId =>
//                         !selectedMemberIds.some(
//                             selectedId =>
//                                 String(selectedId) ===
//                                 String(originalId)
//                         )
//                 );


//             console.log(
//                 'ORIGINAL MEMBERS:',
//                 originalMemberIds
//             );

//             console.log(
//                 'NEW MEMBERS:',
//                 selectedMemberIds
//             );

//             console.log(
//                 'ADDED MEMBERS:',
//                 addedMemberIds
//             );

//             console.log(
//                 'REMOVED MEMBERS:',
//                 removedMemberIds
//             );


//             for (
//                 const memberId of removedMemberIds
//             ) {

//                 const relationship =
//                     currentGroupMemberGroups.find(
//                         item =>
//                             String(
//                                 item.member_id?.id
//                             ) ===
//                             String(memberId)
//                     );


//                 if (
//                     !relationship?.id
//                 ) {

//                     console.warn(
//                         'members_groups record not found for member:',
//                         memberId
//                     );

//                     continue;

//                 }


//                 console.log(
//                     'DELETE MEMBER GROUP ID:',
//                     relationship.id
//                 );


//                 const response =
//                     await vgtAPI.delete(
//                         `${MEMBER_GROUPS_API}${relationship.id}/`
//                     );


//                 console.log(
//                     'DELETE MEMBER GROUP RESPONSE:',
//                     response.data
//                 );


//                 const errorResponse =
//                     response.data?.error_response;


//                 if (
//                     errorResponse &&
//                     Number(
//                         errorResponse.error_code
//                     ) !== 0
//                 ) {

//                     throw new Error(
//                         errorResponse.error_message ||
//                         'Failed to remove member'
//                     );

//                 }

//             }

//             for (
//                 const memberId of addedMemberIds
//             ) {

//                 const payload = {

//                     group_id: {
//                         id: selectedGroupId
//                     },

//                     member_id: {
//                         id: memberId
//                     }

//                 };


//                 console.log(
//                     'ADD NEW MEMBER PAYLOAD:',
//                     payload
//                 );


//                 const response =
//                     await vgtAPI.post(
//                         MEMBER_GROUPS_API,
//                         payload
//                     );


//                 console.log(
//                     'ADD NEW MEMBER RESPONSE:',
//                     response.data
//                 );


//                 const errorResponse =
//                     response.data?.error_response;


//                 if (
//                     errorResponse &&
//                     Number(
//                         errorResponse.error_code
//                     ) !== 0
//                 ) {

//                     throw new Error(
//                         errorResponse.error_message ||
//                         'Failed to add member'
//                     );

//                 }

//             }


//             await fetchMemberGroups();


//             if (
//                 addedMemberIds.length === 0 &&
//                 removedMemberIds.length === 0
//             ) {

//                 toast.info(
//                     'No changes were made'
//                 );

//             } else {

//                 const changes = [];

//                 if (
//                     addedMemberIds.length > 0
//                 ) {

//                     changes.push(
//                         `${addedMemberIds.length} added`
//                     );

//                 }

//                 if (
//                     removedMemberIds.length > 0
//                 ) {

//                     changes.push(
//                         `${removedMemberIds.length} removed`
//                     );

//                 }

//                 toast.success(
//                     `Group members updated: ${changes.join(', ')
//                     }`
//                 );

//             }


//             handleCloseModal();

//         } catch (error) {

//             console.error(
//                 'Error updating group members:',
//                 error
//             );

//             toast.error(
//                 error.response?.data
//                     ?.error_response
//                     ?.error_message ||
//                 error.message ||
//                 'Failed to update group members'
//             );

//         } finally {

//             setUpdatingMembers(false);

//         }

//     };


//     const handleSubmit = () => {

//         if (modalMode === 'create') {

//             handleAddMembers();

//         } else {

//             handleUpdateMembers();

//         }

//     };


//     return (

//         <div className="min-h-screen bg-gray-50 p-4 sm:p-6">

//             <div className="max-w-7xl mx-auto">


//                 {/* ==================================================
//                     PAGE HEADER
//                 ================================================== */}

//                 <div className="mb-8">

//                     <div className="rounded-2xl bg-gradient-to-r from-[#0B1D3A] via-[#132D5E] to-[#1A3A6E] p-6 sm:p-8 text-white shadow-xl">

//                         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

//                             <div>

//                                 <div className="flex items-center gap-2 mb-3">

//                                     <UsersRound className="w-5 h-5 text-blue-300" />

//                                     <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">

//                                         Group Management

//                                     </span>

//                                 </div>


//                                 <h1 className="text-2xl sm:text-3xl font-bold">

//                                     Member Groups

//                                 </h1>


//                                 <p className="text-blue-100 mt-1">

//                                     Manage members assigned to groups

//                                 </p>

//                             </div>


//                             {/* STATISTICS */}

//                             <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto lg:min-w-[400px]">

//                                 <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">

//                                     <div className="text-2xl font-bold">

//                                         {groups.length}

//                                     </div>

//                                     <div className="text-xs text-blue-200 mt-1">

//                                         Total Groups

//                                     </div>

//                                 </div>


//                                 <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">

//                                     <div className="text-2xl font-bold text-green-300">

//                                         {activeGroups}

//                                     </div>

//                                     <div className="text-xs text-blue-200 mt-1">

//                                         Active

//                                     </div>

//                                 </div>


//                                 <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">

//                                     <div className="text-2xl font-bold text-gray-300">

//                                         {inactiveGroups}

//                                     </div>

//                                     <div className="text-xs text-blue-200 mt-1">

//                                         Inactive

//                                     </div>

//                                 </div>

//                             </div>

//                         </div>

//                     </div>

//                 </div>


//                 {/* ==================================================
//                     GROUP TABLE
//                 ================================================== */}

//                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">


//                     {/* TOOLBAR */}

//                     <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

//                         <div className="relative w-full md:w-96">

//                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

//                             <input
//                                 type="text"
//                                 value={search}
//                                 onChange={(e) =>
//                                     setSearch(
//                                         e.target.value
//                                     )
//                                 }
//                                 placeholder="Search groups..."
//                                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A]"
//                             />

//                         </div>


//                         <div className="flex items-center justify-end gap-3">

//                             <span className="text-sm text-gray-500">

//                                 {filteredGroups.length}
//                                 {' '}
//                                 group
//                                 {filteredGroups.length === 1
//                                     ? ''
//                                     : 's'}

//                             </span>


//                             <button
//                                 type="button"
//                                 onClick={handleRefresh}
//                                 disabled={loading}
//                                 className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//                             >

//                                 <RefreshCw
//                                     className={`w-4 h-4 ${loading
//                                             ? 'animate-spin'
//                                             : ''
//                                         }`}
//                                 />

//                                 <span className="hidden sm:inline">

//                                     Refresh

//                                 </span>

//                             </button>


//                             <button
//                                 type="button"
//                                 onClick={handleOpenAddModal}
//                                 className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B1D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#132D5E] shadow-sm"
//                             >

//                                 <Plus className="w-4 h-4" />

//                                 Add Members to Group

//                             </button>

//                         </div>

//                     </div>


//                     {/* TABLE */}

//                     <div className="overflow-x-auto">

//                         {loading ? (

//                             <div className="py-16 flex flex-col items-center justify-center">

//                                 <Loader className="w-8 h-8 animate-spin text-[#0B1D3A]" />

//                                 <p className="text-sm text-gray-500 mt-3">

//                                     Loading groups...

//                                 </p>

//                             </div>

//                         ) : filteredGroups.length === 0 ? (

//                             <div className="py-16 flex flex-col items-center justify-center">

//                                 <UsersRound className="w-12 h-12 text-gray-300" />

//                                 <p className="text-lg font-semibold text-gray-700 mt-3">

//                                     No groups found

//                                 </p>

//                                 <p className="text-sm text-gray-500 mt-1">

//                                     No groups match your search.

//                                 </p>

//                             </div>

//                         ) : (

//                             <table className="min-w-full divide-y divide-gray-200">

//                                 <thead className="bg-gray-50">

//                                     <tr>

//                                         <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">

//                                             Group

//                                         </th>


//                                         <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">

//                                             Code

//                                         </th>


//                                         <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">

//                                             Members

//                                         </th>


//                                         <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">

//                                             Status

//                                         </th>


//                                         <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">

//                                             Actions

//                                         </th>

//                                     </tr>

//                                 </thead>


//                                 <tbody className="bg-white divide-y divide-gray-100">

//                                     {filteredGroups.map(group => {

//                                         const memberCount =
//                                             getGroupMemberCount(
//                                                 group.id
//                                             );


//                                         return (

//                                             <tr
//                                                 key={group.id}
//                                                 className="hover:bg-gray-50"
//                                             >


//                                                 {/* GROUP */}

//                                                 <td className="px-6 py-4">

//                                                     <div className="flex items-center gap-3">

//                                                         <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

//                                                             <UsersRound className="w-5 h-5 text-[#0B1D3A]" />

//                                                         </div>


//                                                         <div className="min-w-0">

//                                                             <p className="text-sm font-semibold text-gray-900">

//                                                                 {group.name || '-'}

//                                                             </p>


//                                                             {group.description && (

//                                                                 <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">

//                                                                     {group.description}

//                                                                 </p>

//                                                             )}

//                                                         </div>

//                                                     </div>

//                                                 </td>


//                                                 {/* CODE */}

//                                                 <td className="px-6 py-4">

//                                                     <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-mono text-gray-700">

//                                                         {group.code || '-'}

//                                                     </span>

//                                                 </td>


//                                                 {/* MEMBER COUNT */}

//                                                 <td className="px-6 py-4 text-center">

//                                                     <div className="inline-flex items-center gap-2">

//                                                         <span className="w-9 h-9 rounded-full bg-blue-50 text-[#0B1D3A] flex items-center justify-center text-sm font-bold">

//                                                             {memberCount}

//                                                         </span>


//                                                         <span className="text-sm text-gray-500">

//                                                             {memberCount === 1
//                                                                 ? 'Member'
//                                                                 : 'Members'}

//                                                         </span>

//                                                     </div>

//                                                 </td>


//                                                 {/* STATUS */}

//                                                 <td className="px-6 py-4">

//                                                     <span
//                                                         className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${group.status === 'active'
//                                                                 ? 'bg-green-100 text-green-700'
//                                                                 : 'bg-gray-100 text-gray-600'
//                                                             }`}
//                                                     >

//                                                         <span
//                                                             className={`w-1.5 h-1.5 rounded-full ${group.status === 'active'
//                                                                     ? 'bg-green-500'
//                                                                     : 'bg-gray-400'
//                                                                 }`}
//                                                         />

//                                                         {group.status || 'inactive'}

//                                                     </span>

//                                                 </td>


//                                                 {/* ACTION */}

//                                                 <td className="px-6 py-4">

//                                                     <div className="flex justify-end">

//                                                         <button
//                                                             type="button"
//                                                             onClick={() =>
//                                                                 handleOpenManageModal(
//                                                                     group
//                                                                 )
//                                                             }
//                                                             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#0B1D3A]"
//                                                         >

//                                                             <Settings2 className="w-4 h-4" />

//                                                             Manage Members

//                                                         </button>

//                                                     </div>

//                                                 </td>

//                                             </tr>

//                                         );

//                                     })}

//                                 </tbody>

//                             </table>

//                         )}

//                     </div>

//                 </div>

//             </div>


//             {/* ======================================================
//                 ADD / MANAGE MEMBERS MODAL
//             ====================================================== */}

//             {showModal && (

//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 overflow-y-auto">

//                     <div className="w-full max-w-5xl my-8 max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">


//                         {/* ==================================================
//                             MODAL HEADER
//                         ================================================== */}

//                         <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">

//                             <div>

//                                 <div className="flex items-center gap-2">

//                                     {modalMode === 'create' ? (

//                                         <UserPlus className="w-5 h-5 text-[#0B1D3A]" />

//                                     ) : (

//                                         <Settings2 className="w-5 h-5 text-[#0B1D3A]" />

//                                     )}


//                                     <h2 className="text-xl font-bold text-gray-900">

//                                         {modalMode === 'create'
//                                             ? 'Add Members to Group'
//                                             : 'Manage Group Members'}

//                                     </h2>

//                                 </div>


//                                 <p className="text-sm text-gray-500 mt-1">

//                                     {modalMode === 'create'

//                                         ? 'Select a group and add multiple members.'

//                                         : `Manage members assigned to ${selectedGroup?.name || 'this group'
//                                         }.`

//                                     }

//                                 </p>

//                             </div>


//                             <button
//                                 type="button"
//                                 onClick={handleCloseModal}
//                                 disabled={
//                                     addingMembers ||
//                                     updatingMembers
//                                 }
//                                 className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
//                             >

//                                 <X className="w-5 h-5" />

//                             </button>

//                         </div>


//                         {/* ==================================================
//                             MODAL BODY
//                         ================================================== */}

//                         <div className="p-6 overflow-y-auto flex-1">


//                             {/* =================================================
//                                 GROUP
//                             ================================================= */}

//                             {modalMode === 'create' ? (

//                                 <div className="mb-5">

//                                     <label className="block text-sm font-medium text-gray-700 mb-2">

//                                         Group

//                                         <span className="text-red-500 ml-1">
//                                             *
//                                         </span>

//                                     </label>


//                                     <select
//                                         value={selectedGroupId}
//                                         onChange={(e) =>
//                                             handleGroupChange(
//                                                 e.target.value
//                                             )
//                                         }
//                                         disabled={
//                                             addingMembers ||
//                                             updatingMembers
//                                         }
//                                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A] bg-white"
//                                     >

//                                         <option value="">
//                                             Select Group
//                                         </option>


//                                         {groups.map(group => (

//                                             <option
//                                                 key={group.id}
//                                                 value={group.id}
//                                             >

//                                                 {group.name}

//                                                 {group.code
//                                                     ? ` (${group.code})`
//                                                     : ''}

//                                             </option>

//                                         ))}

//                                     </select>


//                                     {selectedGroup && (

//                                         <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">

//                                             <span>

//                                                 {selectedGroup.description || ''}

//                                             </span>

//                                             <span className="px-2 py-1 rounded-full bg-gray-100">

//                                                 {getGroupMemberCount(
//                                                     selectedGroup.id
//                                                 )}{' '}
//                                                 existing members

//                                             </span>

//                                         </div>

//                                     )}

//                                 </div>

//                             ) : (

//                                 <div className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-100">

//                                     <div className="flex items-center justify-between">

//                                         <div>

//                                             <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">

//                                                 Selected Group

//                                             </p>

//                                             <p className="text-lg font-bold text-gray-900 mt-1">

//                                                 {selectedGroup?.name || '-'}

//                                             </p>

//                                             <p className="text-xs text-gray-500 mt-1">

//                                                 {selectedGroup?.code || ''}

//                                             </p>

//                                         </div>


//                                         <div className="text-right">

//                                             <p className="text-2xl font-bold text-[#0B1D3A]">

//                                                 {selectedMemberIds.length}

//                                             </p>

//                                             <p className="text-xs text-gray-500">

//                                                 Selected Members

//                                             </p>

//                                         </div>

//                                     </div>

//                                 </div>

//                             )}


//                             {/* =================================================
//                                 MEMBER AREA
//                             ================================================= */}

//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">


//                                 {/* =================================================
//                                     AVAILABLE MEMBERS
//                                 ================================================= */}

//                                 <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[500px]">


//                                     {/* HEADER */}

//                                     <div className="px-4 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">

//                                         <div className="flex items-center justify-between mb-3">

//                                             <div>

//                                                 <h3 className="text-sm font-semibold text-gray-900">

//                                                     Available Members

//                                                 </h3>

//                                                 <p className="text-xs text-gray-500 mt-1">

//                                                     {modalMode === 'create'

//                                                         ? 'Select members to add.'

//                                                         : 'Select new members or keep existing members selected.'

//                                                     }

//                                                 </p>

//                                             </div>


//                                             <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200">

//                                                 {filteredMembers.length}

//                                             </span>

//                                         </div>


//                                         {/* SEARCH */}

//                                         <div className="relative">

//                                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

//                                             <input
//                                                 type="text"
//                                                 value={memberSearch}
//                                                 onChange={(e) =>
//                                                     setMemberSearch(
//                                                         e.target.value
//                                                     )
//                                                 }
//                                                 placeholder="Search members..."
//                                                 disabled={
//                                                     addingMembers ||
//                                                     updatingMembers
//                                                 }
//                                                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A]"
//                                             />

//                                         </div>


//                                         {/* SELECT ALL / CLEAR */}

//                                         {selectedGroupId && (

//                                             <div className="flex items-center gap-3 mt-3 text-xs">

//                                                 <button
//                                                     type="button"
//                                                     onClick={handleSelectAll}
//                                                     disabled={
//                                                         addingMembers ||
//                                                         updatingMembers
//                                                     }
//                                                     className="font-medium text-[#0B1D3A] hover:underline disabled:opacity-50"
//                                                 >

//                                                     Select All

//                                                 </button>


//                                                 <span className="text-gray-300">
//                                                     |
//                                                 </span>


//                                                 <button
//                                                     type="button"
//                                                     onClick={handleClearSelection}
//                                                     disabled={
//                                                         selectedMemberIds.length === 0 ||
//                                                         addingMembers ||
//                                                         updatingMembers
//                                                     }
//                                                     className="font-medium text-red-600 hover:underline disabled:opacity-50"
//                                                 >

//                                                     Clear

//                                                 </button>

//                                             </div>

//                                         )}

//                                     </div>


//                                     {/* MEMBER LIST */}

//                                     <div className="flex-1 overflow-y-auto p-2">

//                                         {!selectedGroupId ? (

//                                             <div className="h-full flex flex-col items-center justify-center text-center px-6">

//                                                 <Users className="w-10 h-10 text-gray-300" />

//                                                 <p className="text-sm font-medium text-gray-600 mt-3">

//                                                     Select a group first

//                                                 </p>

//                                                 <p className="text-xs text-gray-400 mt-1">

//                                                     Members will appear here.

//                                                 </p>

//                                             </div>

//                                         ) : filteredMembers.length === 0 ? (

//                                             <div className="h-full flex flex-col items-center justify-center">

//                                                 <Users className="w-10 h-10 text-gray-300" />

//                                                 <p className="text-sm text-gray-500 mt-2">

//                                                     No members found.

//                                                 </p>

//                                             </div>

//                                         ) : (

//                                             filteredMembers.map(member => {

//                                                 const memberId =
//                                                     String(member.id);

//                                                 const isSelected =
//                                                     selectedMemberIds.some(
//                                                         id =>
//                                                             String(id) ===
//                                                             memberId
//                                                     );

//                                                 const alreadyInGroup =
//                                                     isMemberAlreadyInGroup(
//                                                         member.id
//                                                     );


//                                                 /*
//                                                     In CREATE:
//                                                     already existing member
//                                                     cannot be selected.

//                                                     In MANAGE:
//                                                     existing member can be
//                                                     deselected, so it remains
//                                                     clickable.
//                                                 */

//                                                 const disabled =
//                                                     modalMode === 'create' &&
//                                                     alreadyInGroup;


//                                                 return (

//                                                     <div
//                                                         key={member.id}
//                                                         onClick={() => {

//                                                             if (!disabled) {

//                                                                 handleMemberSelect(
//                                                                     member.id
//                                                                 );

//                                                             }

//                                                         }}
//                                                         className={`flex items-center justify-between p-3 rounded-lg mb-1 border transition-colors ${disabled

//                                                                 ? 'opacity-50 cursor-not-allowed bg-gray-50 border-transparent'

//                                                                 : isSelected

//                                                                     ? 'bg-blue-50 border-blue-100 cursor-pointer'

//                                                                     : 'hover:bg-gray-50 border-transparent cursor-pointer'
//                                                             }`}
//                                                     >

//                                                         <div className="flex items-center gap-3 min-w-0">

//                                                             {/* CHECK */}

//                                                             <div
//                                                                 className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isSelected
//                                                                         ? 'bg-[#0B1D3A] border-[#0B1D3A]'
//                                                                         : 'border-gray-300 bg-white'
//                                                                     }`}
//                                                             >

//                                                                 {isSelected && (

//                                                                     <CheckCircle className="w-4 h-4 text-white" />

//                                                                 )}

//                                                             </div>


//                                                             {/* AVATAR */}

//                                                             <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">

//                                                                 {getMemberName(
//                                                                     member
//                                                                 )
//                                                                     .charAt(0)
//                                                                     .toUpperCase()}

//                                                             </div>


//                                                             {/* NAME */}

//                                                             <div className="min-w-0">

//                                                                 <p className="text-sm font-medium text-gray-900 truncate">

//                                                                     {getMemberName(
//                                                                         member
//                                                                     )}

//                                                                 </p>

//                                                                 <p className="text-xs text-gray-500 truncate">

//                                                                     {member.member_code ||
//                                                                         member.id}

//                                                                 </p>

//                                                             </div>

//                                                         </div>


//                                                         {/* STATUS */}

//                                                         {modalMode === 'create' &&
//                                                             alreadyInGroup && (

//                                                                 <span className="text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">

//                                                                     Already Added

//                                                                 </span>

//                                                             )}

//                                                     </div>

//                                                 );

//                                             })

//                                         )}

//                                     </div>

//                                 </div>


//                                 {/* =================================================
//                                     SELECTED / CURRENT MEMBERS
//                                 ================================================= */}

//                                 <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[500px]">


//                                     {/* HEADER */}

//                                     <div className="px-4 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">

//                                         <div className="flex items-center justify-between">

//                                             <div>

//                                                 <h3 className="text-sm font-semibold text-gray-900">

//                                                     {modalMode === 'create'

//                                                         ? 'Selected Members'

//                                                         : 'Current Group Members'

//                                                     }

//                                                 </h3>

//                                                 <p className="text-xs text-gray-500 mt-1">

//                                                     {modalMode === 'create'

//                                                         ? 'Members that will be added.'

//                                                         : 'Uncheck a member to remove them from this group.'

//                                                     }

//                                                 </p>

//                                             </div>


//                                             <span className="min-w-8 h-8 px-2 rounded-full bg-[#0B1D3A] text-white text-xs font-semibold flex items-center justify-center">

//                                                 {selectedMemberIds.length}

//                                             </span>

//                                         </div>

//                                     </div>


//                                     {/* SELECTED MEMBERS */}

//                                     <div className="flex-1 overflow-y-auto p-2">

//                                         {selectedMembers.length === 0 ? (

//                                             <div className="h-full flex flex-col items-center justify-center text-center px-6">

//                                                 <Users className="w-10 h-10 text-gray-300" />

//                                                 <p className="text-sm font-medium text-gray-600 mt-3">

//                                                     No members selected

//                                                 </p>


//                                                 <p className="text-xs text-gray-400 mt-1">

//                                                     Select members from the left.

//                                                 </p>

//                                             </div>

//                                         ) : (

//                                             selectedMembers.map(member => {

//                                                 const memberName =
//                                                     getMemberName(member);


//                                                 const wasOriginallySelected =
//                                                     originalMemberIds.some(
//                                                         id =>
//                                                             String(id) ===
//                                                             String(member.id)
//                                                     );


//                                                 const isNewMember =
//                                                     modalMode === 'manage' &&
//                                                     !wasOriginallySelected;


//                                                 return (

//                                                     <div
//                                                         key={member.id}
//                                                         className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-1 border border-gray-100"
//                                                     >

//                                                         <div className="flex items-center gap-3 min-w-0">

//                                                             <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">

//                                                                 {memberName
//                                                                     .charAt(0)
//                                                                     .toUpperCase()}

//                                                             </div>


//                                                             <div className="min-w-0">

//                                                                 <p className="text-sm font-medium text-gray-900 truncate">

//                                                                     {memberName}

//                                                                 </p>


//                                                                 <div className="flex items-center gap-2 mt-0.5">

//                                                                     <p className="text-xs text-gray-500 truncate">

//                                                                         {member.member_code ||
//                                                                             member.id}

//                                                                     </p>


//                                                                     {isNewMember && (

//                                                                         <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">

//                                                                             New

//                                                                         </span>

//                                                                     )}

//                                                                 </div>

//                                                             </div>

//                                                         </div>


//                                                         <button
//                                                             type="button"
//                                                             onClick={() =>
//                                                                 handleRemoveSelectedMember(
//                                                                     member.id
//                                                                 )
//                                                             }
//                                                             disabled={
//                                                                 addingMembers ||
//                                                                 updatingMembers
//                                                             }
//                                                             className="p-1.5 rounded-full text-red-500 hover:bg-red-50 disabled:opacity-50 flex-shrink-0"
//                                                             title={
//                                                                 modalMode === 'manage'
//                                                                     ? 'Remove from group'
//                                                                     : 'Remove from selection'
//                                                             }
//                                                         >

//                                                             <X className="w-4 h-4" />

//                                                         </button>

//                                                     </div>

//                                                 );

//                                             })

//                                         )}

//                                     </div>


//                                     {/* MANAGE INFO */}

//                                     {modalMode === 'manage' && (

//                                         <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">

//                                             <div className="flex items-start gap-2">

//                                                 <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />

//                                                 <p className="text-xs text-gray-600">

//                                                     Select a new member to add them.
//                                                     Remove an existing member to remove
//                                                     them from this group. Changes are
//                                                     applied only when you click
//                                                     <span className="font-semibold">
//                                                         {' '}Update Members
//                                                     </span>.

//                                                 </p>

//                                             </div>

//                                         </div>

//                                     )}

//                                 </div>

//                             </div>


//                             {/* =================================================
//                                 MANAGE CHANGE SUMMARY
//                             ================================================= */}

//                             {modalMode === 'manage' && (

//                                 <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">

//                                     <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">

//                                         <p className="text-xs text-gray-500">

//                                             Original

//                                         </p>

//                                         <p className="text-lg font-bold text-gray-900">

//                                             {originalMemberIds.length}

//                                         </p>

//                                     </div>


//                                     <div className="p-3 rounded-lg bg-green-50 border border-green-100">

//                                         <p className="text-xs text-green-600">

//                                             Adding

//                                         </p>

//                                         <p className="text-lg font-bold text-green-700">

//                                             {
//                                                 selectedMemberIds.filter(
//                                                     id =>
//                                                         !originalMemberIds.some(
//                                                             originalId =>
//                                                                 String(originalId) ===
//                                                                 String(id)
//                                                         )
//                                                 ).length
//                                             }

//                                         </p>

//                                     </div>


//                                     <div className="p-3 rounded-lg bg-red-50 border border-red-100">

//                                         <p className="text-xs text-red-600">

//                                             Removing

//                                         </p>

//                                         <p className="text-lg font-bold text-red-700">

//                                             {
//                                                 originalMemberIds.filter(
//                                                     id =>
//                                                         !selectedMemberIds.some(
//                                                             selectedId =>
//                                                                 String(selectedId) ===
//                                                                 String(id)
//                                                         )
//                                                 ).length
//                                             }

//                                         </p>

//                                     </div>

//                                 </div>

//                             )}

//                         </div>


//                         {/* ==================================================
//                             MODAL FOOTER
//                         ================================================== */}

//                         <div className="px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 bg-white flex-shrink-0">

//                             <button
//                                 type="button"
//                                 onClick={handleCloseModal}
//                                 disabled={
//                                     addingMembers ||
//                                     updatingMembers
//                                 }
//                                 className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//                             >

//                                 Cancel

//                             </button>


//                             <button
//                                 type="button"
//                                 onClick={handleSubmit}
//                                 disabled={
//                                     addingMembers ||
//                                     updatingMembers ||
//                                     !selectedGroupId ||
//                                     (
//                                         modalMode === 'create' &&
//                                         selectedMemberIds.length === 0
//                                     )
//                                 }
//                                 className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-2.5 bg-[#0B1D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#132D5E] disabled:opacity-50"
//                             >

//                                 {addingMembers ||
//                                     updatingMembers ? (

//                                     <Loader className="w-4 h-4 animate-spin" />

//                                 ) : modalMode === 'create' ? (

//                                     <Plus className="w-4 h-4" />

//                                 ) : (

//                                     <CheckCircle className="w-4 h-4" />

//                                 )}


//                                 {addingMembers

//                                     ? 'Adding...'

//                                     : updatingMembers

//                                         ? 'Updating...'

//                                         : modalMode === 'create'

//                                             ? 'Add Members'

//                                             : 'Update Members'

//                                 }

//                             </button>

//                         </div>

//                     </div>

//                 </div>

//             )}

//         </div>

//     );

// };

// export default MemberGroups;
import React, { useEffect, useMemo, useState } from 'react';
import {
    Plus,
    Search,
    RefreshCw,
    Users,
    UsersRound,
    X,
    Loader,
    CheckCircle,
    AlertCircle,
    UserPlus,
    Settings2
} from 'lucide-react';
import { toast } from 'react-toastify';
import vgtAPI from '../utils/axiosConfig';

const GROUPS_API = '/groups/';
const MEMBERS_API = '/members/';
const MEMBER_GROUPS_API = '/members_groups/';

const MemberGroups = () => {

    const [groups, setGroups] = useState([]);
    const [members, setMembers] = useState([]);
    const [memberGroups, setMemberGroups] = useState([]);

    const [loading, setLoading] = useState(false);
    const [addingMembers, setAddingMembers] = useState(false);
    const [updatingMembers, setUpdatingMembers] = useState(false);

    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);

    const [modalMode, setModalMode] = useState('create');

    const [selectedGroupId, setSelectedGroupId] = useState('');

    const [selectedGroup, setSelectedGroup] = useState(null);

    const [selectedMemberIds, setSelectedMemberIds] = useState([]);

    const [originalMemberIds, setOriginalMemberIds] = useState([]);

    const [memberSearch, setMemberSearch] = useState('');

    useEffect(() => {

        loadPageData();

    }, []);

    const loadPageData = async () => {

        setLoading(true);

        try {

            await Promise.all([
                fetchGroups(),
                fetchMembers(),
                fetchMemberGroups()
            ]);

        } finally {

            setLoading(false);

        }

    };

    const fetchGroups = async () => {

        try {

            const response =
                await vgtAPI.get(GROUPS_API);

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

    const fetchMembers = async () => {

        try {

            const response =
                await vgtAPI.get(MEMBERS_API);

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


    const fetchMemberGroups = async () => {

        try {

            const response =
                await vgtAPI.get(
                    MEMBER_GROUPS_API
                );

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


    const handleRefresh = async () => {

        await loadPageData();

    };


    const getMemberName = (member) => {

        if (member?.displayName) {

            return member.displayName;

        }

        const name =
            `${member?.first_name || ''} ${member?.last_name || ''
                }`.trim();

        return name || 'Unnamed Member';

    };


    const getGroupMemberCount = (groupId) => {

        return memberGroups.filter(item =>
            String(item.group_id?.id) ===
            String(groupId)
        ).length;

    };


    const getGroupMemberGroups = (groupId) => {

        return memberGroups.filter(item =>
            String(item.group_id?.id) ===
            String(groupId)
        );

    };


    const getCurrentMemberIds = (groupId) => {

        return getGroupMemberGroups(groupId)
            .map(item =>
                String(item.member_id?.id)
            )
            .filter(Boolean);

    };


    const filteredGroups = useMemo(() => {

        const searchValue =
            search.toLowerCase().trim();

        if (!searchValue) {

            return groups;

        }

        return groups.filter(group => {

            const groupName =
                group.name?.toLowerCase() || '';

            const groupCode =
                group.code?.toLowerCase() || '';

            const description =
                group.description?.toLowerCase() || '';

            return (
                groupName.includes(searchValue) ||
                groupCode.includes(searchValue) ||
                description.includes(searchValue)
            );

        });

    }, [
        groups,
        search
    ]);



    const activeGroups = useMemo(() => {

        return groups.filter(
            group =>
                group.status === 'active'
        ).length;

    }, [groups]);


    const inactiveGroups = useMemo(() => {

        return groups.filter(
            group =>
                group.status !== 'active'
        ).length;

    }, [groups]);


    const handleOpenAddModal = () => {

        setModalMode('create');

        setSelectedGroup(null);

        setSelectedGroupId('');

        setSelectedMemberIds([]);

        setOriginalMemberIds([]);

        setMemberSearch('');

        setShowModal(true);

    };


    const handleOpenManageModal = (group) => {

        console.log(
            'MANAGE GROUP:',
            group
        );

        const currentMemberIds =
            getCurrentMemberIds(group.id);

        console.log(
            'CURRENT MEMBER IDS:',
            currentMemberIds
        );

        setModalMode('manage');

        setSelectedGroup(group);

        setSelectedGroupId(group.id);

        setOriginalMemberIds(
            [...currentMemberIds]
        );

        setSelectedMemberIds(
            [...currentMemberIds]
        );

        setMemberSearch('');

        setShowModal(true);

    };


    const handleCloseModal = () => {

        if (
            addingMembers ||
            updatingMembers
        ) {

            return;

        }

        setShowModal(false);

        setModalMode('create');

        setSelectedGroup(null);

        setSelectedGroupId('');

        setSelectedMemberIds([]);

        setOriginalMemberIds([]);

        setMemberSearch('');

    };



    const handleGroupChange = (groupId) => {

        setSelectedGroupId(groupId);

        const group =
            groups.find(
                item =>
                    String(item.id) ===
                    String(groupId)
            );

        setSelectedGroup(group || null);


        if (modalMode === 'create') {

            setSelectedMemberIds([]);

        }

    };


    const isMemberAlreadyInGroup = (
        memberId
    ) => {

        if (!selectedGroupId) {

            return false;

        }

        return memberGroups.some(item =>
            String(item.group_id?.id) ===
            String(selectedGroupId) &&
            String(item.member_id?.id) ===
            String(memberId)
        );

    };



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



    const handleMemberSelect = (memberId) => {

        const memberIdString =
            String(memberId);


        if (modalMode === 'create') {

            if (
                isMemberAlreadyInGroup(
                    memberId
                )
            ) {

                toast.info(
                    'This member is already in this group'
                );

                return;

            }

        }


        setSelectedMemberIds(prev => {

            const exists =
                prev.some(
                    id =>
                        String(id) ===
                        memberIdString
                );

            if (exists) {

                return prev.filter(
                    id =>
                        String(id) !==
                        memberIdString
                );

            }

            return [
                ...prev,
                memberId
            ];

        });

    };



    const handleRemoveSelectedMember = (
        memberId
    ) => {

        setSelectedMemberIds(prev =>
            prev.filter(
                id =>
                    String(id) !==
                    String(memberId)
            )
        );

    };

    const handleSelectAll = () => {

        if (!selectedGroupId) {

            toast.error(
                'Please select a group first'
            );

            return;

        }

        const availableMemberIds =
            filteredMembers
                .filter(member => {


                    if (
                        modalMode === 'create'
                    ) {

                        return !isMemberAlreadyInGroup(
                            member.id
                        );

                    }



                    return !selectedMemberIds.some(
                        id =>
                            String(id) ===
                            String(member.id)
                    );

                })
                .map(
                    member =>
                        member.id
                );

        setSelectedMemberIds(prev => {

            const updated = [
                ...prev
            ];

            availableMemberIds.forEach(
                id => {

                    const exists =
                        updated.some(
                            existingId =>
                                String(existingId) ===
                                String(id)
                        );

                    if (!exists) {

                        updated.push(id);

                    }

                }
            );

            return updated;

        });

    };


    const handleClearSelection = () => {

        setSelectedMemberIds([]);

    };


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


    const currentGroupMemberGroups =
        useMemo(() => {

            if (!selectedGroupId) {

                return [];

            }

            return memberGroups.filter(
                item =>
                    String(item.group_id?.id) ===
                    String(selectedGroupId)
            );

        }, [memberGroups, selectedGroupId]);



    const handleAddMembers = async () => {

        if (!selectedGroupId) {

            toast.error(
                'Please select a group'
            );

            return;

        }

        if (
            selectedMemberIds.length === 0
        ) {

            toast.error(
                'Please select at least one member'
            );

            return;

        }


        try {

            setAddingMembers(true);

            let successCount = 0;


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
                    'ADD MEMBER TO GROUP PAYLOAD:',
                    payload
                );


                const response =
                    await vgtAPI.post(
                        MEMBER_GROUPS_API,
                        payload
                    );


                console.log(
                    'ADD MEMBER TO GROUP RESPONSE:',
                    response.data
                );


                const errorResponse =
                    response.data?.error_response;


                if (
                    errorResponse &&
                    Number(
                        errorResponse.error_code
                    ) !== 0
                ) {

                    throw new Error(
                        errorResponse.error_message ||
                        'Failed to add member'
                    );

                }


                successCount++;

            }


            /*
                Refresh relationships.

                This updates the member count
                displayed on the main group table.
            */

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



    const handleUpdateMembers = async () => {

        if (!selectedGroupId) {

            toast.error(
                'Invalid group'
            );

            return;

        }


        try {

            setUpdatingMembers(true);


            const addedMemberIds =
                selectedMemberIds.filter(
                    memberId =>
                        !originalMemberIds.some(
                            originalId =>
                                String(originalId) ===
                                String(memberId)
                        )
                );



            const removedMemberIds =
                originalMemberIds.filter(
                    originalId =>
                        !selectedMemberIds.some(
                            selectedId =>
                                String(selectedId) ===
                                String(originalId)
                        )
                );


            console.log(
                'ORIGINAL MEMBERS:',
                originalMemberIds
            );

            console.log(
                'NEW MEMBERS:',
                selectedMemberIds
            );

            console.log(
                'ADDED MEMBERS:',
                addedMemberIds
            );

            console.log(
                'REMOVED MEMBERS:',
                removedMemberIds
            );


            for (
                const memberId of removedMemberIds
            ) {

                const relationship =
                    currentGroupMemberGroups.find(
                        item =>
                            String(
                                item.member_id?.id
                            ) ===
                            String(memberId)
                    );


                if (
                    !relationship?.id
                ) {

                    console.warn(
                        'members_groups record not found for member:',
                        memberId
                    );

                    continue;

                }


                console.log(
                    'DELETE MEMBER GROUP ID:',
                    relationship.id
                );


                const response =
                    await vgtAPI.delete(
                        `${MEMBER_GROUPS_API}${relationship.id}/`
                    );


                console.log(
                    'DELETE MEMBER GROUP RESPONSE:',
                    response.data
                );


                const errorResponse =
                    response.data?.error_response;


                if (
                    errorResponse &&
                    Number(
                        errorResponse.error_code
                    ) !== 0
                ) {

                    throw new Error(
                        errorResponse.error_message ||
                        'Failed to remove member'
                    );

                }

            }

            for (
                const memberId of addedMemberIds
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
                    'ADD NEW MEMBER PAYLOAD:',
                    payload
                );


                const response =
                    await vgtAPI.post(
                        MEMBER_GROUPS_API,
                        payload
                    );


                console.log(
                    'ADD NEW MEMBER RESPONSE:',
                    response.data
                );


                const errorResponse =
                    response.data?.error_response;


                if (
                    errorResponse &&
                    Number(
                        errorResponse.error_code
                    ) !== 0
                ) {

                    throw new Error(
                        errorResponse.error_message ||
                        'Failed to add member'
                    );

                }

            }


            await fetchMemberGroups();


            if (
                addedMemberIds.length === 0 &&
                removedMemberIds.length === 0
            ) {

                toast.info(
                    'No changes were made'
                );

            } else {

                const changes = [];

                if (
                    addedMemberIds.length > 0
                ) {

                    changes.push(
                        `${addedMemberIds.length} added`
                    );

                }

                if (
                    removedMemberIds.length > 0
                ) {

                    changes.push(
                        `${removedMemberIds.length} removed`
                    );

                }

                toast.success(
                    `Group members updated: ${changes.join(', ')
                    }`
                );

            }


            handleCloseModal();

        } catch (error) {

            console.error(
                'Error updating group members:',
                error
            );

            toast.error(
                error.response?.data
                    ?.error_response
                    ?.error_message ||
                error.message ||
                'Failed to update group members'
            );

        } finally {

            setUpdatingMembers(false);

        }

    };


    const handleSubmit = () => {

        if (modalMode === 'create') {

            handleAddMembers();

        } else {

            handleUpdateMembers();

        }

    };


    return (

        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">

            <div className="max-w-7xl mx-auto">


                {/* ==================================================
                    PAGE HEADER
                ================================================== */}

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


                                <h1 className="text-2xl sm:text-3xl font-bold">

                                    Member Groups

                                </h1>


                                <p className="text-blue-100 mt-1">

                                    Manage members assigned to groups

                                </p>

                            </div>


                            {/* STATISTICS */}

                            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto lg:min-w-[400px]">

                                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">

                                    <div className="text-2xl font-bold">

                                        {groups.length}

                                    </div>

                                    <div className="text-xs text-blue-200 mt-1">

                                        Total Groups

                                    </div>

                                </div>


                                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">

                                    <div className="text-2xl font-bold text-green-300">

                                        {activeGroups}

                                    </div>

                                    <div className="text-xs text-blue-200 mt-1">

                                        Active

                                    </div>

                                </div>


                                <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">

                                    <div className="text-2xl font-bold text-gray-300">

                                        {inactiveGroups}

                                    </div>

                                    <div className="text-xs text-blue-200 mt-1">

                                        Inactive

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    GROUP TABLE
                ================================================== */}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">


                    {/* TOOLBAR */}

                    <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div className="relative w-full md:w-96">

                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search groups..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0B1D3A]"
                            />

                        </div>


                        <div className="flex items-center justify-end gap-3">

                            <span className="text-sm text-gray-500">

                                {filteredGroups.length}
                                {' '}
                                group
                                {filteredGroups.length === 1
                                    ? ''
                                    : 's'}

                            </span>


                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >

                                <RefreshCw
                                    className={`w-4 h-4 ${loading
                                            ? 'animate-spin'
                                            : ''
                                        }`}
                                />

                                <span className="hidden sm:inline">

                                    Refresh

                                </span>

                            </button>


                            <button
                                type="button"
                                onClick={handleOpenAddModal}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B1D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#132D5E] shadow-sm"
                            >

                                <Plus className="w-4 h-4" />

                                Add Members to Group

                            </button>

                        </div>

                    </div>


                    {/* TABLE */}

                    <div className="overflow-x-auto">

                        {loading ? (

                            <div className="py-16 flex flex-col items-center justify-center">

                                <Loader className="w-8 h-8 animate-spin text-[#0B1D3A]" />

                                <p className="text-sm text-gray-500 mt-3">

                                    Loading groups...

                                </p>

                            </div>

                        ) : filteredGroups.length === 0 ? (

                            <div className="py-16 flex flex-col items-center justify-center">

                                <UsersRound className="w-12 h-12 text-gray-300" />

                                <p className="text-lg font-semibold text-gray-700 mt-3">

                                    No groups found

                                </p>

                                <p className="text-sm text-gray-500 mt-1">

                                    No groups match your search.

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

                                            Code

                                        </th>


                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">

                                            Members

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

                                    {filteredGroups.map(group => {

                                        const memberCount =
                                            getGroupMemberCount(
                                                group.id
                                            );


                                        return (

                                            <tr
                                                key={group.id}
                                                className="hover:bg-gray-50"
                                            >


                                                {/* GROUP */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

                                                            <UsersRound className="w-5 h-5 text-[#0B1D3A]" />

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="text-sm font-semibold text-gray-900">

                                                                {group.name || '-'}

                                                            </p>


                                                            {group.description && (

                                                                <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">

                                                                    {group.description}

                                                                </p>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* CODE */}

                                                <td className="px-6 py-4">

                                                    <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-mono text-gray-700">

                                                        {group.code || '-'}

                                                    </span>

                                                </td>


                                                {/* MEMBER COUNT */}

                                                <td className="px-6 py-4 text-center">

                                                    <div className="inline-flex items-center gap-2">

                                                        <span className="w-9 h-9 rounded-full bg-blue-50 text-[#0B1D3A] flex items-center justify-center text-sm font-bold">

                                                            {memberCount}

                                                        </span>


                                                        <span className="text-sm text-gray-500">

                                                            {memberCount === 1
                                                                ? 'Member'
                                                                : 'Members'}

                                                        </span>

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${group.status === 'active'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                    >

                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${group.status === 'active'
                                                                    ? 'bg-green-500'
                                                                    : 'bg-gray-400'
                                                                }`}
                                                        />

                                                        {group.status || 'inactive'}

                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td className="px-6 py-4">

                                                    <div className="flex justify-end">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleOpenManageModal(
                                                                    group
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#0B1D3A]"
                                                        >

                                                            <Settings2 className="w-4 h-4" />

                                                            Manage Members

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

            {/* ======================================================
                ADD / MANAGE MEMBERS MODAL
            ====================================================== */}

            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 overflow-y-auto">

                    <div className="w-full max-w-5xl my-8 max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">


                        {/* ==================================================
                            MODAL HEADER
                        ================================================== */}

                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">

                            <div>

                                <div className="flex items-center gap-2">

                                    {modalMode === 'create' ? (

                                        <UserPlus className="w-5 h-5 text-[#0B1D3A]" />

                                    ) : (

                                        <Settings2 className="w-5 h-5 text-[#0B1D3A]" />

                                    )}


                                    <h2 className="text-xl font-bold text-gray-900">

                                        {modalMode === 'create'
                                            ? 'Add Members to Group'
                                            : 'Manage Group Members'}

                                    </h2>

                                </div>


                                <p className="text-sm text-gray-500 mt-1">

                                    {modalMode === 'create'

                                        ? 'Select a group and add multiple members.'

                                        : `Manage members assigned to ${selectedGroup?.name || 'this group'
                                        }.`

                                    }

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={
                                    addingMembers ||
                                    updatingMembers
                                }
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                            >

                                <X className="w-5 h-5" />

                            </button>

                        </div>


                        {/* ==================================================
                            MODAL BODY
                        ================================================== */}

                        <div className="p-6 overflow-y-auto flex-1">


                            {/* =================================================
                                GROUP
                            ================================================= */}

                            {modalMode === 'create' ? (

                                <div className="mb-5">

                                    <label className="block text-sm font-medium text-gray-700 mb-2">

                                        Group

                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>

                                    </label>


                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) =>
                                            handleGroupChange(
                                                e.target.value
                                            )
                                        }
                                        disabled={
                                            addingMembers ||
                                            updatingMembers
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

                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">

                                            <span>

                                                {selectedGroup.description || ''}

                                            </span>

                                            <span className="px-2 py-1 rounded-full bg-gray-100">

                                                {getGroupMemberCount(
                                                    selectedGroup.id
                                                )}{' '}
                                                existing members

                                            </span>

                                        </div>

                                    )}

                                </div>

                            ) : (

                                <div className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-100">

                                    <div className="flex flex-wrap items-center justify-between gap-4">

                                        <div>

                                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">

                                                Selected Group

                                            </p>

                                            <p className="text-lg font-bold text-gray-900 mt-1">

                                                {selectedGroup?.name || '-'}

                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">

                                                {selectedGroup?.code || ''}

                                            </p>

                                        </div>


                                        <div className="text-right">

                                            <p className="text-2xl font-bold text-[#0B1D3A]">

                                                {selectedMemberIds.length}

                                            </p>

                                            <p className="text-xs text-gray-500">

                                                Selected Members

                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )}


                            {/* =================================================
                                MEMBER AREA
                            ================================================= */}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">


                                {/* =================================================
                                    AVAILABLE MEMBERS
                                ================================================= */}

                                <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[500px]">


                                    {/* HEADER */}

                                    <div className="px-4 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">

                                        <div className="flex items-center justify-between mb-3">

                                            <div>

                                                <h3 className="text-sm font-semibold text-gray-900">

                                                    Available Members

                                                </h3>

                                                <p className="text-xs text-gray-500 mt-1">

                                                    {modalMode === 'create'

                                                        ? 'Select members to add.'

                                                        : 'Select new members or keep existing members selected.'

                                                    }

                                                </p>

                                            </div>


                                            <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200">

                                                {filteredMembers.length}

                                            </span>

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

                                                <p className="text-sm text-gray-500 mt-2">

                                                    No members found.

                                                </p>

                                            </div>

                                        ) : (

                                            filteredMembers.map(member => {

                                                const isSelected =
                                                    selectedMemberIds.some(
                                                        id =>
                                                            String(id) ===
                                                            String(member.id)
                                                    );

                                                const isAlreadyIn =
                                                    modalMode === 'create' &&
                                                    isMemberAlreadyInGroup(
                                                        member.id
                                                    );


                                                return (

                                                    <div
                                                        key={member.id}
                                                        onClick={() => {

                                                            if (
                                                                isAlreadyIn ||
                                                                addingMembers ||
                                                                updatingMembers
                                                            ) {

                                                                return;

                                                            }

                                                            handleMemberSelect(
                                                                member.id
                                                            );

                                                        }}
                                                        className={`flex items-center justify-between p-3 rounded-lg mb-1 border transition-colors ${isAlreadyIn
                                                                ? 'opacity-60 bg-gray-50 cursor-not-allowed border-transparent'
                                                                : isSelected
                                                                    ? 'bg-blue-50 border-blue-100 cursor-pointer'
                                                                    : 'hover:bg-gray-50 border-transparent cursor-pointer'
                                                            }`}
                                                    >

                                                        <div className="flex items-center gap-3 min-w-0">

                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">

                                                                {getMemberName(member)
                                                                    .charAt(0)
                                                                    .toUpperCase()}

                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="text-sm font-medium text-gray-900 truncate">

                                                                    {getMemberName(member)}

                                                                </p>

                                                                <p className="text-xs text-gray-500 truncate">

                                                                    {member.member_code || '-'}

                                                                </p>

                                                            </div>

                                                        </div>


                                                        <div className="flex-shrink-0 ml-2">

                                                            {isAlreadyIn ? (

                                                                <span className="inline-flex items-center gap-1 text-xs text-gray-400 italic">

                                                                    <AlertCircle className="w-3.5 h-3.5" />

                                                                    In group

                                                                </span>

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

                                <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[500px]">


                                    {/* HEADER */}

                                    <div className="px-4 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">

                                        <div className="flex items-center justify-between mb-3">

                                            <div>

                                                <h3 className="text-sm font-semibold text-gray-900">

                                                    {modalMode === 'create'

                                                        ? 'Selected Members'

                                                        : 'Current Members'

                                                    }

                                                </h3>

                                                <p className="text-xs text-gray-500 mt-1">

                                                    {modalMode === 'create'

                                                        ? 'Review your selection.'

                                                        : 'Unselect members to remove them from this group.'

                                                    }

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
                                                disabled={
                                                    addingMembers ||
                                                    updatingMembers
                                                }
                                                className="font-medium text-[#0B1D3A] hover:underline disabled:opacity-50"
                                            >

                                                Select All

                                            </button>

                                            <span className="text-gray-200">|</span>

                                            <button
                                                type="button"
                                                onClick={handleClearSelection}
                                                disabled={
                                                    addingMembers ||
                                                    updatingMembers
                                                }
                                                className="font-medium text-red-600 hover:underline disabled:opacity-50"
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

                                                <p className="text-sm text-gray-500 mt-2">

                                                    {modalMode === 'create'

                                                        ? 'No members selected yet.'

                                                        : 'No members selected. Saving will remove all members from this group.'

                                                    }

                                                </p>

                                            </div>

                                        ) : (

                                            selectedMembers.map(member => (

                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-1 border border-gray-100"
                                                >

                                                    <div className="flex items-center gap-3 min-w-0">

                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">

                                                            {getMemberName(member)
                                                                .charAt(0)
                                                                .toUpperCase()}

                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="text-sm font-medium text-gray-900 truncate">

                                                                {getMemberName(member)}

                                                            </p>

                                                            <p className="text-xs text-gray-500 truncate">

                                                                {member.member_code || '-'}

                                                            </p>

                                                        </div>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveSelectedMember(
                                                                member.id
                                                            )
                                                        }
                                                        disabled={
                                                            addingMembers ||
                                                            updatingMembers
                                                        }
                                                        className="p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 ml-2 disabled:opacity-50"
                                                    >

                                                        <X className="w-4 h-4" />

                                                    </button>

                                                </div>

                                            ))

                                        )}

                                    </div>

                                </div>

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
                                    updatingMembers
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
                                    updatingMembers ||
                                    (modalMode === 'create' && selectedMemberIds.length === 0)
                                }
                                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-[#0B1D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#132D5E] shadow-sm disabled:opacity-50 transition-colors"
                            >

                                {addingMembers || updatingMembers ? (

                                    <Loader className="w-4 h-4 animate-spin" />

                                ) : modalMode === 'create' ? (

                                    <Plus className="w-4 h-4" />

                                ) : (

                                    <CheckCircle className="w-4 h-4" />

                                )}

                                {modalMode === 'create'

                                    ? 'Add to Group'

                                    : 'Save Changes'

                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};

export default MemberGroups;