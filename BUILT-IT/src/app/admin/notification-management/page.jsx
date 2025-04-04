"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Send, ChevronDown, MessageSquareText,
  Bookmark, Mail, History, CheckCircle2, XCircle,
  List, Filter, X, AlertTriangle, Info, Loader2 // Added Loader2 for loading state
} from "lucide-react";

// Added a simple debounce helper (in a real app, consider lodash.debounce or similar)
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const TEMPLATES = {
  OFFICE_CALL: {
    subject: "Urgent Meeting Request",
    message: "You are requested to visit the administration office in Room 205 by tomorrow 3 PM."
  },
  FEE_REMINDER: {
    subject: "Fee Payment Reminder",
    message: "Kindly clear your pending tuition fees by the end of this week."
  },
  DOCUMENT_SUBMISSION: {
    subject: "Document Submission Required",
    message: "Please submit your pending academic documents to the department office."
  },
  CUSTOM: {
    subject: "",
    message: ""
  }
};

// Animation variants (kept simple)
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// SUGGESTION: Consider breaking this down into smaller components
// e.g., NotificationForm, RecipientFilters, StudentTable, NotificationHistory
export default function NotificationManagement() {
  const [activeTab, setActiveTab] = useState('compose');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Compose State
  const [filters, setFilters] = useState({
    batch: "", dept: "", hostel: "", room: "", floor: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sendStatus, setSendStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [sending, setSending] = useState(false); // Loading state for send button
  const [showTemplates, setShowTemplates] = useState(false);

  // History State
  const [notifications, setNotifications] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({
    start: "", end: "", status: "all", search: ""
  });
  const [expandedNotification, setExpandedNotification] = useState(null); // ID of the expanded notification

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Ensure loading is true at the start
      try {
        // SUGGESTION: Add more specific error handling for network/parsing issues
        const [studentsRes, notificationsRes] = await Promise.all([
          fetch("/api/admin/students"), // Replace with your actual API endpoint
          fetch("/api/notifications")   // Replace with your actual API endpoint
        ]);

        if (!studentsRes.ok) throw new Error(`Failed to fetch students: ${studentsRes.statusText}`);
        if (!notificationsRes.ok) throw new Error(`Failed to fetch notifications: ${notificationsRes.statusText}`);

        const studentsData = await studentsRes.json();
        const notificationsData = await notificationsRes.json();

        setStudents(studentsData || []); // Ensure it's an array
        setNotifications(notificationsData || []); // Ensure it's an array
      } catch (error) {
        console.error("Data fetch error:", error);
        // Set an error state to show in the UI
        setSendStatus({ type: 'error', message: `Failed to load data: ${error.message}` });
        setStudents([]); // Set to empty array on error
        setNotifications([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Runs once on mount

  // Filter students based on filters and search query
  useEffect(() => {
    const filtered = students.filter(student => {
      // Basic check if student object and properties exist
      if (!student || typeof student.full_name !== 'string') return false;

      return (
        (!filters.batch || String(student.batch) === filters.batch) &&
        (!filters.dept || student.department === filters.dept) &&
        (!filters.hostel || student.hostel_block === filters.hostel) &&
        (!filters.room || student.room_number === filters.room) &&
        (!filters.floor || String(student.floor) === filters.floor) &&
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredStudents(filtered);
  }, [students, filters, searchQuery]);

  // Apply template content
  const applyTemplate = (templateKey) => {
    const template = TEMPLATES[templateKey];
    if (template) {
        setForm({
            subject: template.subject,
            message: template.message
        });
    }
    setShowTemplates(false);
  };

  // Handle sending notification
  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim() || !selectedRecipients.length) {
      setSendStatus({ type: 'error', message: 'Subject, message, and recipients are required.' });
      // No auto-dismiss for validation errors - let user fix them
      return;
    }

    setSending(true); // Start loading state
    setSendStatus(null); // Clear previous status

    try {
      const res = await fetch("/api/notifications", { // Replace with your actual API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject,
          message: form.message,
          recipients: selectedRecipients
        })
      });

      // Check for non-OK response status (like 4xx, 5xx)
      if (!res.ok) {
        let errorMsg = `Failed to send notification: ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorData.message || errorMsg; // Use backend error message if available
        } catch (parseError) {
          // Ignore if response is not JSON
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      // Assuming backend returns { success: true, notification: {...} } or { success: false, error: "..." }
      if (data.success && data.notification) {
        setSendStatus({ type: 'success', message: 'Notification sent successfully!' });
        setForm({ subject: "", message: "" }); // Reset form
        setSelectedRecipients([]); // Clear recipients
        setNotifications(prev => [data.notification, ...prev]); // Add to history
        // Optional: Auto dismiss success message after 5 seconds
        // setTimeout(() => setSendStatus(null), 5000);
      } else {
         // Use specific error from backend if available, otherwise generic
        setSendStatus({ type: 'error', message: data.error || 'An unknown error occurred.' });
      }
    } catch (error) {
      console.error("Send notification error:", error);
      // Show network or specific error message
      setSendStatus({ type: 'error', message: error.message || 'Network error. Please try again.' });
       // Optional: Auto dismiss error message after 5 seconds
      // setTimeout(() => setSendStatus(null), 5000);
    } finally {
      setSending(false); // End loading state
    }
  };

  // Filter notification history
  const filteredHistory = useMemo(() => {
    return notifications.filter(notification => {
      if (!notification || !notification.sent_at) return false; // Basic validation

      const date = new Date(notification.sent_at);
      // Ensure dates are valid before comparing
      // *** FIXED: Changed const to let to allow reassignment ***
      let start = historyFilters.start ? new Date(historyFilters.start) : null;
      let end = historyFilters.end ? new Date(historyFilters.end) : null;
      if (start && isNaN(start.getTime())) start = null; // Invalidate if date parsing failed
      if (end && isNaN(end.getTime())) end = null;      // Invalidate if date parsing failed

      // Adjust end date to include the whole day
      if (end) end.setHours(23, 59, 59, 999);

      const matchesDate = (!start || date >= start) && (!end || date <= end);
      const matchesStatus = (historyFilters.status === 'all' || notification.status === historyFilters.status);
      const matchesSearch = [notification.subject, notification.message]
        .some(text => typeof text === 'string' && text.toLowerCase().includes(historyFilters.search.toLowerCase()));

      return matchesDate && matchesStatus && matchesSearch;
    });
  }, [notifications, historyFilters]);

  // Get unique values for filter dropdowns
  const uniqueValues = useCallback((key, transform = v => v) => {
    const values = students
      .map(s => s && s[key] ? transform(s[key]) : null) // Handle potential undefined values
      .filter(Boolean); // Remove null/undefined
    return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b))); // Sort alphabetically/numerically
  }, [students]);


  // Reset compose filters and search
  const resetFilters = () => {
    setFilters({ batch: "", dept: "", hostel: "", room: "", floor: "" });
    setSearchQuery("");
    // No need to clear selected recipients here, maybe add a separate button?
  };

  // Clear selected recipients
  const clearSelectedRecipients = () => {
    setSelectedRecipients([]);
  };

  // Debounced search handler
  const debouncedSetSearchQuery = useCallback(debounce(setSearchQuery, 300), []);


  // Initial loading screen
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-700 mt-4">Loading System Data</h2>
        <p className="text-gray-500 mt-2 text-sm">Please wait...</p>
      </motion.div>
    </div>
  );

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Mail className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Notification Center</h1>
                <p className="text-gray-500 text-xs md:text-sm">Manage and send notifications to students</p>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-2 bg-gray-100 p-1 rounded-lg" // Tab container style
            >
              <button
                onClick={() => setActiveTab('compose')}
                className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium w-full md:w-auto ${
                  activeTab === 'compose'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Compose</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium w-full md:w-auto ${
                  activeTab === 'history'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'compose' ? (
            // Compose Tab Content
            // SUGGESTION: Extract this motion.div block into a <ComposeTab /> component
            <motion.div
              key="compose"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8"
            >
              {/* Compose Form Section */}
              {/* SUGGESTION: Extract this motion.div into a <NotificationForm /> component */}
              <motion.div
                variants={slideUp}
                className="lg:col-span-4 bg-white rounded-lg shadow border border-gray-200 p-5 md:p-6"
              >
                <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-800">
                  <Send className="w-5 h-5 text-indigo-600" />
                  New Notification
                </h2>

                {/* Form */}
                <form onSubmit={handleSend} className="space-y-5">
                  {/* Template Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                      aria-expanded={showTemplates}
                      aria-haspopup="listbox"
                    >
                      <span className="font-medium text-gray-700">
                        {form.subject && form.message ? "Custom / Applied Template" : "Select Template (Optional)"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showTemplates ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showTemplates && (
                        <motion.ul // Use listbox role
                          role="listbox"
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto max-h-60 focus:outline-none"
                        >
                          {Object.entries(TEMPLATES).map(([key, template]) => (
                            <motion.li
                              key={key}
                              role="option"
                              aria-selected={form.subject === template.subject && form.message === template.message}
                              whileHover={{ backgroundColor: 'rgba(239, 246, 255, 1)' }} // indigo-50
                              onClick={() => applyTemplate(key)}
                              className="p-3 cursor-pointer border-b border-gray-100 last:border-0 text-sm"
                            >
                              <div className="font-medium text-gray-800">{template.subject || 'Custom Template'}</div>
                              {template.message && (
                                <div className="text-xs text-gray-500 truncate mt-1">{template.message}</div>
                              )}
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1.5 text-gray-700">Subject</label>
                    <input
                      id="subject"
                      value={form.subject}
                      onChange={e => setForm({...form, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm shadow-sm"
                      placeholder="Enter notification subject"
                      required
                    />
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1.5 text-gray-700">Message</label>
                    <textarea
                      id="message"
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      rows="6" // Increased rows slightly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm resize-y shadow-sm"
                      placeholder="Type your message here..."
                      required
                    />
                  </div>

                  {/* Selected Recipients Display */}
                  {/* SUGGESTION: Extract into a <SelectedRecipients /> component */}
                  <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-700" />
                        <span className="text-sm font-medium text-gray-800">Recipients</span>
                      </div>
                      <motion.div
                        key={selectedRecipients.length} // Animate when count changes
                        animate={{ scale: selectedRecipients.length ? [1, 1.15, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full text-xs font-bold"
                      >
                        {selectedRecipients.length}
                      </motion.div>
                    </div>

                    {selectedRecipients.length > 0 ? (
                      <div className="flex flex-col">
                        <div className="flex justify-end mb-1">
                           <button
                            type="button"
                            onClick={clearSelectedRecipients}
                            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                             aria-label="Clear all selected recipients"
                          >
                            <X className="w-3 h-3"/> Clear All
                          </button>
                        </div>
                        <div className="h-28 overflow-y-auto text-xs space-y-1 pr-1 bg-white rounded border border-indigo-100 p-2 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-gray-100">
                          {selectedRecipients.map(email => (
                            <div
                              key={email}
                              className="flex items-center justify-between group bg-gray-50 px-1.5 py-1 rounded"
                            >
                              <span className="truncate text-gray-700" title={email}>{email}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedRecipients(prev => prev.filter(e => e !== email))}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                                aria-label={`Remove ${email}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-gray-500 text-xs italic">
                        Select recipients from the list on the right.
                      </div>
                    )}
                  </div>

                  {/* Send Button */}
                  <motion.button
                    type="submit"
                    disabled={sending} // Disable when sending
                    whileHover={{ scale: sending ? 1 : 1.02 }}
                    whileTap={{ scale: sending ? 1 : 0.98 }}
                    className={`w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-md hover:bg-indigo-700 transition-colors font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${sending ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Notification</span>
                      </>
                    )}
                  </motion.button>

                   {/* Send Status Message */}
                   {/* SUGGESTION: Use aria-live="polite" for screen readers */}
                  <AnimatePresence>
                    {sendStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        // role="alert" // Add role="alert" for better accessibility
                        className={`p-3 rounded-md flex items-start gap-2 text-sm border ${
                          sendStatus.type === 'success'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        {sendStatus.type === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                        )}
                        <span className="flex-grow">{sendStatus.message}</span>
                         {/* Manual dismiss button */}
                         <button onClick={() => setSendStatus(null)} className="ml-2 text-gray-500 hover:text-gray-700" aria-label="Dismiss message">
                             <X className="w-4 h-4" />
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>

              {/* Recipient Management Section */}
              {/* SUGGESTION: Extract into a <RecipientManager /> component */}
              <motion.div
                variants={slideUp}
                className="lg:col-span-8 bg-white rounded-lg shadow border border-gray-200 p-5 md:p-6"
              >
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Manage Recipients ({filteredStudents.length})
                  </h2>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Mobile Filter Toggle */}
                    <button
                      onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                      className="md:hidden flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 text-sm shadow-sm"
                      aria-controls="mobile-filters"
                      aria-expanded={mobileFiltersOpen}
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filters</span>
                    </button>

                     {/* Clear Filters */}
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-red-50 text-red-700 hover:border-red-300 text-sm shadow-sm transition-colors"
                      aria-label="Clear all filters"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>

                    {/* Select/Deselect All (Filtered) */}
                    <button
                      onClick={() => {
                        const allFilteredEmails = filteredStudents.map(s => s.email);
                        // If all currently filtered are selected, deselect them. Otherwise, select all filtered.
                        const areAllFilteredSelected = filteredStudents.length > 0 && selectedRecipients.length === allFilteredEmails.length && allFilteredEmails.every(email => selectedRecipients.includes(email));
                        setSelectedRecipients(areAllFilteredSelected ? [] : allFilteredEmails);
                      }}
                      disabled={filteredStudents.length === 0}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
                    >
                      {filteredStudents.length > 0 && selectedRecipients.length === filteredStudents.length && filteredStudents.every(s => selectedRecipients.includes(s.email))
                        ? 'Deselect All Visible'
                        : 'Select All Visible'}
                    </button>
                  </div>
                </div>

                 {/* Filters Section */}
                 {/* SUGGESTION: Extract into a <FilterControls /> component */}
                <div>
                    {/* Mobile Filters Panel */}
                    <AnimatePresence>
                      {mobileFiltersOpen && (
                        <motion.div
                          id="mobile-filters"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="md:hidden border-t border-b border-gray-200 my-4 py-4 overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            {/* Simplified filters for mobile example */}
                             <select value={filters.batch} onChange={e => setFilters({...filters, batch: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
                               <option value="">All Batches</option>
                               {uniqueValues('batch').map(batch => <option key={batch} value={batch}>{batch}</option>)}
                             </select>
                             <select value={filters.dept} onChange={e => setFilters({...filters, dept: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
                               <option value="">All Departments</option>
                               {uniqueValues('department').map(dept => <option key={dept} value={dept}>{dept}</option>)}
                             </select>
                             <input
                              type="text"
                              placeholder="Search students..."
                              defaultValue={searchQuery} // Use defaultValue with debounce
                              onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                              className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                             />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                     {/* Desktop Filters */}
                    <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-5">
                        {/* Select filters */}
                        {[
                          { key: 'batch', label: 'All Batches', transform: (v) => v },
                          { key: 'department', label: 'All Departments', transform: (v) => v },
                          { key: 'hostel_block', label: 'All Hostels', transform: (v) => `Block ${v}` },
                          { key: 'floor', label: 'All Floors', transform: (v) => `Floor ${v}` },
                          { key: 'room_number', label: 'All Rooms', transform: (v) => `Room ${v}` },
                        ].map(filter => (
                          <select
                            key={filter.key}
                            value={filters[filter.key.split('_')[0]]} // Use simplified key for state
                            onChange={e => setFilters({ ...filters, [filter.key.split('_')[0]]: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white appearance-none"
                            aria-label={`Filter by ${filter.key.replace('_', ' ')}`}
                          >
                            <option value="">{filter.label}</option>
                            {uniqueValues(filter.key).map(value => (
                              <option key={value} value={value}>{filter.transform(value)}</option>
                            ))}
                          </select>
                        ))}

                         {/* Search Input with Debounce */}
                        <div className="relative md:col-span-2 lg:col-span-2 xl:col-span-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Search students..."
                              defaultValue={searchQuery} // Use defaultValue with debounce
                              onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                              aria-label="Search students by name"
                            />
                        </div>
                    </div>
                </div>


                {/* Student List Table */}
                {/* SUGGESTION: Extract into a <StudentTable /> component */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {/* Checkbox Header */}
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-16">
                             <input
                              type="checkbox"
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              checked={filteredStudents.length > 0 && selectedRecipients.length === filteredStudents.length && filteredStudents.every(s => selectedRecipients.includes(s.email))}
                              onChange={() => {
                                  const allFilteredEmails = filteredStudents.map(s => s.email);
                                  const areAllFilteredSelected = filteredStudents.length > 0 && selectedRecipients.length === allFilteredEmails.length && allFilteredEmails.every(email => selectedRecipients.includes(email));
                                  setSelectedRecipients(areAllFilteredSelected ? [] : allFilteredEmails);
                              }}
                              aria-label="Select all visible students"
                              disabled={filteredStudents.length === 0}
                            />
                          </th>
                          {/* Other Headers */}
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Department</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                           {/* Add other relevant columns if needed */}
                           {/* <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Batch</th> */}
                           {/* <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Hostel</th> */}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredStudents.map((student, index) => (
                          <motion.tr
                            key={student.email} // Use a unique key
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                            className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/50`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedRecipients.includes(student.email)}
                                onChange={() => setSelectedRecipients(prev =>
                                  prev.includes(student.email)
                                    ? prev.filter(e => e !== student.email)
                                    : [...prev, student.email]
                                )}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                aria-label={`Select ${student.full_name}`}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 truncate" title={student.full_name}>{student.full_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 truncate" title={student.department}>{student.department}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 truncate" title={student.email}>{student.email}</td>
                             {/* Add other relevant data cells */}
                             {/* <td className="px-4 py-3 text-sm text-gray-600">{student.batch}</td> */}
                             {/* <td className="px-4 py-3 text-sm text-gray-600">{student.hostel_block ? `Block ${student.hostel_block}` : '-'}</td> */}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                   {/* No Results Message */}
                  {filteredStudents.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10 px-4 text-gray-500"
                    >
                      <Info className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-medium">No Students Found</p>
                      <p className="text-xs">Try adjusting your filters or search query.</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>

          ) : (
             // History Tab Content
             // SUGGESTION: Extract this motion.div block into a <HistoryTab /> component
            <motion.div
              key="history"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
              className="bg-white rounded-lg shadow border border-gray-200 p-5 md:p-6"
            >
                {/* History Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <History className="w-5 h-5 text-indigo-600" />
                  Notification History ({filteredHistory.length})
                </h2>

                <button
                  onClick={() => setHistoryFilters({ start: "", end: "", status: "all", search: "" })}
                   className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-red-50 text-red-700 hover:border-red-300 text-sm shadow-sm transition-colors"
                   aria-label="Clear history filters"
                >
                  <X className="w-4 h-4" />
                  <span>Clear Filters</span>
                </button>
              </div>

               {/* History Filters */}
               {/* SUGGESTION: Extract into a <HistoryFilters /> component */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {/* Date Inputs */}
                <div className="relative">
                  <label htmlFor="history-start-date" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-500">From</label>
                  <input
                    id="history-start-date"
                    type="date"
                    value={historyFilters.start}
                    onChange={e => setHistoryFilters({...historyFilters, start: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                     aria-label="Filter history start date"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="history-end-date" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-500">To</label>
                  <input
                     id="history-end-date"
                    type="date"
                    value={historyFilters.end}
                    onChange={e => setHistoryFilters({...historyFilters, end: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                    aria-label="Filter history end date"
                  />
                </div>

                 {/* Status Select */}
                <select
                  value={historyFilters.status}
                  onChange={e => setHistoryFilters({...historyFilters, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white appearance-none"
                  aria-label="Filter history by status"
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  {/* Add other statuses if applicable */}
                </select>

                 {/* History Search */}
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                   <input
                      type="text"
                      placeholder="Search subject/message..."
                      value={historyFilters.search}
                      onChange={e => setHistoryFilters({...historyFilters, search: e.target.value})} // Debounce might be useful here too for large histories
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                      aria-label="Search notification history"
                    />
                  </div>
              </div>

               {/* History Table */}
               {/* SUGGESTION: Extract into a <HistoryTable /> component */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Subject</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 uppercase tracking-wider max-w-xs">Message Snippet</th>
                        <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Recipients</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredHistory.map((notification, index) => (
                        <tr
                         key={notification.notification_id} // Ensure unique key
                         className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/50`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {notification.sent_at ? new Date(notification.sent_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 truncate" title={notification.subject}>
                            {notification.subject}
                          </td>
                           <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={notification.message}>
                            {notification.message}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              notification.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800' // Add other status styles if needed
                            }`}>
                              {notification.status === 'success' ? <CheckCircle2 className="w-3 h-3 mr-1"/> : <XCircle className="w-3 h-3 mr-1"/>}
                              {notification.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center relative">
                            {/* Expandable Recipient List Button */}
                             <button
                              onClick={() => setExpandedNotification(
                                expandedNotification === notification.notification_id
                                  ? null
                                  : notification.notification_id
                              )}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 mx-auto disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                              disabled={!notification.recipients || notification.recipients.length === 0}
                              aria-expanded={expandedNotification === notification.notification_id}
                              aria-controls={`recipients-${notification.notification_id}`}
                            >
                              {notification.recipients?.length || 0}
                               <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                                expandedNotification === notification.notification_id ? 'rotate-180' : ''
                              }`}/>
                            </button>

                             {/* Recipient List Popup */}
                             <AnimatePresence>
                              {expandedNotification === notification.notification_id && (
                                <motion.div
                                  id={`recipients-${notification.notification_id}`}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute z-10 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 w-64 max-h-48 overflow-y-auto text-left scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                                >
                                  <div className="text-xs font-medium text-gray-500 mb-2 border-b pb-1">Recipients ({notification.recipients?.length || 0}):</div>
                                  {notification.recipients?.length > 0 ? (
                                      notification.recipients.map((email, index) => (
                                        <div
                                          key={index}
                                          className="text-xs text-gray-700 py-1 px-1.5 hover:bg-gray-100 rounded truncate"
                                          title={email}
                                        >
                                          {email}
                                        </div>
                                      ))
                                  ) : (
                                      <div className="text-xs text-gray-500 italic">No recipients found.</div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                 </div>
                 {/* No History Message */}
                 {filteredHistory.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10 px-4 text-gray-500"
                    >
                      <Info className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-medium">No Notifications Found</p>
                      <p className="text-xs">Try adjusting your filters or check back later.</p>
                    </motion.div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Optional: Add a footer */}
      {/* <footer className="text-center py-4 text-xs text-gray-400 border-t mt-8">
        Notification Management System &copy; {new Date().getFullYear()}
      </footer> */}
    </div>
  );
}