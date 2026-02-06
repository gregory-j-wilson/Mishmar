import React, { useState, useEffect } from 'react';
import { Plus, X, Clock, Calendar, Heart, BookOpen, Users, Sparkles, Save, Edit2, Trash2, Moon } from 'lucide-react';

// Mishmar - Rule of Life Builder
// A tool for creating daily, weekly, and seasonal spiritual rhythms

const Mishmar = () => {
  const [practices, setPractices] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Load practices from storage
  useEffect(() => {
    const loadPractices = async () => {
      try {
        const result = await window.storage.get('mishmar-practices');
        if (result && result.value) {
          setPractices(JSON.parse(result.value));
        }
      } catch (error) {
        console.log('No existing practices found, starting fresh');
      }
    };
    loadPractices();
  }, []);

  // Save practices to storage
  const savePractices = async (newPractices) => {
    try {
      await window.storage.set('mishmar-practices', JSON.stringify(newPractices));
      setPractices(newPractices);
    } catch (error) {
      console.error('Error saving practices:', error);
    }
  };

  const categories = [
    { id: 'prayer', label: 'Prayer', icon: Heart, color: '#FFB3BA' },
    { id: 'scripture', label: 'Scripture', icon: BookOpen, color: '#BAE1FF' },
    { id: 'community', label: 'Community', icon: Users, color: '#FFFFBA' },
    { id: 'rest', label: 'Rest', icon: Moon, color: '#D4BAFF' },
    { id: 'service', label: 'Service', icon: Sparkles, color: '#BAFFC9' },
  ];

  const frequencies = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'seasonal', label: 'Seasonal' },
  ];

  const [newPractice, setNewPractice] = useState({
    name: '',
    category: 'prayer',
    frequency: 'daily',
    time: '',
    duration: '',
    notes: '',
  });

  const resetForm = () => {
    setNewPractice({
      name: '',
      category: 'prayer',
      frequency: 'daily',
      time: '',
      duration: '',
      notes: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const addPractice = () => {
    if (!newPractice.name.trim()) return;
    
    const practice = {
      ...newPractice,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    savePractices([...practices, practice]);
    resetForm();
  };

  const updatePractice = () => {
    if (!newPractice.name.trim()) return;
    
    const updated = practices.map(p => 
      p.id === editingId ? { ...newPractice, id: editingId, createdAt: p.createdAt } : p
    );
    savePractices(updated);
    resetForm();
  };

  const deletePractice = (id) => {
    savePractices(practices.filter(p => p.id !== id));
  };

  const startEdit = (practice) => {
    setNewPractice(practice);
    setEditingId(practice.id);
    setShowAddForm(true);
  };

  // AI Suggestion using Anthropic API
  const getAISuggestion = async () => {
    setLoadingAI(true);
    setAiSuggestion('');
    
    try {
      const currentPractices = practices.map(p => 
        `${p.name} (${p.category}, ${p.frequency})`
      ).join(', ');
      
      const prompt = currentPractices 
        ? `I'm building a Rule of Life with these practices: ${currentPractices}. Suggest one complementary spiritual practice I might be missing, considering Christian and Messianic Jewish traditions. Keep it brief and practical.`
        : `Suggest a foundational spiritual practice for someone starting a Rule of Life, drawing from Christian and Messianic Jewish traditions. Keep it brief and practical.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { role: "user", content: prompt }
          ],
        })
      });

      const data = await response.json();
      const suggestion = data.content
        .filter(item => item.type === "text")
        .map(item => item.text)
        .join("\n");
      
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiSuggestion('Unable to get suggestion at this time. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : Heart;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#FFB3BA';
  };

  const groupedPractices = frequencies.reduce((acc, freq) => {
    acc[freq.id] = practices.filter(p => p.frequency === freq.id);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100" 
         style={{ fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-wide text-gray-100 mb-2">
                Mishmar
              </h1>
              <p className="text-gray-400 font-light">
                Your Rule of Life · מִשְׁמָר
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                       bg-gray-700/50 hover:bg-gray-700 text-gray-200 border border-gray-600/50"
            >
              {showAddForm ? (
                <>
                  <X size={20} />
                  Cancel
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Practice
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* AI Suggestion Section */}
        <div className="mb-8 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-purple-300" />
              <h2 className="text-xl font-medium text-gray-200">Spiritual Guidance</h2>
            </div>
            <button
              onClick={getAISuggestion}
              disabled={loadingAI}
              className="px-4 py-2 rounded-lg font-medium transition-all text-sm
                       bg-purple-900/30 hover:bg-purple-900/50 text-purple-200 
                       border border-purple-700/50 disabled:opacity-50"
            >
              {loadingAI ? 'Reflecting...' : 'Get Suggestion'}
            </button>
          </div>
          {aiSuggestion && (
            <p className="text-gray-300 leading-relaxed font-light">
              {aiSuggestion}
            </p>
          )}
          {!aiSuggestion && !loadingAI && (
            <p className="text-gray-500 italic font-light">
              Click "Get Suggestion" for personalized spiritual practice ideas
            </p>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-8 bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-medium text-gray-200 mb-6">
              {editingId ? 'Edit Practice' : 'New Practice'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Practice Name
                </label>
                <input
                  type="text"
                  value={newPractice.name}
                  onChange={(e) => setNewPractice({...newPractice, name: e.target.value})}
                  placeholder="e.g., Morning Prayer, Shabbat Candles"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 
                           text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-600
                           transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newPractice.category}
                  onChange={(e) => setNewPractice({...newPractice, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 
                           text-gray-100 focus:outline-none focus:border-gray-600 transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frequency
                </label>
                <select
                  value={newPractice.frequency}
                  onChange={(e) => setNewPractice({...newPractice, frequency: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 
                           text-gray-100 focus:outline-none focus:border-gray-600 transition-colors"
                >
                  {frequencies.map(freq => (
                    <option key={freq.id} value={freq.id}>{freq.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time of Day
                </label>
                <input
                  type="text"
                  value={newPractice.time}
                  onChange={(e) => setNewPractice({...newPractice, time: e.target.value})}
                  placeholder="e.g., Morning, 7:00 AM"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 
                           text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-600
                           transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={newPractice.duration}
                  onChange={(e) => setNewPractice({...newPractice, duration: e.target.value})}
                  placeholder="e.g., 15 minutes"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 
                           text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-600
                           transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={newPractice.notes}
                  onChange={(e) => setNewPractice({...newPractice, notes: e.target.value})}
                  placeholder="Additional details, scripture references, intentions..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 
                           text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-600
                           transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingId ? updatePractice : addPractice}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                         bg-blue-900/40 hover:bg-blue-900/60 text-blue-200 border border-blue-700/50"
              >
                <Save size={18} />
                {editingId ? 'Update Practice' : 'Save Practice'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 rounded-lg font-medium transition-all
                         bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 border border-gray-600/50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Practices List */}
        {practices.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/20 rounded-xl border border-gray-700/30">
            <Calendar size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 font-light text-lg">
              Begin building your Rule of Life
            </p>
            <p className="text-gray-500 font-light mt-2">
              Add your first spiritual practice to get started
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {frequencies.map(freq => {
              const freqPractices = groupedPractices[freq.id];
              if (freqPractices.length === 0) return null;
              
              return (
                <div key={freq.id}>
                  <h2 className="text-2xl font-light text-gray-300 mb-4 flex items-center gap-3">
                    <Clock size={24} className="text-gray-500" />
                    {freq.label}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {freqPractices.map(practice => {
                      const Icon = getCategoryIcon(practice.category);
                      const color = getCategoryColor(practice.category);
                      
                      return (
                        <div
                          key={practice.id}
                          className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50
                                   hover:bg-gray-800/50 transition-all group"
                          style={{
                            borderLeftWidth: '4px',
                            borderLeftColor: color,
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${color}20` }}
                              >
                                <Icon size={20} style={{ color }} />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-100">
                                  {practice.name}
                                </h3>
                                <p className="text-sm text-gray-500 font-light">
                                  {categories.find(c => c.id === practice.category)?.label}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEdit(practice)}
                                className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 
                                         hover:text-blue-300 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => deletePractice(practice.id)}
                                className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 
                                         hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          {(practice.time || practice.duration) && (
                            <div className="flex gap-4 text-sm text-gray-400 mb-3 font-light">
                              {practice.time && (
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {practice.time}
                                </span>
                              )}
                              {practice.duration && (
                                <span>{practice.duration}</span>
                              )}
                            </div>
                          )}
                          
                          {practice.notes && (
                            <p className="text-sm text-gray-400 leading-relaxed font-light">
                              {practice.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-500 font-light text-sm">
            "Keep my decrees and follow them. I am the LORD, who makes you holy." — Leviticus 20:8
          </p>
        </div>
      </div>
    </div>
  );
};

export default Mishmar;
