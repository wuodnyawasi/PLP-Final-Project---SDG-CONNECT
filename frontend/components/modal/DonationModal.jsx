// DonationModal.jsx
import React from 'react';
import './DonationModal.css'; // We'll create this CSS next
import { FaTimes, FaUtensils, FaTshirt, FaCouch, FaMoneyBillWave, FaQuestion, FaBook } from 'react-icons/fa';

const DonationModal = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    // Donation Categories
    const categories = [
        { icon: FaUtensils, name: 'Food/Perishables', description: 'Flour, vegetables, cooking oils, canned goods, fresh produce.' },
        { icon: FaTshirt, name: 'Clothing/Bedding', description: 'T-shirts, bed sheets, trousers, blankets, jackets, pillows.' },
        { icon: FaCouch, name: 'Home/Furniture', description: 'TV, sofa, fridge, microwave, tables, chairs, appliances.' },
        { icon: FaMoneyBillWave, name: 'Money', description: 'Cash, cheque, mobile money, bank transfer, online payments.' },
        { icon: FaBook, name: 'Education', description: 'Books, notebooks, pens, pencils, school supplies, educational materials.' },
        { icon: FaQuestion, name: 'Other', description: 'Skills, knowledge, training, time, expertise, miscellaneous items.' },
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