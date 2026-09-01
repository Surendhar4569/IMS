import { useState } from "react";
import { X, MessageSquare, MessageCircle, Search } from "lucide-react";

const TemplateMapperModal = ({
  isOpen,
  onClose,
  smsTemplates,
  whatsappTemplates,
  isLoading,
  onSubmit,
}) => {
  const [selectedSms, setSelectedSms] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to safely get template name (adjust property names if different)
  const getTemplateName = (template) => {
    return template.display_name;
  };

  // Filter logic based on search
  const filteredSms = smsTemplates.filter((t) =>
    getTemplateName(t).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredWhatsapp = whatsappTemplates.filter((t) =>
    getTemplateName(t).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Toggle Selection for SMS
  const handleSmsToggle = (id) => {
    setSelectedSms((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Toggle Selection for WhatsApp
  const handleWhatsappToggle = (id) => {
    setSelectedWhatsapp((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedSms, selectedWhatsapp);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#0B1D3A]">
            Map Templates to Group
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B1D3A] focus:border-[#0B1D3A] outline-none"
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT SIDE: SMS Templates */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-700">
                SMS Templates
              </h3>
            </div>
            <div className="flex-1 border border-gray-200 rounded-lg overflow-y-auto max-h-[55vh]">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">
                  Loading SMS templates...
                </div>
              ) : filteredSms.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No SMS templates found.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredSms.map((template) => (
                    <li
                      key={template.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSmsToggle(template.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSms.includes(template.id)}
                        onChange={() => handleSmsToggle(template.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#0B1D3A] focus:ring-[#0B1D3A]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {getTemplateName(template)}
                        </span>
                        {/* Display a snippet if body/content exists */}
                        {template.body && (
                          <span className="text-xs text-gray-500 truncate">
                            {template.body.substring(0, 50)}...
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: WhatsApp Templates */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-medium text-gray-700">
                WhatsApp Templates
              </h3>
            </div>
            <div className="flex-1 border border-gray-200 rounded-lg overflow-y-auto max-h-[55vh]">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">
                  Loading WhatsApp templates...
                </div>
              ) : filteredWhatsapp.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No WhatsApp templates found.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredWhatsapp.map((template) => (
                    <li
                      key={template.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleWhatsappToggle(template.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedWhatsapp.includes(template.id)}
                        onChange={() => handleWhatsappToggle(template.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#0B1D3A] focus:ring-[#0B1D3A]"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {getTemplateName(template)}
                        </span>
                        {template.body && (
                          <span className="text-xs text-gray-500 truncate">
                            {template.body.substring(0, 50)}...
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-600">
            {selectedSms.length} SMS & {selectedWhatsapp.length} WhatsApp
            selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                selectedSms.length === 0 && selectedWhatsapp.length === 0
              }
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedSms.length === 0 && selectedWhatsapp.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#0B1D3A] text-white hover:bg-[#15294a]"
              }`}
            >
              Map Selected Templates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMapperModal;
