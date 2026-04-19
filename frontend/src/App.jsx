import { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/logo.png'; 
import MedicalAnimation from './components/MedicalAnimation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Sidebar from './components/Sidebar'; // 🔥 Sidebar Import Kiya
import AboutModal from './components/AboutModal';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar State

  // 🔥 HISTORY STATE (Local Storage se read karna)
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('curalink_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // History Update function (Save to Local Storage)
  const saveToHistory = (query) => {
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5); // Max 5, no duplicates
    setHistory(newHistory);
    localStorage.setItem('curalink_history', JSON.stringify(newHistory));
  };

  const deleteHistoryItem = (indexToRemove) => {
    const newHistory = history.filter((_, index) => index !== indexToRemove);
    setHistory(newHistory);
    localStorage.setItem('curalink_history', JSON.stringify(newHistory));
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return; 
    
    const userQuery = input.trim();
    saveToHistory(userQuery); // 🔥 Save query to history
    
    const newMessages = [...messages, { role: 'user', content: userQuery }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://curalink-backend-1q52.onrender.com/api/research/chat', {
  method: 'POST',
//... baki code same rahega
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery, history: messages })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages([...newMessages, { role: 'ai', content: data.answer }]);
      } else {
        setMessages([...newMessages, { role: 'ai', content: "AI is thinking. Wait..." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'ai', content: "Server connection failed." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        history={history}
        deleteHistoryItem={deleteHistoryItem}
      />

      {/* 🔥 Naya About Modal 🔥 */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Left Menu Button */}
      <button className="global-menu-btn" onClick={() => setIsSidebarOpen(true)}>
        ☰
      </button>

      {/* 🔥 Right About Button 🔥 */}
      <button className="global-about-btn" onClick={() => setIsAboutOpen(true)}>
        ℹ️
      </button>

      
      {/* Tera Main Chat Box */}
      <div className="app-container">
        <header className="header">
          <div className="header-titles">
            <h1>Curalink AI</h1>
            <p>Your Calming Medical Assistant</p>
          </div>
        </header>
        
        <div className="main-content-area">
          <div className="chat-box-column">
            <div className="chat-box">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ))}
              {loading && <div className="message ai loading">Researching medical databases...</div>}
            </div>
          </div>

          <div className="animation-column">
            <MedicalAnimation />
          </div>
        </div>

        <div className="input-area">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask Asthma or Lung Cancer..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <div className={`logo-btn ${loading ? 'logo-loading' : ''}`} onClick={sendMessage}>
            <img src={logo} alt="Curalink Logo" />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;