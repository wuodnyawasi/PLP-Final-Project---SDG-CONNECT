import React from 'react';
import './OfferDetailsModal.css';

const OfferDetailsModal = ({ isOpen, onClose, offer }) => {
  if (!isOpen || !offer) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  const getCategoryDisplayName = (category) => {
    return category.replace('-', '/').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content offer-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Offer Details</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="offer-info-section">
            <div className="info-row">
              <label>Category:</label>
              <span className="category-badge">{getCategoryDisplayName(offer.category)}</span>
            </div>

            <div className="info-row">
              <label>Status:</label>
              <span className={`status-badge ${getStatusBadgeClass(offer.status)}`}>
                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
              </span>
            </div>

            <div className="info-row">
              <label>Donor:</label>
              <span>{offer.isAnonymous ? 'Anonymous' : (offer.donorName || 'N/A')}</span>
            </div>

            <div className="info-row">
              <label>Contact:</label>
              <span>{offer.contact}</span>
            </div>

            <div className="info-row">
              <label>Submitted:</label>
              <span>{formatDate(offer.createdAt)}</span>
            </div>
          </div>

          <div className="offer-details-section">
            <h3>Offer Details</h3>

            {offer.category === 'skills-time' ? (
              <div className="details-grid">
                {offer.skill && (
                  <div className="detail-item">
                    <label>Skill:</label>
                    <span>{offer.skill}</span>
                  </div>
                )}
                {offer.timeCommitment && (
                  <div className="detail-item">
                    <label>Time Commitment:</label>
                    <span>{offer.timeCommitment}</span>
                  </div>
                )}
                {offer.method && (
                  <div className="detail-item">
                    <label>Method:</label>
                    <span>{offer.method}</span>
                  </div>
                )}
                {offer.experience && (
                  <div className="detail-item">
                    <label>Experience:</label>
                    <span>{offer.experience}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="details-grid">
                {offer.itemType && (
                  <div className="detail-item">
                    <label>Item Type:</label>
                    <span>{offer.itemType}</span>
                  </div>
                )}
                {offer.quantity && (
                  <div className="detail-item">
                    <label>Quantity:</label>
                    <span>{offer.quantity}</span>
                  </div>
                )}
                {offer.logistics && (
                  <div className="detail-item">
                    <label>Logistics:</label>
                    <span>{offer.logistics}</span>
                  </div>
                )}
                {offer.pickupLocation && (
                  <div className="detail-item">
                    <label>Pickup Location:</label>
                    <span>{offer.pickupLocation}</span>
                  </div>
                )}
                {offer.contactPerson && (
                  <div className="detail-item">
                    <label>Contact Person:</label>
                    <span>{offer.contactPerson}</span>
                  </div>
                )}
              </div>
            )}

            {offer.description && (
              <div className="description-section">
                <label>Description:</label>
                <p>{offer.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailsModal;
