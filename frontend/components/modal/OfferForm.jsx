import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
const PhysicalItemFields = () => (
    <>
        <h3>Item Details</h3>
        <label>
            Item Type (e.g., Canned Beans, T-Shirts, Refrigerator):
            <input type="text" required />
        </label>
        <label>
            Quantity / Amount:
            <input type="text" required />
        </label>
        <label>
            Brief Description of Item(s):
            <textarea rows="3" placeholder="Condition, shelf-life, size, etc." required></textarea>
        </label>

        <h3>Logistics</h3>
        <div className="logistics-options">
            <label>
                <input type="radio" name="logistics" value="delivery" defaultChecked />
                I will deliver the item(s).
            </label>
            <label>
                <input type="radio" name="logistics" value="pickup" />
                I require pickup.
            </label>
        </div>

        <label>
            Pickup Location (Exact address, if required):
            <input type="text" placeholder="e.g., 123 Main St, Apt 4B" />
        </label>
        <label>
            Contact Person for Pickup:
            <input type="text" />
        </label>
    </>
);

// Form for Skills/Time
const SkillsFields = () => (
    <>
        <h3>Skill Offer Details</h3>
        <label>
            What specific skill are you offering?
            <input type="text" placeholder="e.g., Web Design, Plumbing, Tutoring" required />
        </label>
        <label>
            Estimated Time Commitment (e.g., 5 hours/week, 1 weekend session):
            <input type="text" required />
        </label>
        <label>
            Preferred Method of Offer:
            <select required>
                <option value="">-- Select Method --</option>
                <option value="online">Online / Remote</option>
                <option value="in-person">In Person / Local</option>
            </select>
        </label>
        <label>
            Brief Description of Experience:
            <textarea rows="3" placeholder="Tell us about your background in this skill." required></textarea>
        </label>
    </>
);

// Main Component
const OfferForm = () => {
    // 1. Get the category from the URL path
    const { category } = useParams(); 
    
    // Shared state for donor details
    const [donorName, setDonorName] = useState('');
    const [contact, setContact] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Add submission logic (API call, form validation)
        alert(`Thank you! Your ${cleanCategory} offer has been submitted!`);
    };

    return (
        <div className="offer-form-container">
            <h2>Offer Details: {cleanCategory}</h2>
            <p>Please provide details about your generous offer below. Fields marked with an asterisk (*) are required.</p>
            
            <form onSubmit={handleSubmit} className="offer-form">
                
                {SpecificFields}
                
                <SharedFields 
                    donorName={donorName} 
                    setDonorName={setDonorName} 
                    contact={contact} 
                    setContact={setContact} 
                    isAnonymous={isAnonymous} 
                    setIsAnonymous={setIsAnonymous} 
                />

                <button type="submit" className="submit-btn">Submit Offer</button>
            </form>
        </div>
    );
};

export default OfferForm;