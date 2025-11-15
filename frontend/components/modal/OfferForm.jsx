import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OfferForm.css'; // Create this CSS file next

// Define the core set of fields shared across all categories
const SharedFields = ({ donorName, setDonorName, contact, setContact, isAnonymous, setIsAnonymous }) => (
    <>
        <h3>Your Contact Information</h3>
        
        <label>
            <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={(e) => setIsAnonymous(e.target.checked)} 
            />
            Donate Anonymously (Optional)
        </label>
        
        <label>
            Your Name (or Organization Name):
            <input 
                type="text" 
                value={donorName} 
                onChange={(e) => setDonorName(e.target.value)} 
                disabled={isAnonymous}
            />
        </label>

        <label>
            Primary Contact (Phone or Email):
            <input 
                type="text" 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
                required 
            />
        </label>
    </>
);

// Form for Physical Items (Food, Clothing, Home Goods)
const PhysicalItemFields = ({ formData, handleInputChange }) => (
    <>
        <h3>Item Details</h3>
        <label>
            Item Type (e.g., Flour, T-shirts, TV, Fridge,Vegetables, Skills,Cash, Clothes etc):
            <input
                type="text"
                name="itemType"
                value={formData.itemType}
                onChange={handleInputChange}
                required
            />
        </label>
        <label>
            Quantity / Amount:
            <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
            />
        </label>
        <label>
            Brief Description of Item(s):
            <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Condition, shelf-life, size, etc."
                required
            ></textarea>
        </label>

        <h3>Logistics</h3>
        <div className="logistics-options">
            <label>
                <input
                    type="radio"
                    name="logistics"
                    value="delivery"
                    checked={formData.logistics === 'delivery'}
                    onChange={handleInputChange}
                    defaultChecked
                />
                I will deliver the item(s).
            </label>
            <label>
                <input
                    type="radio"
                    name="logistics"
                    value="pickup"
                    checked={formData.logistics === 'pickup'}
                    onChange={handleInputChange}
                />
                I require pickup.
            </label>
        </div>

        <label>
            Pickup Location (Exact address, if required):
            <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main St, Apt 4B"
            />
        </label>
        <label>
            Contact Person for Pickup:
            <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
            />
        </label>
    </>
);

// Form for Skills/Time
const SkillsFields = ({ formData, handleInputChange }) => (
    <>
        <h3>Skill Offer Details</h3>
        <label>
            What specific skill are you offering?
            <input
                type="text"
                name="skill"
                value={formData.skill}
                onChange={handleInputChange}
                placeholder="e.g., Web Design, Plumbing, Tutoring"
                required
            />
        </label>
        <label>
            Estimated Time Commitment (e.g., 5 hours/week, 1 weekend session):
            <input
                type="text"
                name="timeCommitment"
                value={formData.timeCommitment}
                onChange={handleInputChange}
                required
            />
        </label>
        <label>
            Preferred Method of Offer:
            <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                required
            >
                <option value="">-- Select Method --</option>
                <option value="online">Online / Remote</option>
                <option value="in-person">In Person / Local</option>
            </select>
        </label>
        <label>
            Brief Description of Experience:
            <textarea
                rows="3"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Tell us about your background in this skill."
                required
            ></textarea>
        </label>
    </>
);

// Main Component
const OfferForm = () => {
    // 1. Get the category from the URL path
    const { category } = useParams();
    const navigate = useNavigate();

    // Shared state for donor details
    const [donorName, setDonorName] = useState('');
    const [contact, setContact] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    // State for form fields
    const [formData, setFormData] = useState({
        itemType: '',
        quantity: '',
        description: '',
        logistics: '',
        pickupLocation: '',
        contactPerson: '',
        skill: '',
        timeCommitment: '',
        method: '',
        experience: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // Title mapping based on URL
    const cleanCategory = category.replace(/-/g, ' ').toUpperCase();

    let SpecificFields = null;

    // 2. Render specific fields based on the category
    if (category === 'money') {
        // You will implement the SendWave link/logic here tomorrow
        return (
            <div className="offer-form-container">
                <h2>Donate Money: {cleanCategory}</h2>
                <div className="money-cta-box">
                    <p>Thank you for choosing to donate funds! We partner with secure platforms to ensure your contribution makes an immediate impact.</p>
                    {/* Placeholder for SendWave integration */}
                    <button className="sendwave-btn">
                        Proceed to SendWave 💸
                    </button>
                    <p className="note">This section will be fully implemented tomorrow.</p>
                </div>
            </div>
        );
    } else if (category === 'skills-time') {
        SpecificFields = <SkillsFields />;
    } else if (category === 'other') {
        SpecificFields = <PhysicalItemFields />; // Use generic item form for 'Other'
    } else {
        // Covers food-perishables, clothing-bedding, home-furniture
        SpecificFields = <PhysicalItemFields />;
    }

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
        setMessage('');

        try {
            const offerData = {
                category,
                donorName,
                contact,
                isAnonymous,
                ...formData
            };

            const response = await fetch('http://localhost:5000/api/offer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(offerData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Offer submitted successfully!');
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setMessage(data.error || 'Failed to submit offer');
            }
        } catch (err) {
            setMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="offer-form-container">
            <h2>Offer Details: {cleanCategory}</h2>
            <p>Please provide details about your generous offer below. Fields marked with an asterisk (*) are required.</p>
            
            <form onSubmit={handleSubmit} className="offer-form">
                
                {SpecificFields && React.cloneElement(SpecificFields, { formData, handleInputChange })}

                <SharedFields
                    donorName={donorName}
                    setDonorName={setDonorName}
                    contact={contact}
                    setContact={setContact}
                    isAnonymous={isAnonymous}
                    setIsAnonymous={setIsAnonymous}
                />

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Offer'}
                    </button>
                </div>

                {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
            </form>
        </div>
    );
};

export default OfferForm;