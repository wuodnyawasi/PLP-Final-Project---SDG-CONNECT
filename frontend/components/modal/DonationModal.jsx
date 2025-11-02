// DonationModal.jsx
import React from 'react';
import './DonationModal.css'; // We'll create this CSS next
import { FaTimes, FaUtensils, FaTshirt, FaCouch, FaMoneyBillWave, FaQuestion } from 'react-icons/fa';

const DonationModal = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    // Donation Categories
    const categories = [
        { icon: FaUtensils, name: 'Food/Perishables', description: 'Fresh food, canned goods, dried goods.' },
        { icon: FaTshirt, name: 'Clothing/Bedding', description: 'New or gently used apparel, blankets, sheets.' },
        { icon: FaCouch, name: 'Home/Furniture', description: 'Appliances, furniture, household items.' },
        { icon: FaMoneyBillWave, name: 'Money', description: 'Financial contributions and funds.' },
        { icon: FaQuestion, name: 'Other', description: 'Skills, time, or other miscellaneous items.' },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
                    <FaTimes />
                </button>
                
                <h3>What would you like to donate?</h3>
                <p>Select a category to view specific needs in your area or list your offer.</p>

                <div className="category-grid">
                    {categories.map((cat, index) => (
                        <div key={index} className="category-card">
                            <cat.icon className="category-icon" />
                            <h4>{cat.name}</h4>
                            <p>{cat.description}</p>
                            <a href={`/offer/${cat.name.toLowerCase().replace(/[/\s]/g, '-')}`}
                                className="donate-link"
                                onClick={onClose}
                            >
                                Offer Now
                            </a>
                        </div>
                    ))}
                </div>
                
            </div>
        </div>
    );
};

export default DonationModal;