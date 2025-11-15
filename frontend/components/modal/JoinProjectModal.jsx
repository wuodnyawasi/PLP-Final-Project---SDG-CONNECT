import React, { useState } from 'react';
import './JoinProjectModal.css';
import { FaTimes, FaUserPlus, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const JoinProjectModal = ({ isOpen, onClose, project, onJoinSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen || !project) return null;

    const handleJoinProject = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/projects/${project.id}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                onJoinSuccess();
                // Close modal after 2 seconds
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                }, 2000);
            } else {
                setError(data.error || 'Failed to join project');
            }
        } catch (error) {
            console.error('Join project error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const availableSlots = project.slotsRemaining || 0;
    const isFull = availableSlots <= 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content join-project-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="modal-header">
                    <h2><FaUserPlus /> Join Project</h2>
                </div>

                <div className="modal-body">
                    <div className="project-summary">
                        <h3>{project.title}</h3>
                        <p className="project-location">{project.city}, {project.exactLocation}</p>
                        <p className="project-description">{project.briefInfo}</p>

                        <div className="project-stats">
                            <div className="stat-item">
                                <span className="stat-label">Available Slots:</span>
                                <span className="stat-value">{Math.max(0, availableSlots)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Current Participants:</span>
                                <span className="stat-value">{project.participants?.length || 0}</span>
                            </div>
                        </div>
                    </div>

                    {success ? (
                        <div className="success-message">
                            <FaCheckCircle className="success-icon" />
                            <h3>Successfully Joined!</h3>
                            <p>You have successfully joined this project. You will be notified about project updates and important information.</p>
                        </div>
                    ) : isFull ? (
                        <div className="full-message">
                            <p>❌ This project is currently full. No slots available.</p>
                        </div>
                    ) : (
                        <div className="join-confirmation">
                            <p>Are you sure you want to join this project?</p>
                            <p className="join-note">
                                By joining, you commit to participating in this initiative and contributing to its success.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    {!isFull && !success && (
                        <button
                            className="btn-primary join-btn"
                            onClick={handleJoinProject}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="spinning" /> Joining...
                                </>
                            ) : (
                                <>
                                    <FaUserPlus /> Join Project
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JoinProjectModal;
