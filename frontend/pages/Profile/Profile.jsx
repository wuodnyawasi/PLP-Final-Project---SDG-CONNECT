import React from 'react';
import './Profile.css';
import { 
    FaUserCircle, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, 
    FaChartLine, FaHistory, FaClock, FaCheckCircle, FaTools,
    FaPlusCircle // For the planning/creating button
} from 'react-icons/fa';

// Placeholder data for the logged-in user
const userData = {
    name: "Michael Benjamin",
    location: "Global City, Earth",
    email: "m.benjamin@sdgconnect.org",
    phone: "+1 (555) 123-4567",
    contributions: 4,
    activityHistory: 12,
    hoursContributed: 85,
    projectsCompleted: 3,
    projectsUnderway: 1,
    sdgGoals: [
        { id: 4, color: '#c5192d', label: 'Quality Education' },
        { id: 13, color: '#3f7e44', label: 'Climate Action' },
        { id: 16, color: '#00689d', label: 'Peace and Justice' },
    ],
    profilePicUrl: 'placeholder.jpg' // Replace with actual image URL
};

const UserProfile = () => {
    
    const { 
        name, location, email, phone, 
        contributions, activityHistory, hoursContributed, 
        projectsCompleted, projectsUnderway, sdgGoals 
    } = userData;

    return (
        <div className="profile-page-container">
            
            {/* --- Section 1: Welcome Banner --- */}
            <header className="profile-welcome-banner">
                <h1>Hello, **{name}**!</h1>
                <p>Welcome back to your action hub. See your impact below.</p>
            </header>

            {/* --- Main Content Layout --- */}
            <div className="profile-content">

                {/* --- Column 1: Dashboard and Metrics --- */}
                <div className="dashboard-section">
                    <h2><FaChartLine /> My Impact Dashboard</h2>
                    
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <FaCheckCircle className="metric-icon" />
                            <h4>{contributions}</h4>
                            <p>My Contributions</p>
                        </div>
                        <div className="metric-card">
                            <FaHistory className="metric-icon" />
                            <h4>{activityHistory}</h4>
                            <p>Activity History</p>
                        </div>
                        <div className="metric-card">
                            <FaClock className="metric-icon" />
                            <h4>{hoursContributed}</h4>
                            <p>Volunteer Hours</p>
                        </div>
                        <div className="metric-card completed-card">
                            <FaTools className="metric-icon" />
                            <h4>{projectsCompleted}</h4>
                            <p>Projects Completed</p>
                        </div>
                        <div className="metric-card underway-card">
                            <FaTools className="metric-icon" />
                            <h4>{projectsUnderway}</h4>
                            <p>Projects Underway</p>
                        </div>
                    </div>
                </div>

                {/* --- Column 2: Profile Details and Actions --- */}
                <div className="profile-detail-section">
                    <h2><FaUserCircle /> Profile Details</h2>
                    
                    {/* Profile Picture and Name */}
                    <div className="profile-header-card">
                        <img 
                            src={userData.profilePicUrl} 
                            alt={`${name}'s Profile`} 
                            className="profile-picture" 
                        />
                        <h3>{name}</h3>
                        <p className="profile-location"><FaMapMarkerAlt /> {location}</p>
                    </div>

                    {/* Contact Information */}
                    <div className="contact-info-list">
                        <p><FaEnvelope className="detail-icon" /> {email}</p>
                        <p><FaPhoneAlt className="detail-icon" /> {phone}</p>
                    </div>

                    {/* SDG Contribution List */}
                    <div className="sdg-contribution-list">
                        <h4>SDGs I've Supported:</h4>
                        <div className="sdg-tags">
                            {sdgGoals.map(goal => (
                                <span 
                                    key={goal.id} 
                                    className="sdg-tag"
                                    style={{ backgroundColor: goal.color }}
                                >
                                    Goal {goal.id}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button className="plan-project-button">
                        <FaPlusCircle /> Start a New Project/Event
                    </button>

                </div>

            </div>
        </div>
    );
};

export default UserProfile;