import React from 'react';
import './Contact.css';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'; // Icons for contact info

const Contact = () => {
    // Basic state for the form (optional, but good practice for a functional form)
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isLoading, setIsLoading] = React.useState(false);
    const [notification, setNotification] = React.useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification(null);

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setNotification({ type: 'success', message: 'Thank you for your message! We will get back to you shortly.' });
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setNotification({ type: 'error', message: 'Failed to send message. Please try again.' });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setNotification({ type: 'error', message: 'An error occurred. Please try again later.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="contact-page-container">
            
            {/* --- Hero/Header Section --- */}
            <header className="contact-header">
                <h1>Get in Touch with **SDG Connect**</h1>
                <p>We're here to help you connect, collaborate, and take action toward the Sustainable Development Goals.</p>
            </header>

            {/* --- Main Content: Form and Info Split --- */}
            <div className="contact-content">
                
                {/* --- Left Side: Contact Form --- */}
                <div className="contact-form-section">
                    <h2>Send Us a Message</h2>
                    <form className="contact-form" onSubmit={handleSubmit}>
                        
                        <div className="form-group">
                            <label htmlFor="name">Your Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>



                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Your Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="6"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        
                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Message'}
                        </button>
                        {notification && (
                            <div className={`notification ${notification.type}`}>
                                {notification.message}
                            </div>
                        )}
                    </form>
                </div>

                {/* --- Right Side: Direct Info --- */}
                <div className="contact-info-section">
                    <h2>Direct Contact Information</h2>
                    <p className="info-intro-text">
                        Looking for a quick response? Reach out to the appropriate department directly.
                    </p>
                    
                    <div className="info-card">
                        <FaEnvelope className="info-icon" />
                        <div className="info-text">
                            <h4>General Inquiries</h4>
                            <p><a href="mailto:info@sdgconnect.org">info@sdgconnect.org</a></p>
                        </div>
                    </div>
                    
                    <div className="info-card">
                        <FaPhoneAlt className="info-icon" />
                        <div className="info-text">
                            <h4>Partnerships & Media</h4>
                            <p>+254 700149158</p>
                        </div>
                    </div>
                    
                    <div className="info-card">
                        <FaMapMarkerAlt className="info-icon" />
                        <div className="info-text">
                            <h4>Headquarters (By Appointment)</h4>
                            <p>Buruburu Phase 5, Katulo House no. 000 </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        
    );
};

export default Contact;