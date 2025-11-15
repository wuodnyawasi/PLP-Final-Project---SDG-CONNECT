import React from 'react';
import './ContributorDetailsModal.css';
import { FaTimes, FaUser, FaProjectDiagram, FaCalendarAlt, FaInfoCircle, FaTag, FaCheckCircle, FaClock, FaTruck } from 'react-icons/fa';

const ContributorDetailsModal = ({ isOpen, onClose, contributor }) => {
  if (!isOpen || !contributor) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getContributionTypeLabel = (type) => {
    switch (type) {
      case 'participant':
        return 'Participant';
      case 'resource_provider':
        return 'Resource Provider';
      case 'donor':
        return 'Donor';
      default:
        return type;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'confirmed';
      case 'delivered':
        return 'delivered';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const getAttendedBadgeClass = (attended) => {
    switch (attended) {
      case 'yes':
        return 'attended';
      case 'no':
        return 'not-attended';
      default:
        return 'pending';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content contributor-details-modal">
        <div className="modal-header">
          <h2>Contributor Details</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="contributor-details-content">
          {/* User Information */}
          <div className="details-section">
            <h3><FaUser /> User Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Name:</span>
                <span className="value">{contributor.user?.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{contributor.user?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="details-section">
            <h3><FaProjectDiagram /> Project Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Project Title:</span>
                <span className="value">{contributor.project?.title || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Project Type:</span>
                <span className="value">{contributor.project?.type || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Contribution Details */}
          <div className="details-section">
            <h3><FaInfoCircle /> Contribution Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Contribution Type:</span>
                <span className={`value type-badge ${contributor.contributionType}`}>
                  {getContributionTypeLabel(contributor.contributionType)}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Status:</span>
                <span className={`value status-badge ${getStatusBadgeClass(contributor.status)}`}>
                  {contributor.status}
                </span>
              </div>
              <div className="info-item">
                <span className="label"><FaCalendarAlt /> Created:</span>
                <span className="value">{formatDate(contributor.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Type-specific Details */}
          {contributor.contributionType === 'resource_provider' && (
            <div className="details-section">
              <h3><FaTruck /> Resource Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Resource Type:</span>
                  <span className="value">{contributor.resourceType || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Quantity:</span>
                  <span className="value">{contributor.quantity || 'N/A'}</span>
                </div>
                {contributor.deliveryDate && (
                  <div className="info-item">
                    <span className="label">Delivery Date:</span>
                    <span className="value">{formatDate(contributor.deliveryDate)}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="label">Delivery Status:</span>
                  <span className={`value status-badge ${contributor.resourcesDelivered === 'delivered' ? 'delivered' : 'pending'}`}>
                    {contributor.resourcesDelivered === 'delivered' ? 'Delivered' : 'Not Delivered'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {contributor.contributionType === 'donor' && (
            <div className="details-section">
              <h3><FaTag /> Donation Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Category:</span>
                  <span className="value">{contributor.donationCategory || 'N/A'}</span>
                </div>
                {contributor.quantity && (
                  <div className="info-item">
                    <span className="label">Quantity:</span>
                    <span className="value">{contributor.quantity}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {contributor.contributionType === 'participant' && (
            <div className="details-section">
              <h3><FaCheckCircle /> Attendance Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Attendance Status:</span>
                  <span className={`value status-badge ${getAttendedBadgeClass(contributor.attended)}`}>
                    {contributor.attended === 'yes' ? 'Attended' :
                     contributor.attended === 'no' ? 'Did Not Attend' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {contributor.notes && (
            <div className="details-section">
              <h3><FaInfoCircle /> Notes</h3>
              <p className="notes-text">{contributor.notes}</p>
            </div>
          )}
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

export default ContributorDetailsModal;
