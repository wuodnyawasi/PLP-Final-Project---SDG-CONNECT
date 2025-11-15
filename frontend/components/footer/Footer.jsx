import React from 'react';
import './Footer.css';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';



const Footer = () => {
    // Current year for the copyright notice
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-container">
            <div className="footer-content">

                {/* --- Column 1: Brand and Mission --- */}
                <div className="footer-section footer-brand">
                    -<h3 className="footer-logo-text">
                        SDG<span className='footer-logo-accent'>Connect</span>
                    </h3>
                    <p className="mission-text">
                        Uniting people, resources, and action to achieve the UN Sustainable Development Goals.
                    </p>
                    <p className="copyright-text">
                        &copy; {currentYear} SDG Connect. All rights reserved.
                    </p>
                </div>

                {/* --- Column 2: Quick Links --- */}
                <div className="footer-section footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/projects">Browse Projects</a></li>
                        <li><a href="/donate">Donate Resources</a></li>
                        <li><a href="/volunteer">Become a Volunteer</a></li>
                        <li><a href="/about">About Us</a></li>
                    </ul>
                </div>

                {/* --- Column 3: Support & Legal --- */}
                <div className="footer-section footer-legal">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="/contact">Contact Us</a></li>
                        <li><a href="/faq">FAQ</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
                    </ul>
                </div>

                {/* --- Column 4: Social Media --- */}
                <div className="footer-section footer-social">
                    <h4>Connect</h4>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;