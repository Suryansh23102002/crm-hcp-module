import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormData } from './store/formSlice';

export default function App() {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.form);
  
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");
  
  const [chatHistory, setChatHistory] = useState([
    { 
      type: 'system', 
      text: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Prodo-X efficacy, positive sentiment, shared brochure") or ask for help.' 
    }
  ]);
  
  const llmModels = [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Versatile)" },
    { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Instant)" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
    { id: "llama3-70b-8192", name: "Llama 3 70B" },
    { id: "llama3-8b-8192", name: "Llama 3 8B" }
  ];

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [chatHistory]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newUserMsg = { type: 'user', text: chatInput };
    setChatHistory(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          current_form_data: formData,
          model_name: selectedModel
        })
      });
      
      const data = await response.json();
      
      if (data.tool_used) {
        dispatch(updateFormData(data.form_data));
        setChatHistory(prev => [...prev, { 
          type: 'success', 
          text: '**Interaction logged successfully!** The details (HCP Name, Date, Sentiment, and Materials) have been automatically populated based on your summary. Would you like me to suggest a specific follow-up action, such as scheduling a meeting?' 
        }]);
      } else {
        setChatHistory(prev => [...prev, { type: 'system', text: data.reply }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { type: 'system', text: 'Error connecting to the backend server.' }]);
    } finally {
      setIsLoading(false);
      setChatInput('');
    }
  };

  return (
    <div className="flex h-screen font-inter bg-[#f4f5f7] p-4 gap-4 overflow-hidden">
      
      {/* LEFT PANEL: Log HCP Interaction Form */}
      <div className="w-[60%] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col opacity-95">
        <div className="px-8 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Log HCP Interaction</h2>
        </div>
        
        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
          
          <h3 className="text-sm font-bold text-gray-700 mb-2">Interaction Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">HCP Name</label>
              <input type="text" value={formData.hcp_name} readOnly placeholder="Select HCP..."
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none pointer-events-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Interaction Type</label>
              <input type="text" value={formData.interaction_type} readOnly 
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Date</label>
              <input type="text" value={formData.date || "11/29/2025"} readOnly 
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none pointer-events-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Time</label>
              <input type="text" value={formData.time || "07:36 PM"} readOnly 
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Attendees</label>
            <input type="text" value={formData.attendees} readOnly placeholder="Enter names or search..."
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none pointer-events-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Topics Discussed</label>
            <textarea value={formData.topics_discussed} readOnly 
              className="w-full p-3 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none h-24 resize-none pointer-events-none" />
            <div className="text-xs text-blue-500 mt-2 flex items-center">
              🎙️ Summarize from Voice Note (Requires Consent)
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-700 mt-8 mb-2">Materials Shared / Samples Distributed</h3>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Materials Shared</label>
            <div className="flex gap-2">
              <input type="text" value={formData.materials_shared} readOnly placeholder="Brochures."
                className="flex-1 p-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none pointer-events-none" />
              <button disabled className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-600">🔍 Search/Add</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 mt-4">Samples Distributed</label>
            <div className="flex justify-between items-center border border-gray-200 rounded-md p-3 bg-gray-50">
              <span className={`text-sm ${formData.samples_distributed ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                {formData.samples_distributed || "No samples added."}
              </span>
              <button disabled className="text-blue-600 text-sm font-medium">+ Add Sample</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 mt-6">Observed/Inferred HCP Sentiment</label>
            <div className="flex gap-6 items-center text-sm">
              <label className="flex items-center gap-1 opacity-70">
                <input type="radio" checked={formData.sentiment === 'Positive'} readOnly className="mr-1 accent-purple-600 pointer-events-none" /> 😃 Positive
              </label>
              <label className="flex items-center gap-1 opacity-70">
                <input type="radio" checked={formData.sentiment === 'Neutral'} readOnly className="mr-1 pointer-events-none" /> 😐 Neutral
              </label>
              <label className="flex items-center gap-1 opacity-70">
                <input type="radio" checked={formData.sentiment === 'Negative'} readOnly className="mr-1 pointer-events-none" /> ☹️ Negative
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT PANEL: AI Assistant */}
      <div className="w-[40%] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="mr-2 text-xl">🤖</span> AI Assistant
            </h2>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-xs p-1.5 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              {llmModels.map((model) => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500">Log Interaction details here via chat</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'system' && (
                <div className="p-4 text-sm bg-[#eaf4fc] text-gray-800 rounded-lg max-w-[95%]">
                  {msg.text}
                </div>
              )}
              {msg.type === 'user' && (
                <div className="p-4 text-sm bg-gray-100 text-gray-800 rounded-lg max-w-[85%] border-l-4 border-blue-500">
                  {msg.text}
                </div>
              )}
              {msg.type === 'success' && (
                <div className="p-4 text-sm bg-[#e8f5e9] text-green-900 rounded-lg max-w-[95%] border border-green-200 flex gap-2">
                  <span>✅</span>
                  <div>
                    {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-4 text-sm bg-gray-50 text-gray-500 rounded-lg max-w-[95%] inline-block border border-gray-100">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe Interaction..."
              className="flex-1 p-3.5 border border-gray-300 text-sm rounded-xl focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isLoading}
              className="bg-[#1877f2] hover:bg-blue-700 text-white font-bold h-12 w-16 rounded-2xl flex flex-col items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span className="text-xs tracking-widest leading-none mb-0.5">A</span>
              <span className="text-[10px] leading-none">Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}