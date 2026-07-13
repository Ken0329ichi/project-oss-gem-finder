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
            className="footer-license-link"
          >
            CC BY 4.0
          </a>
          <span className="footer-divider">/</span>
          <span className="footer-publisher">Publisher: <strong>ken0329</strong></span>
          <span className="footer-divider">/</span>
          <span className="footer-timestamp">
            Dataset Version: {formatUTC(updatedAt)}
          </span>
        </div>
      </div>
    </footer>
  );
}
