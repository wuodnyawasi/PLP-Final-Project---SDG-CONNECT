import React, { useState, useEffect } from 'react';
import './ProfileUpdateModal.css';
import { FaTimes, FaSpinner, FaUpload } from 'react-icons/fa';

const ProfileUpdateModal = ({ isOpen, onClose, userData, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        dateOfBirth: '',
        organization: '',
        skills: [],
        bio: '',
        country: '',
        city: '',
        exactLocation: ''
    });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (userData && isOpen) {
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                gender: userData.gender || '',
                dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
                organization: userData.organization || '',
                skills: userData.skills || [],
                bio: userData.bio || '',
                country: userData.country || '',
                city: userData.city || '',
                exactLocation: userData.exactLocation || ''
            });
            setProfilePictureFile(null);
            setProfilePicturePreview(userData.profilePicture || '');
            setMessage('');
        }
    }, [userData, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skillInput.trim()]
            }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setProfilePicturePreview(e.target.result);
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
                if (key === 'skills') {
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Add profile picture file if selected
            if (profilePictureFile) {
                formDataToSend.append('profilePicture', profilePictureFile);
            }

            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Profile updated successfully!');
                onUpdate(data.user);
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setMessage(data.error || 'Failed to update profile');
            }
        } catch (err) {
            setMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content profile-update-modal">
                <div className="modal-header">
                    <h2>Update Profile</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-section">
                        <h3>Basic Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="e.g., +1-234-567-8900"
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Non-binary">Non-binary</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Professional Information</h3>
                        <div className="form-group">
                            <label>Industry / School</label>
                            <input
                                type="text"
                                name="organization"
                                value={formData.organization}
                                onChange={handleInputChange}
                                placeholder="e.g., Technology, University of XYZ"
                            />
                        </div>

                        <div className="form-group">
                            <label>Career Path / Skills</label>
                            <div className="skills-input">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    placeholder="Add a skill (e.g., JavaScript, Project Management)"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                />
                                <button type="button" onClick={handleAddSkill} className="add-skill-btn">
                                    Add
                                </button>
                            </div>
                            <div className="skills-list">
                                {formData.skills.map((skill, index) => (
                                    <span key={index} className="skill-tag">
                                        {skill}
                                        <button type="button" onClick={() => handleRemoveSkill(skill)}>
                                            <FaTimes />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Additional Information</h3>
                        <div className="form-group">
                            <label>Profile Picture</label>
                            <div className="file-upload-container">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file-input"
                                    id="profilePicture"
                                />
                                <label htmlFor="profilePicture" className="file-upload-btn">
                                    <FaUpload /> Choose from Gallery
                                </label>
                                {profilePicturePreview && (
                                    <div className="image-preview">
                                        <img src={profilePicturePreview} alt="Preview" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Tell us about yourself..."
                                rows="3"
                                maxLength="500"
                            />
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
                                <label>City</label>
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
                                placeholder="e.g., 123 Main St, Apt 4B"
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="update-btn" disabled={loading}>
                            {loading ? <FaSpinner className="loading-spinner" /> : 'Update Profile'}
                        </button>
                    </div>

                    {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default ProfileUpdateModal;
