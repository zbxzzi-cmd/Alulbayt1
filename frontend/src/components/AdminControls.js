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
    <div className="rounded-2xl p-6 mb-8 shadow-lg" style={{
      background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.85) 0%, rgba(45, 45, 75, 0.9) 30%, rgba(60, 60, 90, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      border: '2px solid rgba(180, 140, 255, 0.1225)',
      borderBottom: 'none',
      boxShadow: 'inset 0 2px 0 rgba(200, 150, 255, 0.245)',
      borderRadius: '24px'
    }}>
      <h2 className="text-2xl font-bold mb-4 text-white">Admin Tab Management</h2>
      
      {/* Tab Selector */}
      <div className="flex border-b border-purple-300 mb-4">
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'programs' 
              ? 'text-white border-b-2 border-purple-300' 
              : 'text-purple-200 hover:text-white'
          }`}
          onClick={() => setActiveTab('programs')}
        >
          Program Tabs
        </button>
        <button
          className={`px-4 py-2 font-medium ml-6 transition-colors ${
            activeTab === 'stats' 
              ? 'text-white border-b-2 border-purple-300' 
              : 'text-purple-200 hover:text-white'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          Stat Tabs
        </button>
      </div>
      
      {/* Add New Tab Button */}
      <button
        onClick={handleAddTab}
        className="mb-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-semibold shadow-lg"
      >
        <Plus className="h-4 w-4 inline mr-2" />
        Add New {activeTab === 'programs' ? 'Program' : 'Stat'} Tab
      </button>
      
      {/* Edit Form Modal - FIXED Z-INDEX AND BACKGROUND */}
      {isEditing && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ 
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-md max-h-[80vh] overflow-y-auto p-8 rounded-2xl shadow-2xl"
            style={{ 
              zIndex: 1000000,
              backgroundColor: 'white',
              border: '2px solid rgba(180, 140, 255, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingTab.id ? 'Edit' : 'Add'} {editingTab.type === 'programs' ? 'Program' : 'Stat'} Tab
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                style={{ fontSize: '18px' }}
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                  required
                  style={{ backgroundColor: 'white !important' }}
                />
              </div>
              
              {editingTab.type === 'programs' && (
                <>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Description *</label>
                    <textarea
                      value={editingTab.description}
                      onChange={(e) => setEditingTab({...editingTab, description: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                      rows="3"
                      required
                      style={{ backgroundColor: 'white !important' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Image URL (Optional)</label>
                    <input
                      type="text"
                      value={editingTab.image || ''}
                      onChange={(e) => setEditingTab({...editingTab, image: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                      placeholder="https://example.com/image.jpg"
                      style={{ backgroundColor: 'white !important' }}
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                    placeholder="e.g., 500+, 95%, 24/7"
                    required
                    style={{ backgroundColor: 'white !important' }}
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
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                  style={{ zIndex: 1000001 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  style={{ zIndex: 1000001 }}
                >
                  Save Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-300 mx-auto"></div>
          <p className="text-purple-200 mt-2 text-sm">Processing...</p>
        </div>
      )}
    </div>
  );
};

export default AdminControls;