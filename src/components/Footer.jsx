import React from 'react';
import { formatUTC } from '../utils/formatters';
import './Footer.css';

export default function Footer({ updatedAt }) {
  return (
    <footer className="app-footer glass">
      <div className="footer-content">
        <div className="footer-meta">
          <a 
            href="https://creativecommons.org/licenses/by/4.0/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-license-badge"
          >
            CC BY 4.0
          </a>
          <span className="footer-publisher">Publisher: <strong>ken0329</strong></span>
          <span className="footer-timestamp">
            Dataset Version: {formatUTC(updatedAt)} (Fully Automated Daily)
          </span>
        </div>
      </div>
    </footer>
  );
}
