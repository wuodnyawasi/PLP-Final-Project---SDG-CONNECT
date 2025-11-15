import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Projects.css';
import ProjectEventModal from '../../components/modal/ProjectEventModal';
import ProjectDetailsModal from '../../components/modal/ProjectDetailsModal';
import JoinProjectModal from '../../components/modal/JoinProjectModal';
import ProvideResourcesModal from '../../components/modal/ProvideResourcesModal';
import LoginModal from '../../components/modal/LoginModal';
import {
    FaFilter, FaSearch, FaMapMarkerAlt, FaClock,
    FaHandsHelping, FaCheckCircle, FaTag, FaPlusCircle, FaEye, FaSpinner, FaUserPlus, FaBoxOpen, FaHeart
} from 'react-icons/fa';

const ProjectListing = () => {
    const navigate = useNavigate();
    const [isProjectEventModalOpen, setIsProjectEventModalOpen] = useState(false);
    const [isProjectDetailsModalOpen, setIsProjectDetailsModalOpen] = useState(false);
    const [isJoinProjectModalOpen, setIsJoinProjectModalOpen] = useState(false);
    const [isProvideResourcesModalOpen, setIsProvideResourcesModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterSDG, setFilterSDG] = useState('');
    const [userData, setUserData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Fetch projects from API
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/projects/public');
            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects);
            } else {
                setError('Failed to load projects');
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    // Get user data from localStorage
    const getUserData = () => {
        const user = localStorage.getItem('user');
        if (user) {
            setUserData(JSON.parse(user));
        }
    };

    useEffect(() => {
        fetchProjects();
        getUserData();
    }, []);

    const handleProjectEventModalOpen = () => {
        if (!userData) {
            setIsLoginModalOpen(true);
            return;
        }
        setIsProjectEventModalOpen(true);
    };

    const handleProjectEventModalClose = () => {
        setIsProjectEventModalOpen(false);
    };

    const handleViewProjectDetails = async (project) => {
        // If user is logged in and is the project owner, fetch full project data with contributors
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            const userData = JSON.parse(user);
            if (project.createdBy?.id === userData.id || userData.isAdmin) {
                try {
                    const response = await fetch(`http://localhost:5000/api/projects/${project.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setSelectedProject(data.project);
                        setIsProjectDetailsModalOpen(true);
                        return;
                    }
                } catch (error) {
                    console.error('Error fetching full project data:', error);
                }
            }
        }

        // Fallback to public project data
        setSelectedProject(project);
        setIsProjectDetailsModalOpen(true);
    };

    const handleProjectDetailsModalClose = () => {
        setIsProjectDetailsModalOpen(false);
        setSelectedProject(null);
    };

    const handleJoinProject = (project) => {
        if (!userData) {
            setIsLoginModalOpen(true);
            return;
        }
        setSelectedProject(project);
        setIsJoinProjectModalOpen(true);
    };

    const handleJoinProjectModalClose = () => {
        setIsJoinProjectModalOpen(false);
        setSelectedProject(null);
    };

    const handleProvideResources = (project) => {
        if (!userData) {
            setIsLoginModalOpen(true);
            return;
        }
        setSelectedProject(project);
        setIsProvideResourcesModalOpen(true);
    };

    const handleProvideResourcesModalClose = () => {
        setIsProvideResourcesModalOpen(false);
        setSelectedProject(null);
    };

    const handleJoinSuccess = () => {
        // Refresh projects to update participant counts
        fetchProjects();
    };

    const handleResourceOfferSuccess = () => {
        // Refresh projects to update resource counts if needed
        fetchProjects();
    };

    // Filter projects based on search and filters
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.briefInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (project.city && project.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (project.country && project.country.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = !filterType || project.type === filterType;
        const matchesSDG = !filterSDG || project.sdgs.includes(parseInt(filterSDG));

        return matchesSearch && matchesType && matchesSDG;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProjects = filteredProjects.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType, filterSDG]);

    return (
        <div className="project-listing-container">
            
            {/* --- Header & Search Banner --- */}
            <header className="listing-header">
                <div className="header-top">
                    <div className="header-text">
                        <h1>Find Your Next Impact Opportunity</h1>
                        <p>Browse local actions aligned with the UN Sustainable Development Goals.</p>
                    </div>
                    <button className="add-project-button" onClick={handleProjectEventModalOpen}>
                        <FaPlusCircle /> Add Project/Event
                    </button>
                </div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by title, location, or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="project">Projects</option>
                        <option value="event">Events</option>
                    </select>
                    <select value={filterSDG} onChange={(e) => setFilterSDG(e.target.value)}>
                        <option value="">All SDGs</option>
                        <option value="1">No Poverty</option>
                        <option value="2">Zero Hunger</option>
                        <option value="3">Good Health</option>
                        <option value="4">Quality Education</option>
                        <option value="5">Gender Equality</option>
                        <option value="6">Clean Water</option>
                        <option value="7">Affordable Energy</option>
                        <option value="8">Decent Work</option>
                        <option value="9">Industry Innovation</option>
                        <option value="10">Reduced Inequalities</option>
                        <option value="11">Sustainable Cities</option>
                        <option value="12">Responsible Consumption</option>
                        <option value="13">Climate Action</option>
                        <option value="14">Life Below Water</option>
                        <option value="15">Life on Land</option>
                        <option value="16">Peace and Justice</option>
                        <option value="17">Partnerships</option>
                    </select>
                </div>
            </header>

            {/* --- Project Grid --- */}
            <section className="projects-grid-section">
                <h2>Current Actions ({filteredProjects.length} Available)</h2>
                {filteredProjects.length > 0 && (
                    <p className="pagination-info">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
                    </p>
                )}

                {loading ? (
                    <div className="loading-container">
                        <FaSpinner className="loading-spinner" />
                        <p>Loading projects...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <h2>Error Loading Projects</h2>
                        <p>{error}</p>
                        <button onClick={fetchProjects} className="btn-primary">Try Again</button>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="no-projects">
                        <h3>No projects found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {currentProjects.map(project => (
                            <div key={project.id} className="project-card">
                                <div className="card-image-wrapper">
                                    {project.projectImage ? (
                                        <img
                                            src={project.projectImage.startsWith('http') ? project.projectImage : `http://localhost:5000${project.projectImage}`}
                                            alt={project.title}
                                            className="card-image"
                                        />
                                    ) : (
                                        <div className="no-image">
                                            <FaTag size={40} />
                                        </div>
                                    )}
                                    {project.sdgs && project.sdgs.length > 0 && (
                                        <span
                                            className="sdg-badge"
                                            style={{ backgroundColor: getSDGColor(project.sdgs[0]) }}
                                            title={`SDG ${project.sdgs[0]}`}
                                        >
                                            SDG {project.sdgs[0]}
                                        </span>
                                    )}
                                </div>

                                <div className="card-content">

                                    <h3 className="card-title">{project.title}</h3>

                                    <p className="card-location">
                                        <FaMapMarkerAlt /> {[project.city, project.exactLocation].filter(Boolean).join(', ')}
                                    </p>

                                    <p className="card-description">{project.briefInfo}</p>

                                    <div className="card-meta">
                                        <span className={`meta-tag ${project.type.toLowerCase().replace(' ', '-')}-tag`}>
                                            <FaTag /> {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                                        </span>

                                        {project.peopleRequired && (
                                            <span className="meta-capacity">
                                                <FaHandsHelping /> {project.slotsRemaining || 0} Slots Available
                                            </span>
                                        )}
                                    </div>

                                    <div className="card-actions">
                                        <button
                                            className="view-details-button"
                                            onClick={() => handleViewProjectDetails(project)}
                                        >
                                            <FaEye /> View Details
                                        </button>

                                        {userData && project.createdBy !== userData.id && (
                                            <>
                                                <button
                                                    className="join-project-button"
                                                    onClick={() => handleJoinProject(project)}
                                                    disabled={(project.slotsRemaining || 0) <= 0}
                                                >
                                                    <FaUserPlus /> Join
                                                </button>

                                                <button
                                                    className="provide-resources-button"
                                                    onClick={() => handleProvideResources(project)}
                                                >
                                                    <FaBoxOpen /> Provide Resources
                                                </button>
                                            </>
                                        )}

                                        <button
                                            className="donate-now-button"
                                            onClick={() => navigate('/donate')}
                                        >
                                            <FaHeart /> Donate Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="pagination-controls">
                        <button
                            className="pagination-button"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="pagination-button"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>

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
            />

            {/* Join Project Modal */}
            <JoinProjectModal
                isOpen={isJoinProjectModalOpen}
                onClose={handleJoinProjectModalClose}
                project={selectedProject}
                onJoinSuccess={handleJoinSuccess}
            />

            {/* Provide Resources Modal */}
            <ProvideResourcesModal
                isOpen={isProvideResourcesModalOpen}
                onClose={handleProvideResourcesModalClose}
                project={selectedProject}
                onResourceOfferSuccess={handleResourceOfferSuccess}
            />

            {/* Login Modal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </div>
    );
};

// Helper function to get SDG color
const getSDGColor = (sdgNumber) => {
    const sdgColors = {
        1: '#e5243b', // No Poverty
        2: '#dda63a', // Zero Hunger
        3: '#4c9f38', // Good Health
        4: '#c5192d', // Quality Education
        5: '#ff3a21', // Gender Equality
        6: '#26bde2', // Clean Water
        7: '#fcc30b', // Affordable Energy
        8: '#a21942', // Decent Work
        9: '#fd6925', // Industry Innovation
        10: '#dd1367', // Reduced Inequalities
        11: '#fd9d24', // Sustainable Cities
        12: '#bf8b2e', // Responsible Consumption
        13: '#3f7e44', // Climate Action
        14: '#0a97d9', // Life Below Water
        15: '#56c02b', // Life on Land
        16: '#00689d', // Peace and Justice
        17: '#19486a'  // Partnerships
    };
    return sdgColors[sdgNumber] || '#6c757d';
};

export default ProjectListing;