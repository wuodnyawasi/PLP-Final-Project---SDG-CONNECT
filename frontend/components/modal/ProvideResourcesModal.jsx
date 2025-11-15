import React, { useState } from 'react';
import './ProvideResourcesModal.css';
import { FaTimes, FaBoxOpen, FaSpinner, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

const ProvideResourcesModal = ({ isOpen, onClose, project, onResourceOfferSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        resourceType: '',
        quantity: '',
        deliveryDate: ''
    });

    if (!isOpen || !project) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!formData.resourceType.trim() || !formData.quantity || !formData.deliveryDate) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        if (parseInt(formData.quantity) <= 0) {
            setError('Quantity must be greater than 0');
            setLoading(false);
            return;
        }

        const deliveryDate = new Date(formData.deliveryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (deliveryDate < today) {
            setError('Delivery date cannot be in the past');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/projects/${project.id}/resources`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                onResourceOfferSuccess();
                // Close modal after 2 seconds
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    // Reset form
                    setFormData({
                        resourceType: '',
                        quantity: '',
                        deliveryDate: ''
                    });
                }, 2000);
            } else {
                setError(data.error || 'Failed to submit resource offer');
            }
        } catch (error) {
            console.error('Resource offer error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setFormData({
            resourceType: '',
            quantity: '',
            deliveryDate: ''
        });
        setError(null);
        setSuccess(false);
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content provide-resources-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose}>
                    <FaTimes />
                </button>

                <div className="modal-header">
                    <h2><FaBoxOpen /> Provide Resources</h2>
                </div>

                <div className="modal-body">
                    <div className="project-summary">
                        <h3>{project.title}</h3>
                        <p className="project-location">{project.city}, {project.exactLocation}</p>
                        <p className="project-description">{project.briefInfo}</p>
                    </div>

                    {success ? (
                        <div className="success-message">
                            <FaCheckCircle className="success-icon" />
                            <h3>Resource Offer Submitted!</h3>
                            <p>Your resource offer has been submitted successfully. The project organizer will review your offer and contact you if needed.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="resource-form">
                            <div className="form-group">
                                <label htmlFor="resourceType">Resource Type *</label>
                                <input
                                    type="text"
                                    id="resourceType"
                                    name="resourceType"
                                    value={formData.resourceType}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Food packages, Medical supplies, Tools, etc."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="quantity">Quantity *</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 50"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="deliveryDate">Delivery Date *</label>
                                <div className="date-input-wrapper">
                                    <FaCalendarAlt className="date-icon" />
                                    <input
                                        type="date"
                                        id="deliveryDate"
                                        name="deliveryDate"
                                        value={formData.deliveryDate}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-note">
                                <p>
                                    <strong>Note:</strong> By submitting this offer, you commit to delivering the specified resources
                                    to the project location on the selected date. The project organizer will be notified and may
                                    contact you to confirm details.
                                </p>
                            </div>

                            {error && (
                                <div className="error-message">
                                    <p>{error}</p>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    {!success && (
                        <button
                            type="submit"
                            className="btn-primary resource-btn"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="spinning" /> Submitting...
                                </>
                            ) : (
                                <>
                                    <FaBoxOpen /> Submit Offer
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProvideResourcesModal;
