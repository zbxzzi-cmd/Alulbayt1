import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';

const AdminControls = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('programs');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTab, setEditingTab] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    // Component loaded - admin controls ready
  }, [currentUser]);

  const handleAddTab = () => {
    const newTab = {
      type: activeTab,
      title: '',
      description: activeTab === 'programs' ? '' : undefined,
      value: activeTab === 'stats' ? '' : undefined,
      image: activeTab === 'programs' ? '' : undefined,
      border_color_light: activeTab === 'programs' ? '#E0F7FA' : '#4A90A4',
      border_color_dark: activeTab === 'programs' ? '#4A90A4' : '#B8739B'
    };
    setEditingTab(newTab);
    setIsEditing(true);
  };

  const handleDeleteTab = async (tabId, type) => {
    if (window.confirm('Are you sure you want to delete this tab?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${backendUrl}/api/admin/${type}-tabs/${tabId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Tab deleted successfully!');
      } catch (error) {
        console.error('Error deleting tab:', error);
        alert('Error deleting tab: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleSaveTab = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      if (editingTab.id) {
        // Update existing tab
        await axios.put(
          `${backendUrl}/api/admin/${editingTab.type}-tabs/${editingTab.id}`,
          editingTab,
          { headers }
        );
      } else {
        // Create new tab
        await axios.post(
          `${backendUrl}/api/admin/${editingTab.type}-tabs`,
          editingTab,
          { headers }
        );
      }
      
      setIsEditing(false);
      setEditingTab(null);
      alert('Tab saved successfully!');
    } catch (error) {
      console.error('Error saving tab:', error);
      alert('Error saving tab: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
    return null;
  }

  return (
    <>
      {/* Admin Controls Panel - Theme Aware */}
      <div className="rounded-2xl p-6 mb-8 shadow-lg admin-controls-panel">
        <h2 className="text-2xl font-bold mb-4 admin-title">Admin Tab Management</h2>
        
        {/* Tab Selector */}
        <div className="flex border-b admin-border mb-4">
          <button
            className={`px-4 py-2 font-medium transition-colors admin-tab-button ${
              activeTab === 'programs' ? 'admin-tab-active' : 'admin-tab-inactive'
            }`}
            onClick={() => setActiveTab('programs')}
          >
            Program Tabs
          </button>
          <button
            className={`px-4 py-2 font-medium ml-6 transition-colors admin-tab-button ${
              activeTab === 'stats' ? 'admin-tab-active' : 'admin-tab-inactive'
            }`}
            onClick={() => setActiveTab('stats')}
          >
            Stat Tabs
          </button>
        </div>
        
        {/* Add New Tab Button - Matching Enroll Now Style */}
        <button
          onClick={handleAddTab}
          className="btn-primary mb-4 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New {activeTab === 'programs' ? 'Program' : 'Stat'} Tab
        </button>
        
        {/* Loading Message */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 admin-spinner mx-auto"></div>
            <p className="admin-loading-text mt-2 text-sm">Processing...</p>
          </div>
        )}
      </div>

      {/* Modal with MAXIMUM Z-Index - Above Everything */}
      {isEditing && (
        <div 
          className="modal-backdrop"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2147483647, // Maximum possible z-index
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            className="modal-content"
            style={{ 
              zIndex: 2147483647,
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              border: '3px solid rgba(180, 140, 255, 0.4)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingTab.id ? 'Edit' : 'Add'} {editingTab.type === 'programs' ? 'Program' : 'Stat'} Tab
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveTab} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Title *</label>
                <input
                  type="text"
                  value={editingTab.title}
                  onChange={(e) => setEditingTab({...editingTab, title: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none bg-white text-gray-900"
                  required
                  style={{ 
                    backgroundColor: 'white !important',
                    color: '#1f2937 !important'
                  }}
                />
              </div>
              
              {editingTab.type === 'programs' && (
                <>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Description *</label>
                    <textarea
                      value={editingTab.description}
                      onChange={(e) => setEditingTab({...editingTab, description: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none bg-white text-gray-900"
                      rows="3"
                      required
                      style={{ 
                        backgroundColor: 'white !important',
                        color: '#1f2937 !important'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Image URL (Optional)</label>
                    <input
                      type="text"
                      value={editingTab.image || ''}
                      onChange={(e) => setEditingTab({...editingTab, image: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none bg-white text-gray-900"
                      placeholder="https://example.com/image.jpg"
                      style={{ 
                        backgroundColor: 'white !important',
                        color: '#1f2937 !important'
                      }}
                    />
                  </div>
                </>
              )}
              
              {editingTab.type === 'stats' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">Value *</label>
                  <input
                    type="text"
                    value={editingTab.value || ''}
                    onChange={(e) => setEditingTab({...editingTab, value: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none bg-white text-gray-900"
                    placeholder="e.g., 500+, 95%, 24/7"
                    required
                    style={{ 
                      backgroundColor: 'white !important',
                      color: '#1f2937 !important'
                    }}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">Light Mode Border</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editingTab.border_color_light}
                      onChange={(e) => setEditingTab({...editingTab, border_color_light: e.target.value})}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 font-mono">{editingTab.border_color_light}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">Dark Mode Border</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editingTab.border_color_dark}
                      onChange={(e) => setEditingTab({...editingTab, border_color_dark: e.target.value})}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 font-mono">{editingTab.border_color_dark}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-base"
                  style={{ zIndex: 2147483647 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-base disabled:opacity-50"
                  style={{ zIndex: 2147483647 }}
                >
                  {loading ? 'Saving...' : 'Save Tab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminControls;

export default AdminControls;