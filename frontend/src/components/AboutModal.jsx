import React from 'react';
import logo from '../assets/logo.png';

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>
        
        <div className="modal-header">
          <img src={logo} alt="Curalink" className="modal-logo" />
          <h2>About Curalink AI</h2>
        </div>
        
        <div className="modal-body">
          <p>
            Curalink is an advanced AI-powered Medical Research Assistant. It is designed to fetch real-time, evidence-based data directly from trusted sources like <b>PubMed</b> and <b>ClinicalTrials.gov</b>.
          </p>
          
          <div className="how-to-use">
            <h3>💡 How to use:</h3>
            <p>Simply type a disease name, symptom, or medical query in the chatbox (e.g., "Latest treatments for Lung Cancer"). The AI will reason over the databases and provide a structured, link-backed summary.</p>
          </div>

          <div className="developer-info">
            <h3>👨‍💻 Developed By</h3>
            <div className="social-links-row">
              <a href="https://www.linkedin.com/in/mohit-suroliya-b939a12a2/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BuPoPRinMT2SwE1mBot4WKw%3D%3D"target="_blank" rel="noopener noreferrer" className="btn-linkedin">LinkedIn</a>
              <a href="https://github.com/mohit2056" target="_blank" rel="noopener noreferrer" className="btn-github">GitHub</a>
              <a href="https://contra.com/mohit_suroliya_x5cij88k/work?r=mohit_suroliya_x5cij88k" target="_blank" rel="noopener noreferrer" className="btn-contra">Contra</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;