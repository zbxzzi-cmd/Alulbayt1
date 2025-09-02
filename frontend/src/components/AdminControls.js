import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

const AdminControls = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('programs');
  const [programTabs, setProgramTabs] = useState([]);
  const [statTabs, setStatTabs] = useState([]);
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

  const handleEditTab = (tab) => {
    setEditingTab({ ...tab, type: activeTab });
    setIsEditing(true);
  };

  const handleDeleteTab = async (tabId, type) => {
    if (window.confirm('Are you sure you want to delete this tab?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${backendUrl}/api/admin/${type}-tabs/${tabId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTabs(); // Refresh the list
      } catch (error) {
        console.error('Error deleting tab:', error);
        alert('Error deleting tab: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleSaveTab = async (e) => {
    e.preventDefault();
    try {
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
    }
  };

  const getBorderColorStyle = (tab) => {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDarkMode ? tab.border_color_dark : tab.border_color_light;
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="ds-bg-glass-light rounded-2xl p-6 mb-8 shadow-lg">
      <h2 className="ds-heading-lg mb-4">Admin Tab Management</h2>
      
      {/* Tab Selector */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'programs' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('programs')}
        >
          Program Tabs
        </button>
        <button
          className={`px-4 py-2 font-medium ml-6 transition-colors ${
            activeTab === 'stats' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          Stat Tabs
        </button>
      </div>
      
      {/* Add New Tab Button */}
      <button
        onClick={handleAddTab}
        className="ds-btn-base ds-btn-primary mb-4 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add New {activeTab === 'programs' ? 'Program' : 'Stat'} Tab
      </button>
      
      {/* Edit Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 99999 }}>
          <div className="ds-form-container w-full max-w-md max-h-[80vh] overflow-y-auto" style={{ zIndex: 100000 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="ds-heading-md">
                {editingTab.id ? 'Edit' : 'Add'} {editingTab.type === 'programs' ? 'Program' : 'Stat'} Tab
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveTab} className="space-y-4">
              <div>
                <label className="ds-form-label">Title *</label>
                <input
                  type="text"
                  value={editingTab.title}
                  onChange={(e) => setEditingTab({...editingTab, title: e.target.value})}
                  className="ds-form-input"
                  required
                />
              </div>
              
              {editingTab.type === 'programs' && (
                <>
                  <div>
                    <label className="ds-form-label">Description *</label>
                    <textarea
                      value={editingTab.description}
                      onChange={(e) => setEditingTab({...editingTab, description: e.target.value})}
                      className="ds-form-input"
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="ds-form-label">Image URL (Optional)</label>
                    <input
                      type="text"
                      value={editingTab.image || ''}
                      onChange={(e) => setEditingTab({...editingTab, image: e.target.value})}
                      className="ds-form-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </>
              )}
              
              {editingTab.type === 'stats' && (
                <div>
                  <label className="ds-form-label">Value *</label>
                  <input
                    type="text"
                    value={editingTab.value || ''}
                    onChange={(e) => setEditingTab({...editingTab, value: e.target.value})}
                    className="ds-form-input"
                    placeholder="e.g., 500+, 95%, 24/7"
                    required
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="ds-form-label">Light Mode Border</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingTab.border_color_light}
                      onChange={(e) => setEditingTab({...editingTab, border_color_light: e.target.value})}
                      className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{editingTab.border_color_light}</span>
                  </div>
                </div>
                
                <div>
                  <label className="ds-form-label">Dark Mode Border</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingTab.border_color_dark}
                      onChange={(e) => setEditingTab({...editingTab, border_color_dark: e.target.value})}
                      className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{editingTab.border_color_dark}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="ds-btn-base ds-btn-secondary flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ds-btn-base ds-btn-primary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="ds-body-sm mt-2">Processing...</p>
        </div>
      )}
    </div>
  );
};

export default AdminControls;