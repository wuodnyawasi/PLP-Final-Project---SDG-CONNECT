import React, { useState } from 'react';
import './ProjectDetailsModal.css';
import { FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTools, FaInfoCircle, FaTag, FaCheck, FaCheckCircle } from 'react-icons/fa';

const ProjectDetailsModal = ({ isOpen, onClose, project, onProjectUpdate }) => {
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [selectedResources, setSelectedResources] = useState([]);
    const [updating, setUpdating] = useState(false);
    const [currentProject, setCurrentProject] = useState(project);

    // Update currentProject when project prop changes
    React.useEffect(() => {
        setCurrentProject(project);
    }, [project]);

    if (!isOpen || !currentProject) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getLocationString = () => {
        const parts = [];
        if (currentProject.country) parts.push(currentProject.country);
        if (currentProject.city) parts.push(currentProject.city);
        if (currentProject.exactLocation) parts.push(currentProject.exactLocation);
        return parts.join(', ');
    };

    const handleParticipantSelect = (contributorId) => {
        setSelectedParticipants(prev =>
            prev.includes(contributorId)
                ? prev.filter(id => id !== contributorId)
                : [...prev, contributorId]
        );
    };

    const handleResourceSelect = (contributorId) => {
        setSelectedResources(prev =>
            prev.includes(contributorId)
                ? prev.filter(id => id !== contributorId)
                : [...prev, contributorId]
        );
    };

    const markParticipantsAttended = async () => {
        if (selectedParticipants.length === 0) return;

        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const promises = selectedParticipants.map(id =>
                fetch(`http://localhost:5000/api/contributors/${id}/attend`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })
            );

            await Promise.all(promises);
            setSelectedParticipants([]);

            // Refresh project data by fetching the full project again
            await refreshProjectData();
        } catch (error) {
            console.error('Error marking participants as attended:', error);
            alert('Failed to update participants');
        } finally {
            setUpdating(false);
        }
    };

    const refreshProjectData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token && currentProject.id) {
            const response = await fetch(`http://localhost:5000/api/projects/${currentProject.id}?t=${Date.now()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentProject({ ...data.project });
                // Call onProjectUpdate to refresh parent component if provided
                if (onProjectUpdate) {
                    onProjectUpdate();
                }
            }
            }
        } catch (error) {
            console.error('Error refreshing project data:', error);
        }
    };

    const markResourcesDelivered = async () => {
        if (selectedResources.length === 0) return;

        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const promises = selectedResources.map(id =>
                fetch(`http://localhost:5000/api/contributors/${id}/deliver`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })
            );

            await Promise.all(promises);

            // Immediately update local state for better UX
            setCurrentProject(prev => ({
                ...prev,
                resourcesPromised: prev.resourcesPromised?.map(resource =>
                    selectedResources.includes(resource._id)
                        ? { ...resource, resourcesDelivered: 'delivered' }
                        : resource
                ) || []
            }));

            setSelectedResources([]);

            // Refresh project data by fetching the full project again to ensure consistency
            await refreshProjectData();
        } catch (error) {
            console.error('Error marking resources as delivered:', error);
            alert('Failed to update resources');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content project-details-modal">
                <div className="modal-header">
                    <h2>{currentProject.title}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="project-details-content">
                    {/* Project Image */}
                    {currentProject.projectImage && (
                        <div className="project-image-large">
                            <img
                                src={currentProject.projectImage.startsWith('http') ? currentProject.projectImage : `http://localhost:5000${currentProject.projectImage}`}
                                alt={currentProject.title}
                            />
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="details-section">
                        <h3><FaInfoCircle /> Basic Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Type:</span>
                                <span className={`value type-badge ${currentProject.type}`}>
                                    {currentProject.type.charAt(0).toUpperCase() + currentProject.type.slice(1)}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Status:</span>
                                <span className={`value status-badge ${currentProject.status}`}>
                                    {currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1)}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label"><FaCalendarAlt /> Start Date:</span>
                                <span className="value">{formatDate(currentProject.startDate)}</span>
                            </div>
                            {currentProject.endDate && (
                                <div className="info-item">
                                    <span className="label"><FaCalendarAlt /> End Date:</span>
                                    <span className="value">{formatDate(currentProject.endDate)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    {(currentProject.country || currentProject.city || currentProject.exactLocation) && (
                        <div className="details-section">
                            <h3><FaMapMarkerAlt /> Location</h3>
                            <p className="location-text">{getLocationString()}</p>
                        </div>
                    )}

                    {/* SDGs */}
                    {currentProject.sdgs && currentProject.sdgs.length > 0 && (
                        <div className="details-section">
                            <h3><FaTag /> Sustainable Development Goals</h3>
                            <div className="sdg-tags">
                                {currentProject.sdgs.map((sdg, index) => (
                                    <span key={index} className="sdg-tag">
                                        {sdg}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="details-section">
                        <h3><FaInfoCircle /> Description</h3>
                        <p className="description-text">{currentProject.briefInfo}</p>
                    </div>

                    {/* Requirements */}
                    <div className="details-section">
                        <h3><FaUsers /> Requirements</h3>
                        <div className="requirements-grid">
                            {currentProject.peopleRequired && (
                                <div className="requirement-item">
                                    <span className="label">People Required:</span>
                                    <span className="value">{currentProject.peopleRequired}</span>
                                </div>
                            )}
                            {currentProject.slotsRemaining !== undefined && (
                                <div className="requirement-item">
                                    <span className="label">Available Slots:</span>
                                    <span className="value">{currentProject.slotsRemaining}</span>
                                </div>
                            )}
                            {currentProject.resourcesRequired && (
                                <div className="requirement-item">
                                    <span className="label">Resources Required:</span>
                                    <span className="value">{currentProject.resourcesRequired}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Organization */}
                    {(currentProject.sponsors || currentProject.organizers) && (
                        <div className="details-section">
                            <h3><FaTools /> Organization</h3>
                            <div className="org-info">
                                {currentProject.sponsors && (
                                    <p><strong>Sponsors:</strong> {currentProject.sponsors}</p>
                                )}
                                {currentProject.organizers && (
                                    <p><strong>Organizers:</strong> {currentProject.organizers}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Additional Info */}
                    {currentProject.otherInfo && (
                        <div className="details-section">
                            <h3><FaInfoCircle /> Additional Information</h3>
                            <p className="additional-text">{currentProject.otherInfo}</p>
                        </div>
                    )}

                    {/* Contributors Section - Only show if user is the project owner */}
                    {currentProject.participantsAttending && currentProject.participantsAttending.length > 0 && (
                        <div className="details-section">
                            <div className="section-header">
                                <h3><FaUsers /> Participants Attending</h3>
                                <button
                                    className="refresh-btn"
                                    onClick={refreshProjectData}
                                    disabled={updating}
                                    title="Refresh data"
                                >
                                    ↻
                                </button>
                            </div>
                            <div className="contributors-list">
                                {currentProject.participantsAttending.map((participant) => (
                                    <div key={participant._id} className="contributor-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedParticipants.includes(participant._id)}
                                            onChange={() => handleParticipantSelect(participant._id)}
                                            className="contributor-checkbox"
                                        />
                                        <div className="contributor-info">
                                            <span className="contributor-name">{participant.user.name}</span>
                                            <span className="contributor-email">{participant.user.email}</span>
                                            {participant.user.phone && (
                                                <span className="contributor-phone">{participant.user.phone}</span>
                                            )}
                                        </div>
                                        <span className={`contributor-status ${participant.attended === 'yes' ? 'attended' : 'pending'}`}>
                                            {participant.attended === 'yes' ? (
                                                <>
                                                    <FaCheckCircle /> Attended
                                                </>
                                            ) : (
                                                'Pending'
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {selectedParticipants.length > 0 && (
                                <div className="contributors-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={markParticipantsAttended}
                                        disabled={updating}
                                    >
                                        {updating ? 'Updating...' : `Mark ${selectedParticipants.length} as Attended`}
                                    </button>
                                </div>
                            )}
                            {selectedParticipants.length === 0 && currentProject.participantsAttending && currentProject.participantsAttending.length > 0 && (
                                <div className="contributors-info">
                                    <p>Select participants to mark as attended</p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentProject.resourcesPromised && currentProject.resourcesPromised.length > 0 && (
                        <div className="details-section">
                            <div className="section-header">
                                <h3><FaTools /> Resources Promised</h3>
                                <button
                                    className="refresh-btn"
                                    onClick={refreshProjectData}
                                    disabled={updating}
                                    title="Refresh data"
                                >
                                    ↻
                                </button>
                            </div>
                            <div className="contributors-list">
                                {currentProject.resourcesPromised.map((resource) => (
                                    <div key={resource._id} className="contributor-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedResources.includes(resource._id)}
                                            onChange={() => handleResourceSelect(resource._id)}
                                            className="contributor-checkbox"
                                        />
                                        <div className="contributor-info">
                                            <span className="contributor-name">{resource.user.name}</span>
                                            <span className="contributor-email">{resource.user.email}</span>
                                            {resource.user.phone && (
                                                <span className="contributor-phone">{resource.user.phone}</span>
                                            )}
                                        </div>
                                        <div className="resource-details">
                                            <span className="resource-type">{resource.resourceType}</span>
                                            <span className="resource-quantity">Qty: {resource.quantity}</span>
                                            <span className="resource-delivery">Delivery: {formatDate(resource.deliveryDate)}</span>
                                        </div>
                                        <span className={`contributor-status ${resource.resourcesDelivered === 'delivered' ? 'delivered' : 'pending'}`}>
                                            {resource.resourcesDelivered === 'delivered' ? (
                                                <>
                                                    <FaCheckCircle /> Delivered
                                                </>
                                            ) : (
                                                'Not delivered'
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {selectedResources.length > 0 && (
                                <div className="contributors-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={markResourcesDelivered}
                                        disabled={updating}
                                    >
                                        {updating ? 'Updating...' : `Mark ${selectedResources.length} as Delivered`}
                                    </button>
                                </div>
                            )}
                            {selectedResources.length === 0 && currentProject.resourcesPromised && currentProject.resourcesPromised.length > 0 && (
                                <div className="contributors-info">
                                    <p>Select resources to mark as delivered</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Creator Details */}
                    {currentProject.createdBy && (
                        <div className="details-section">
                            <h3><FaInfoCircle /> Creator Details</h3>
                            <div className="creator-info">
                                <div className="info-item">
                                    <span className="label">Name:</span>
                                    <span className="value">{currentProject.createdBy.name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Email:</span>
                                    <span className="value">{currentProject.createdBy.email}</span>
                                </div>
                                {currentProject.createdBy.phone && (
                                    <div className="info-item">
                                        <span className="label">Phone:</span>
                                        <span className="value">{currentProject.createdBy.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Created Date */}
                    <div className="details-section">
                        <p className="created-date">
                            Created on {formatDate(currentProject.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="close-btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsModal;
