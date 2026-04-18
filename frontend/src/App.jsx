import { useState } from 'react';
import './App.css';
import logo from './assets/logo.png'; 
import MedicalAnimation from './components/MedicalAnimation'; // 🔥 Nayi file import kar li

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return; 
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/research/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
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
    <div className="app-container">
      <header className="header">
        <h1>Curalink AI</h1>
        <p>Your Calming Medical Assistant</p>
      </header>
      
      <div className="main-content-area">
        
        {/* Left Side: Scrolling Chat Box */}
        <div className="chat-box-column">
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <pre>{msg.content}</pre> 
              </div>
            ))}
            {loading && <div className="message ai loading">Researching...</div>}
          </div>
        </div>

        {/* 🔥 Right Side: ANIMATION AREA 🔥 */}
        <div className="animation-column">
          {/* Purana placeholder hatakar apna asli component laga diya */}
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
        <div 
          className={`logo-btn ${loading ? 'logo-loading' : ''}`}
          onClick={sendMessage}
        >
          <img src={logo} alt="Curalink Logo" />
        </div>
      </div>
    </div>
  );
}

export default App;