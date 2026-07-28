import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  FileText,
  Hash,
  Save,
  RotateCcw,
  Eye,
  Plus,
  X,
  RefreshCw,
  Loader,
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
} from 'lucide-react';

const pcaApi = `${import.meta.env.VITE_API_URL}/pca`;

const PostIncidentReviewForm = () => {
  const { token, user } = useAuth();

  const [closedIncidents, setClosedIncidents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    rca: true,
    review: true,
    actions: true,
    summary: true,
  });

  // Form data
  const [formData, setFormData] = useState({
    incident_id: '',
    contributing_factors: '',
    rca: '',
    what_went_well: '',
    what_went_wrong: '',
    lessons_learned: '',
    executive_summary: '',
    recommendations: '',
    action_items: [{ action: '', owner: '', due_date: '', status: 'pending' }],
  });

  const getAuthConfig = () =>
    token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    fetchClosedIncidents();
    fetchReviews();
  }, []);

  useEffect(() => {
    if (!message.text) return;
    const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const fetchClosedIncidents = async () => {
    try {
      setLoadingIncidents(true);
      const res = await axios.get(`${pcaApi}/closed-incidents`, getAuthConfig());
      setClosedIncidents(res.data?.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to fetch closed incidents' });
    } finally {
      setLoadingIncidents(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await axios.get(`${pcaApi}/reviews`, getAuthConfig());
      setReviews(res.data?.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to fetch reviews' });
    } finally {
      setLoadingReviews(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  // Check if an incident already has a review
  const hasReview = (incidentId) => reviews.some((r) => r.incident_id === incidentId);

  const getReviewForIncident = (incidentId) => reviews.find((r) => r.incident_id === incidentId);

  const openFormModal = (incident) => {
    const existingReview = getReviewForIncident(incident.id);
    setSelectedIncident(incident);

    if (existingReview) {
      setEditingReviewId(existingReview.id);
      const parsedActions = Array.isArray(existingReview.action_items)
        ? existingReview.action_items
        : JSON.parse(existingReview.action_items || '[]');

      setFormData({
        incident_id: incident.id,
        contributing_factors: existingReview.contributing_factors || '',
        rca: existingReview.rca || '',
        what_went_well: existingReview.what_went_well || '',
        what_went_wrong: existingReview.what_went_wrong || '',
        lessons_learned: existingReview.lessons_learned || '',
        executive_summary: existingReview.executive_summary || '',
        recommendations: existingReview.recommendations || '',
        action_items: parsedActions.length > 0 ? parsedActions : [{ action: '', owner: '', due_date: '', status: 'pending' }],
      });
    } else {
      setEditingReviewId(null);
      setFormData({
        incident_id: incident.id,
        contributing_factors: '',
        rca: '',
        what_went_well: '',
        what_went_wrong: '',
        lessons_learned: '',
        executive_summary: '',
        recommendations: '',
        action_items: [{ action: '', owner: '', due_date: '', status: 'pending' }],
      });
    }

    setExpandedSections({ rca: true, review: true, actions: true, summary: true });
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setSelectedIncident(null);
    setEditingReviewId(null);
  };

  const openDetailModal = (review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReview(null);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleActionItemChange = (index, field, value) => {
    const newActions = [...formData.action_items];
    newActions[index] = { ...newActions[index], [field]: value };
    setFormData((prev) => ({ ...prev, action_items: newActions }));
  };

  const addActionItem = () => {
    setFormData((prev) => ({
      ...prev,
      action_items: [...prev.action_items, { action: '', owner: '', due_date: '', status: 'pending' }],
    }));
  };

  const removeActionItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      action_items: prev.action_items.filter((_, i) => i !== index),
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rca) {
      setMessage({ type: 'error', text: 'Root Cause Analysis is required' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        incident_id: Number(formData.incident_id),
        contributing_factors: formData.contributing_factors || null,
        rca: formData.rca || null,
        what_went_well: formData.what_went_well || null,
        what_went_wrong: formData.what_went_wrong || null,
        lessons_learned: formData.lessons_learned || null,
        executive_summary: formData.executive_summary || null,
        recommendations: formData.recommendations || null,
        action_items: formData.action_items.filter((a) => a.action.trim()),
        created_by: user?.id ? Number(user.id) : null,
      };

      if (editingReviewId) {
        await axios.put(`${pcaApi}/reviews/${editingReviewId}`, payload, getAuthConfig());
        setMessage({ type: 'success', text: 'Review updated successfully' });
      } else {
        await axios.post(`${pcaApi}/reviews`, payload, getAuthConfig());
        setMessage({ type: 'success', text: 'Review created successfully' });
      }

      closeFormModal();
      await fetchReviews();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save review' });
    } finally {
      setSaving(false);
    }
  };

  // Severity helpers
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'LOW': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'MEDIUM': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'HIGH': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'CRITICAL': return <AlertCircle className="w-3.5 h-3.5" />;
      default: return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  // Filtering
  const filteredIncidents = useMemo(() => {
    return closedIncidents.filter((inc) => {
      const matchesSearch = !searchTerm || (inc.incident_code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = !severityFilter || inc.severity_level === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [closedIncidents, searchTerm, severityFilter]);

  const IncidentTypeLabels = {
    ACCIDENT: 'Accident',
    AIRCRAFT_CRASH: 'Aircraft Crash',
    AIRCRAFT_REFUELLING: 'Aircraft Refuelling Incidents',
    ATTACK_ON_PASSENGER: 'Attack on Passenger',
    BOMB_THREAT: 'Bomb Threat',
    COMMUNICATION_FAILURES: 'Communication Failures',
    DANGEROUS_GOODS: 'Dangerous Goods Incidents',
    EQUIPMENT_FAILURES: 'Equipment Failures',
    FIRE_AND_SMOKE: 'Fire and Smoke Incidents',
    FIRE_IN_AIRCRAFT: 'Fire in the Aircraft',
    FOREIGN_OBJECT_DEBRIS: 'Foreign Object Debris (FOD)',
    GROUND_HANDLING_ACCIDENTS: 'Ground Handling Accidents',
    HIJACK_SITUATION: 'Hijack Situation',
    INFLIGHT_MASS_CASUALTIES: 'In-flight Mass Casualties',
    MANUAL_HANDLING: 'Manual Handling Injuries',
    MEDICAL_EMERGENCY: 'Medical Emergency',
    NEAR_MISSES: 'Near Misses',
    PASSENGER_SECURITY: 'Passenger Security Incidents',
    RUNWAY_INCURSIONS: 'Runway Incursions',
    SLIPS_TRIPS_FALLS: 'Slips, Trips and Falls',
    VEHICLE_COLLISIONS_AIRSIDE: 'Vehicle Collisions on the Airside',
    WEATHER_RELATED: 'Weather-Related Incidents',
    WILDLIFE_STRIKES: 'Wildlife Strikes',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="rounded-2xl bg-gradient-to-r from-[#0B1D3A] via-[#132D5E] to-[#1A3A6E] p-8 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-blue-300" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">Continuous Improvement</span>
                </div>
                <h1 className="text-4xl font-bold mb-2">Post-Incident RCA & Review</h1>
                <p className="text-blue-100 max-w-2xl">Root Cause Analysis & Systematic Review for closed incidents</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <CheckCircle className="w-5 h-5 mb-2 text-green-300" />
                  <div className="text-2xl font-bold">{closedIncidents.length}</div>
                  <div className="text-xs text-blue-200 mt-1">Closed Incidents</div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <FileText className="w-5 h-5 mb-2 text-yellow-300" />
                  <div className="text-2xl font-bold">{reviews.length}</div>
                  <div className="text-xs text-blue-200 mt-1">Reviews Done</div>
                </div>
                <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                  <AlertCircle className="w-5 h-5 mb-2 text-red-300" />
                  <div className="text-2xl font-bold">{closedIncidents.length - reviews.length}</div>
                  <div className="text-xs text-blue-200 mt-1">Pending Review</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <p className="flex-1 text-sm">{message.text}</p>
            <button onClick={() => setMessage({ type: '', text: '' })}><X className="w-4 h-4" /></button>
          </div>
        )}


        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by incident code (e.g., INC-001)..."
                className="w-full pl-10 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0B1D3A] focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0B1D3A] focus:ring-4 focus:ring-blue-100"
            >
              <option value="">All Severity</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Closed Incidents Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Closed Incidents</h2>
              <p className="text-sm text-gray-500 mt-1">Select an incident to create or view its post-incident review</p>
            </div>
            {loadingIncidents && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
          </div>

          {loadingIncidents ? (
            <div className="p-10 text-center">
              <Loader className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Loading closed incidents...</p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="p-10 text-center">
              <div className="bg-gray-50 rounded-full p-4 mb-4 mx-auto w-fit"><CheckCircle className="w-12 h-12 text-gray-400" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No closed incidents found</h3>
              <p className="text-gray-500 text-sm">Adjust filters or wait for incidents to be closed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Incident</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIncidents.map((incident) => {
                    const reviewExists = hasReview(incident.id);
                    const existingReview = getReviewForIncident(incident.id);

                    return (
                      <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">{incident.incident_code || 'N/A'}</span>
                              <p className="text-sm font-semibold text-gray-900 mt-1">{incident.incident_title || 'Untitled'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{IncidentTypeLabels[incident.incident_type] || incident.incident_type || '—'}</td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${getSeverityColor(incident.severity_level)}`}>
                            {getSeverityIcon(incident.severity_level)}
                            {incident.severity_level || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{incident.location_details || '—'}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{formatDate(incident.updated_at)}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {reviewExists ? (
                              <>
                                <button onClick={() => openDetailModal(existingReview)} className="px-3 py-2 rounded-xl bg-[#0B1D3A] text-white text-xs font-semibold hover:bg-[#132D5E] transition-all flex items-center gap-1.5">
                                  <Eye className="w-3.5 h-3.5" /> View
                                </button>
                                <button onClick={() => openFormModal(incident)} className="px-3 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-all flex items-center gap-1.5">
                                  <RotateCcw className="w-3.5 h-3.5" /> Edit
                                </button>
                              </>
                            ) : (
                              <button onClick={() => openFormModal(incident)} className="px-3 py-2 rounded-xl bg-[#0B1D3A] text-white text-xs font-semibold hover:bg-[#132D5E] transition-all flex items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5" /> Post Incident Action
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ==================== FORM MODAL ==================== */}
        {showFormModal && selectedIncident && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto">
            <div className="fixed inset-0 bg-gray-900/70" onClick={closeFormModal}></div>
            <div className="relative z-[61] w-full max-w-6xl my-8 mx-4 bg-white  shadow-2xl border border-gray-200 flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#0B1D3A] to-[#132D5E] text-white flex items-center justify-between sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                      {editingReviewId ? 'Edit Review' : 'New Review'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{selectedIncident.incident_title}</h3>
                  <p className="text-sm text-white/70 mt-1">
                    {selectedIncident.incident_code} · {selectedIncident.incident_type} · {selectedIncident.severity_level}
                  </p>
                </div>
                <button onClick={closeFormModal} className="rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="px-6 py-6 space-y-4">

                  {/* RCA Section */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <button type="button" onClick={() => toggleSection('rca')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#0B1D3A] rounded-lg"><Target className="w-4 h-4 text-white" /></div>
                        <div><h2 className="text-sm font-semibold text-gray-900">Root Cause Analysis</h2><p className="text-xs text-gray-500">Identify the underlying causes and contributing factors</p></div>
                      </div>
                      {expandedSections.rca ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {expandedSections.rca && (
                      <div className="p-4 space-y-4 border-t border-gray-100">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">RCA <span className="text-red-500">*</span></label>
                          <textarea value={formData.rca} onChange={(e) => handleInputChange('rca', e.target.value)} placeholder="What was the primary root cause of this incident?" rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent outline-none text-sm" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contributing Factors</label>
                          <textarea value={formData.contributing_factors} onChange={(e) => handleInputChange('contributing_factors', e.target.value)} placeholder="List contributing factors that led to this incident..." rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent outline-none text-sm" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Incident Review Section */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <button type="button" onClick={() => toggleSection('review')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#0B1D3A] rounded-lg"><FileText className="w-4 h-4 text-white" /></div>
                        <div><h2 className="text-sm font-semibold text-gray-900">Post Incident Review</h2><p className="text-xs text-gray-500">Evaluate what went well, what went wrong, and lessons learned</p></div>
                      </div>
                      {expandedSections.review ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {expandedSections.review && (
                      <div className="p-4 space-y-4 border-t border-gray-100">
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-2">What Went Well</label>
                          <textarea value={formData.what_went_well} onChange={(e) => handleInputChange('what_went_well', e.target.value)} placeholder="What aspects of the response worked effectively?" rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-red-700 mb-2">What Went Wrong</label>
                          <textarea value={formData.what_went_wrong} onChange={(e) => handleInputChange('what_went_wrong', e.target.value)} placeholder="What aspects of the response failed or were inadequate?" rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Lessons Learned</label>
                          <textarea value={formData.lessons_learned} onChange={(e) => handleInputChange('lessons_learned', e.target.value)} placeholder="What key lessons should be carried forward?" rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent outline-none text-sm" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Items Section */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <button type="button" onClick={() => toggleSection('actions')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#0B1D3A] rounded-lg"><CheckCircle className="w-4 h-4 text-white" /></div>
                        <div><h2 className="text-sm font-semibold text-gray-900">Action Items</h2><p className="text-xs text-gray-500">Track improvements and preventive measures</p></div>
                      </div>
                      {expandedSections.actions ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {expandedSections.actions && (
                      <div className="p-4 space-y-3 border-t border-gray-100">
                        {/* Column Headers */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action Item</div>
                          <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</div>
                          <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</div>
                          <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</div>
                          <div className="col-span-1"></div>
                        </div>

                        {formData.action_items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                            <input type="text" value={item.action} onChange={(e) => handleActionItemChange(idx, 'action', e.target.value)} placeholder="Describe the action..." className="col-span-4 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] outline-none text-sm bg-white" />
                            <input type="text" value={item.owner} onChange={(e) => handleActionItemChange(idx, 'owner', e.target.value)} placeholder="Responsible person..." className="col-span-3 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] outline-none text-sm bg-white" />
                            <input type="date" value={item.due_date} onChange={(e) => handleActionItemChange(idx, 'due_date', e.target.value)} className="col-span-2 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] outline-none text-sm bg-white" />
                            <select value={item.status} onChange={(e) => handleActionItemChange(idx, 'status', e.target.value)} className="col-span-2 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] outline-none text-sm bg-white">
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>
                            <button type="button" onClick={() => removeActionItem(idx)} className="col-span-1 p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button type="button" onClick={addActionItem} className="text-sm text-gray-600 hover:text-[#0B1D3A] flex items-center gap-1">
                          <Plus className="w-4 h-4" /> Add action item
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary Section */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <button type="button" onClick={() => toggleSection('summary')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#0B1D3A] rounded-lg"><FileText className="w-4 h-4 text-white" /></div>
                        <div><h2 className="text-sm font-semibold text-gray-900">Summary & Recommendations</h2><p className="text-xs text-gray-500">Executive summary and strategic recommendations</p></div>
                      </div>
                      {expandedSections.summary ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {expandedSections.summary && (
                      <div className="p-4 space-y-4 border-t border-gray-100">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Executive Summary</label>
                          <textarea value={formData.executive_summary} onChange={(e) => handleInputChange('executive_summary', e.target.value)} placeholder="Brief summary of the incident and key findings" rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                          <textarea value={formData.recommendations} onChange={(e) => handleInputChange('recommendations', e.target.value)} placeholder="Strategic recommendations to prevent recurrence" rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1D3A] focus:border-transparent outline-none text-sm" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 flex justify-end gap-3">
                  <button type="button" onClick={closeFormModal} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#0B1D3A] text-white rounded-xl text-sm font-semibold hover:bg-[#132D5E] disabled:opacity-50 flex items-center gap-2">
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingReviewId ? 'Update Review' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== DETAIL VIEW MODAL ==================== */}
        {showDetailModal && selectedReview && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto">
            <div className="fixed inset-0 bg-gray-900/70" onClick={closeDetailModal}></div>
            <div className="relative z-[61] w-full max-w-6xl my-8 mx-4 bg-white  shadow-2xl border border-gray-200 flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#0B1D3A] to-[#132D5E] text-white flex items-center justify-between sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Post-Incident Review</span>
                  </div>
                  <h3 className="text-xl font-bold">{selectedReview.incident_title || 'Incident Review'}</h3>
                  <p className="text-sm text-white/70 mt-1">
                    {selectedReview.incident_code || 'N/A'} · {IncidentTypeLabels[selectedReview.incident_type] || selectedReview.incident_type || '—'} · {selectedReview.severity_level || 'N/A'}
                  </p>
                </div>
                <button onClick={closeDetailModal} className="rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10"><X className="h-5 w-5" /></button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 space-y-5">

                {/* RCA */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-[#0B1D3A]" />
                    <span className="text-sm font-semibold text-gray-900">Root Cause Analysis</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReview.rca || 'No RCA documented'}</p>
                </div>

                {/* Contributing Factors */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-900">Contributing Factors</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReview.contributing_factors || 'No contributing factors documented'}</p>
                </div>

                {/* What Went Well / Wrong / Lessons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">What Went Well</span>
                    </div>
                    <p className="text-sm text-green-700 whitespace-pre-wrap">{selectedReview.what_went_well || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-800">What Went Wrong</span>
                    </div>
                    <p className="text-sm text-red-700 whitespace-pre-wrap">{selectedReview.what_went_wrong || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">Lessons Learned</span>
                    </div>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">{selectedReview.lessons_learned || 'N/A'}</p>
                  </div>
                </div>

                {/* Action Items */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4 text-[#0B1D3A]" />
                    <span className="text-sm font-semibold text-gray-900">Action Items</span>
                  </div>
                  {(() => {
                    const actions = Array.isArray(selectedReview.action_items) ? selectedReview.action_items : JSON.parse(selectedReview.action_items || '[]');
                    return actions.length > 0 ? (
                      <div>
                        {/* Column Headers — same as form */}
                        <div className="grid grid-cols-12 gap-2 items-center mb-2">
                          <div className="col-span-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action Item</div>
                          <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</div>
                          <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</div>
                          <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</div>
                          <div className="col-span-1"></div>
                        </div>

                        {/* Data Rows — same grid as form */}
                        <div className="space-y-2">
                          {actions.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg bg-white border border-gray-200">
                              <div className="col-span-4 text-sm text-gray-900">{item.action || '—'}</div>
                              <div className="col-span-3 text-sm text-gray-900">{item.owner || '—'}</div>
                              <div className="col-span-2 text-sm text-gray-900">{item.due_date || '—'}</div>
                              <div className="col-span-2">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${item.status === 'completed' ? 'bg-green-100 text-green-700' : item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : item.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {item.status === 'in-progress' ? 'In Progress' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                              </div>
                              <div className="col-span-1"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No action items</p>
                    );
                  })()}
                </div>

                {/* Executive Summary */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-[#0B1D3A]" />
                    <span className="text-sm font-semibold text-gray-900">Executive Summary</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReview.executive_summary || 'No summary provided'}</p>
                </div>

                {/* Recommendations */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-[#0B1D3A]" />
                    <span className="text-sm font-semibold text-gray-900">Recommendations</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReview.recommendations || 'No recommendations provided'}</p>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="text-xs font-medium text-gray-500 mb-1">Created On</div>
                    <div className="text-sm font-semibold text-gray-900">{formatDate(selectedReview.created_at)}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="text-xs font-medium text-gray-500 mb-1">Last Updated</div>
                    <div className="text-sm font-semibold text-gray-900">{formatDate(selectedReview.updated_at)}</div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 flex justify-between">
                <button onClick={() => { closeDetailModal(); openFormModal(closedIncidents.find((i) => i.id === selectedReview.incident_id) || selectedReview); }} className="px-4 py-2.5 bg-[#0B1D3A] text-white rounded-xl text-sm font-semibold hover:bg-[#132D5E] flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Edit Review
                </button>
                <button onClick={closeDetailModal} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostIncidentReviewForm;