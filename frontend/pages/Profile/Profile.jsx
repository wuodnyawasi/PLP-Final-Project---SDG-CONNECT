import React, { useState, useEffect } from 'react';
import './Profile.css';
import ProfileUpdateModal from '../../components/modal/ProfileUpdateModal';
import ProjectEventModal from '../../components/modal/ProjectEventModal';
import ProjectDetailsModal from '../../components/modal/ProjectDetailsModal';
import {
    FaUserCircle, FaEnvelope,
    FaChartLine, FaHistory, FaClock, FaCheckCircle, FaTools,
    FaPlusCircle, FaSpinner, FaEdit, FaUsers, FaTrash, FaBan, FaCheck, FaCrown, FaEye, FaMapMarkerAlt, FaChevronLeft, FaChevronRight // For the planning/creating button and edit
} from 'react-icons/fa';

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProjectEventModalOpen, setIsProjectEventModalOpen] = useState(false);
    const [isProjectDetailsModalOpen, setIsProjectDetailsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [userProjects, setUserProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [impactStats, setImpactStats] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view your profile');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    setIsAdmin(data.isAdmin || false);

                    // If user is admin, fetch all users
                    if (data.isAdmin) {
                        fetchAllUsers();
                    }

                    // Fetch user's projects
                    fetchUserProjects();

                    // Fetch impact stats
                    fetchImpactStats();
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to load profile');
                }
            } catch (err) {
                setError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const fetchAllUsers = async () => {
        setUsersLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchUserProjects = async () => {
        setProjectsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserProjects(data.projects);
            } else {
                console.error('Failed to fetch projects');
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setProjectsLoading(false);
        }
    };

    const fetchImpactStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/user/impact', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setImpactStats(data);
                // Update userData with impact stats
                setUserData(prev => ({ ...prev, impactStats: data }));
            } else {
                console.error('Failed to fetch impact stats');
            }
        } catch (error) {
            console.error('Error fetching impact stats:', error);
        }
    };

    const handleEditClick = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleProjectEventModalOpen = () => {
        setIsProjectEventModalOpen(true);
    };

    const handleProjectEventModalClose = () => {
        setIsProjectEventModalOpen(false);
    };

    const handleViewProjectDetails = (project) => {
        setSelectedProject(project);
        setIsProjectDetailsModalOpen(true);
    };

    const handleProjectDetailsModalClose = () => {
        setIsProjectDetailsModalOpen(false);
        setSelectedProject(null);
    };

    const handleNextProject = () => {
        setCurrentProjectIndex((prevIndex) =>
            prevIndex === userProjects.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrevProject = () => {
        setCurrentProjectIndex((prevIndex) =>
            prevIndex === 0 ? userProjects.length - 1 : prevIndex - 1
        );
    };

    const handleProfileUpdate = (updatedUser) => {
        setUserData(updatedUser);
        // Update localStorage user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('userLoggedIn'));
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setUsers(users.filter(user => user._id !== userId));
                alert('User deleted successfully');
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    };

    const handleToggleDisableUser = async (userId, isDisabled) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isDisabled: !isDisabled })
            });

            if (response.ok) {
                setUsers(users.map(user =>
                    user._id === userId ? { ...user, isDisabled: !isDisabled } : user
                ));
                alert(`User ${!isDisabled ? 'disabled' : 'enabled'} successfully`);
            } else {
                alert('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error updating user');
        }
    };

    const handleToggleAdmin = async (userId, isAdmin) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isAdmin: !isAdmin })
            });

            if (response.ok) {
                setUsers(users.map(user =>
                    user._id === userId ? { ...user, isAdmin: !isAdmin } : user
                ));
                alert(`User ${!isAdmin ? 'promoted to admin' : 'demoted from admin'} successfully`);
            } else {
                alert('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error updating user');
        }
    };

    if (loading) {
        return (
            <div className="profile-page-container">
                <div className="loading-container">
                    <FaSpinner className="loading-spinner" />
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page-container">
                <div className="error-container">
                    <h2>Profile Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="profile-page-container">
                <div className="error-container">
                    <h2>No Profile Data</h2>
                    <p>Please log in to view your profile.</p>
                </div>
            </div>
        );
    }

    const {
        name, email, phone, gender, dateOfBirth, organization, skills, profilePicture, bio, country, city, exactLocation, createdAt
    } = userData;

    // If user is admin, show admin user management interface
    if (isAdmin) {
        return (
            <div className="profile-page-container">
                <header className="profile-welcome-banner">
                    <div className="welcome-header">
                        <div className="welcome-text">
                            <h1><FaCrown /> Admin Dashboard</h1>
                            <p>Manage all users and their profiles</p>
                        </div>
                    </div>
                </header>

                <div className="admin-users-section">
                    <h2><FaUsers /> All Users</h2>
                    <div className="users-controls">
                        <input type="text" placeholder="Search users..." className="search-input" />
                        <button className="btn-primary" onClick={fetchAllUsers}>Refresh Users</button>
                    </div>

                    {usersLoading ? (
                        <div className="loading-container">
                            <FaSpinner className="loading-spinner" />
                            <p>Loading users...</p>
                        </div>
                    ) : (
                        <div className="users-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                                            <td>
                                                <span className={`status-badge ${user.isDisabled ? 'disabled' : 'active'}`}>
                                                    {user.isDisabled ? 'Disabled' : 'Active'}
                                                </span>
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                                                >
                                                    {user.isAdmin ? 'Demote' : 'Promote'}
                                                </button>
                                                <button
                                                    className={`btn-warning ${user.isDisabled ? 'enable' : 'disable'}`}
                                                    onClick={() => handleToggleDisableUser(user._id, user.isDisabled)}
                                                >
                                                    {user.isDisabled ? <><FaCheck /> Enable</> : <><FaBan /> Disable</>}
                                                </button>
                                                <button
                                                    className="btn-danger"
                                                    onClick={() => handleDeleteUser(user._id)}
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page-container">

            {/* --- Section 1: Welcome Banner --- */}
            <header className="profile-welcome-banner">
                <div className="welcome-header">
                    <div className="welcome-text">
                        <h1>Hello, {name}!</h1>
                        <p>Welcome back to your action hub. See your profile details below.</p>
                    </div>
                    <button className="edit-profile-btn-top" onClick={handleEditClick}>
                        <FaEdit /> Edit Profile
                    </button>
                </div>
            </header>

            {/* --- Main Content Layout --- */}
            <div className="profile-content">

                {/* --- Column 1: Dashboard and Metrics --- */}
                <div className="dashboard-section">
                    <h2><FaChartLine /> My Impact Dashboard</h2>

                    <div className="metrics-grid">
                        <div className="metric-card">
                            <FaCheckCircle className="metric-icon" />
                            <h4>{userData.impactStats?.attendedContributions || 0}</h4>
                            <p>My Contributions</p>
                        </div>
                        <div className="metric-card">
                            <FaClock className="metric-icon" />
                            <h4>{userData.impactStats?.completedDonations || 0}</h4>
                            <p>Completed Donations</p>
                        </div>
                        <div className="metric-card completed-card">
                            <FaTools className="metric-icon" />
                            <h4>{userData.impactStats?.completedProjects || 0}</h4>
                            <p>Projects Completed</p>
                        </div>
                        <div className="metric-card underway-card">
                            <FaTools className="metric-icon" />
                            <h4>{userProjects.filter(p => p.status === 'active').length}</h4>
                            <p>Projects Underway</p>
                        </div>
                    </div>

                    <div className="impact-message">
                        <h2>Thank You for Making a Difference!</h2>
                        <p>
                            Your contributions are helping achieve the United Nations Sustainable Development Goals.
                            Every project you complete, donation you make, offer you provide, and event you attend
                            creates positive change in our communities.
                        </p>
                    </div>
                </div>

                {/* --- Column 2: Profile Details and Actions --- */}
                <div className="profile-detail-section">
                    <h2><FaUserCircle /> Profile Details</h2>

                    {/* Profile Picture and Name */}
                    <div className="profile-header-card">
                        <div className="profile-picture-placeholder">
                            {profilePicture ? (
                                <img src={profilePicture.startsWith('http') ? profilePicture : `http://localhost:5000${profilePicture}`} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <FaUserCircle size={100} />
                            )}
                        </div>
                        <h3>{name}</h3>
                        <p className="profile-joined">Member since {new Date(createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Contact Information */}
                    <div className="contact-info-list">
                        <p><FaEnvelope className="detail-icon" /> {email}</p>
                        {phone && <p><span className="detail-icon">📱</span> {phone}</p>}
                        {gender && <p><span className="detail-icon">👤</span> {gender}</p>}
                        {dateOfBirth && <p><span className="detail-icon">🎂</span> {new Date(dateOfBirth).toLocaleDateString()}</p>}
                        {organization && <p><span className="detail-icon">🏢</span> {organization}</p>}
                        {(country || city || exactLocation) && (
                            <p><span className="detail-icon">📍</span>
                                {[country, city, exactLocation].filter(Boolean).join(', ')}
                            </p>
                        )}
                    </div>

                    {/* Skills Section */}
                    {skills && skills.length > 0 && (
                        <div className="skills-section">
                            <h4>Career Path / Skills:</h4>
                            <div className="skills-display">
                                {skills.map((skill, index) => (
                                    <span key={index} className="skill-display-tag">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bio Section */}
                    {bio && (
                        <div className="bio-section">
                            <h4>About Me:</h4>
                            <p>{bio}</p>
                        </div>
                    )}

                    {/* SDG Contribution List - Hidden since not in database */}
                    {/* <div className="sdg-contribution-list">
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
                    </div> */}

                    {/* Action Button */}
                    <button className="plan-project-button" onClick={handleProjectEventModalOpen}>
                        <FaPlusCircle /> Start a New Project/Event
                    </button>

                </div>

                {/* --- My Projects/Events Section --- */}
                <div className="projects-section">
                    <h2><FaTools /> My Projects/Events</h2>

                    {projectsLoading ? (
                        <div className="loading-container">
                            <FaSpinner className="loading-spinner" />
                            <p>Loading your projects...</p>
                        </div>
                    ) : userProjects.length === 0 ? (
                        <div className="no-projects">
                            <p>You haven't created any projects or events yet.</p>
                            <button className="plan-project-button" onClick={handleProjectEventModalOpen}>
                                <FaPlusCircle /> Create Your First Project/Event
                            </button>
                        </div>
                    ) : (
                        <div className="project-carousel">
                            <div className="carousel-header">
                                <h3>Project {currentProjectIndex + 1} of {userProjects.length}</h3>
                                <div className="carousel-controls">
                                    <button
                                        className="carousel-btn prev-btn"
                                        onClick={handlePrevProject}
                                        disabled={userProjects.length <= 1}
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <button
                                        className="carousel-btn next-btn"
                                        onClick={handleNextProject}
                                        disabled={userProjects.length <= 1}
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                            <div className="project-display">
                                {(() => {
                                    const project = userProjects[currentProjectIndex];
                                    return (
                                        <div key={project.id} className="project-card">
                                            <div className="project-image">
                                                {project.projectImage ? (
                                                    <img
                                                        src={project.projectImage.startsWith('http') ? project.projectImage : `http://localhost:5000${project.projectImage}`}
                                                        alt={project.title}
                                                    />
                                                ) : (
                                                    <div className="no-image">
                                                        <FaTools size={40} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="project-info">
                                                <h3>{project.title}</h3>
                                                <div className="project-meta">
                                                    <span className={`project-type ${project.type}`}>
                                                        {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                                                    </span>
                                                    <span className="project-location">
                                                        <FaMapMarkerAlt />
                                                        {[project.city, project.exactLocation].filter(Boolean).join(', ')}
                                                    </span>
                                                </div>
                                                <p className="project-description">{project.briefInfo}</p>
                                                <div className="project-stats">
                                                    <span className="slots-remaining">
                                                        {project.peopleRequired ? `${project.slotsRemaining || 0} slots available` : 'No limit'}
                                                    </span>
                                                    {project.participants && project.participants.length > 0 && (
                                                        <span className="participants-count">
                                                            {project.participants.length} participants joined
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    className="view-details-btn"
                                                    onClick={() => handleViewProjectDetails(project)}
                                                >
                                                    <FaEye /> View Details
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Profile Update Modal */}
            <ProfileUpdateModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                userData={userData}
                onUpdate={handleProfileUpdate}
            />

            {/* Project/Event Modal */}
            <ProjectEventModal
                isOpen={isProjectEventModalOpen}
                onClose={handleProjectEventModalClose}
            />

            {/* Project Details Modal */}
            <ProjectDetailsModal
                isOpen={isProjectDetailsModalOpen}
                onClose={handleProjectDetailsModalClose}
                project={selectedProject}
                onProjectUpdate={fetchUserProjects}
            />
        </div>
    );
};

export default UserProfile;