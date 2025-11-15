import React, { useState } from 'react';
import './ProjectEventModal.css';
import { FaTimes, FaSpinner, FaUpload } from 'react-icons/fa';

const ProjectEventModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        type: 'project', // 'project' or 'event'
        title: '',
        sdgs: [],
        startDate: '',
        endDate: '',
        country: '',
        city: '',
        exactLocation: '',
        sponsors: '',
        organizers: '',
        briefInfo: '',
        peopleRequired: '',
        resourcesRequired: '',
        otherInfo: ''
    });
    const [projectImageFile, setProjectImageFile] = useState(null);
    const [projectImagePreview, setProjectImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSdgChange = (sdg) => {
        setFormData(prev => ({
            ...prev,
            sdgs: prev.sdgs.includes(sdg)
                ? prev.sdgs.filter(s => s !== sdg)
                : [...prev.sdgs, sdg]
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const filetypes = /jpeg|jpg|png|gif/;
            const extname = filetypes.test(file.name.toLowerCase());
            const mimetype = filetypes.test(file.type);

            if (!mimetype || !extname) {
                alert('Only image files are allowed!');
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB!');
                return;
            }

            setProjectImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setProjectImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();

            // Add all form fields
            Object.keys(formData).forEach(key => {
                if (key === 'sdgs') {
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Add project image file if selected
            if (projectImageFile) {
                formDataToSend.append('projectImage', projectImageFile);
            }

            const response = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Project/Event created successfully!');
                setTimeout(() => {
                    onClose();
                    // Reset form
                setFormData({
                    type: 'project',
                    title: '',
                    sdgs: [],
                    startDate: '',
                    endDate: '',
                    country: '',
                    city: '',
                    exactLocation: '',
                    sponsors: '',
                    organizers: '',
                    briefInfo: '',
                    peopleRequired: '',
                    resourcesRequired: '',
                    otherInfo: ''
                });
                    setProjectImageFile(null);
                    setProjectImagePreview('');
                }, 1500);
            } else {
                setMessage(data.error || 'Failed to create project/event');
            }
        } catch (err) {
            setMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const sdgOptions = [
        'No Poverty',
        'Zero Hunger',
        'Good Health and Well-Being',
        'Quality Education',
        'Gender Equality',
        'Clean Water and Sanitation',
        'Affordable and Clean Energy',
        'Decent Work and Economic Growth',
        'Industry, Innovation and Infrastructure',
        'Reduced Inequalities',
        'Sustainable Cities and Communities',
        'Responsible Consumption and Production',
        'Climate Action',
        'Life Below Water',
        'Life on Land',
        'Peace, Justice and Strong Institutions',
        'Partnerships for the Goals'
    ];

    return (
        <div className="modal-overlay">
            <div className="modal-content project-event-modal">
                <div className="modal-header">
                    <h2>Start a New Project/Event</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="project-event-form">
                    <div className="form-section">
                        <h3>Basic Information</h3>
                        <div className="form-group">
                            <label>Type *</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="project"
                                        checked={formData.type === 'project'}
                                        onChange={handleInputChange}
                                    />
                                    Project
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="event"
                                        checked={formData.type === 'event'}
                                        onChange={handleInputChange}
                                    />
                                    Event
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter project/event title"
                            />
                        </div>

                        <div className="form-group">
                            <label>SDGs Covered *</label>
                            <div className="sdg-checkboxes">
                                {sdgOptions.map(sdg => (
                                    <label key={sdg} className="sdg-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.sdgs.includes(sdg)}
                                            onChange={() => handleSdgChange(sdg)}
                                        />
                                        {sdg}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date *</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    placeholder="e.g., United States"
                                />
                            </div>
                            <div className="form-group">
                                <label>City/Town</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="e.g., New York"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Exact Location</label>
                            <input
                                type="text"
                                name="exactLocation"
                                value={formData.exactLocation}
                                onChange={handleInputChange}
                                placeholder="e.g., 123 Main St, Central Park"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Organization</h3>
                        <div className="form-group">
                            <label>Sponsors</label>
                            <input
                                type="text"
                                name="sponsors"
                                value={formData.sponsors}
                                onChange={handleInputChange}
                                placeholder="Comma-separated list of sponsors"
                            />
                        </div>

                        <div className="form-group">
                            <label>Organizers</label>
                            <input
                                type="text"
                                name="organizers"
                                value={formData.organizers}
                                onChange={handleInputChange}
                                placeholder="Comma-separated list of organizers"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Details</h3>
                        <div className="form-group">
                            <label>Brief Information *</label>
                            <textarea
                                name="briefInfo"
                                value={formData.briefInfo}
                                onChange={handleInputChange}
                                rows="3"
                                required
                                placeholder="Provide a brief description"
                            />
                        </div>

                        <div className="form-group">
                            <label>Number of People Required</label>
                            <input
                                type="number"
                                name="peopleRequired"
                                value={formData.peopleRequired}
                                onChange={handleInputChange}
                                min="0"
                                placeholder="Enter number"
                            />
                        </div>

                        <div className="form-group">
                            <label>Resources Required</label>
                            <textarea
                                name="resourcesRequired"
                                value={formData.resourcesRequired}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="List required resources"
                            />
                        </div>

                        <div className="form-group">
                            <label>Other Information</label>
                            <textarea
                                name="otherInfo"
                                value={formData.otherInfo}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Any additional information"
                            />
                        </div>

                        <div className="form-group">
                            <label>Project/Event Image</label>
                            <div className="file-upload-container">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file-input"
                                    id="projectImage"
                                />
                                <label htmlFor="projectImage" className="file-upload-btn">
                                    <FaUpload /> Choose from Gallery
                                </label>
                                {projectImagePreview && (
                                    <div className="image-preview">
                                        <img src={projectImagePreview} alt="Project/Event Preview" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? <FaSpinner className="loading-spinner" /> : 'Submit'}
                        </button>
                    </div>

                    {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default ProjectEventModal;
