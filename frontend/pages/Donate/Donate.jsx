import React, { useState, useEffect } from 'react';
import './Donate.css';
import { FaHeart, FaMoneyBillWave, FaTruck, FaUsers, FaHandshake, FaChartLine, FaCreditCard, FaUniversity } from 'react-icons/fa';

const Donate = () => {
    const [donationStats, setDonationStats] = useState({
        totalDonated: 0,
        donorsCount: 0,
        highestDonation: 0,
        lowestDonation: 0
    });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        amount: '',
        anonymous: false
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentCanceled, setPaymentCanceled] = useState(false);
    const [stkPushInitiated, setStkPushInitiated] = useState(false);
    const [stkPushMessage, setStkPushMessage] = useState('');
    const [recentDonations, setRecentDonations] = useState([]);
    const [recentDonationsLoading, setRecentDonationsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        console.log('useEffect triggered with refreshTrigger:', refreshTrigger);

        // Check for payment success/cancel parameters in URL
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const canceled = urlParams.get('canceled');

        if (success === 'true') {
            setPaymentSuccess(true);
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (canceled === 'true') {
            setPaymentCanceled(true);
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Fetch donation stats from API
        const fetchDonationStats = async () => {
            try {
                console.log('Fetching donation stats...');
                const response = await fetch('http://localhost:5000/api/donations/stats');
                if (response.ok) {
                    const data = await response.json();
                    console.log('Donation stats fetched:', data);
                    setDonationStats(data);
                } else {
                    console.error('Failed to fetch donation stats:', response.statusText);
                    // Fallback to mock data if API fails
                    setDonationStats({
                        totalDonated: 0,
                        donorsCount: 0,
                        highestDonation: 0,
                        lowestDonation: 0
                    });
                }
            } catch (error) {
                console.error('Error fetching donation stats:', error);
                // Fallback to mock data if API fails
                setDonationStats({
                    totalDonated: 0,
                    donorsCount: 0,
                    highestDonation: 0,
                    lowestDonation: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDonationStats();

        // Fetch recent donations
        const fetchRecentDonations = async () => {
            try {
                console.log('Fetching recent donations...');
                const response = await fetch('http://localhost:5000/api/donations/recent');
                if (response.ok) {
                    const data = await response.json();
                    console.log('Recent donations fetched:', data);
                    setRecentDonations(data);
                } else {
                    console.error('Failed to fetch recent donations:', response.statusText);
                    // Fallback to empty array if API fails
                    setRecentDonations([]);
                }
            } catch (error) {
                console.error('Error fetching recent donations:', error);
                // Fallback to empty array if API fails
                setRecentDonations([]);
            } finally {
                setRecentDonationsLoading(false);
            }
        };

        fetchRecentDonations();
    }, [refreshTrigger]);



    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitMessage('');
        setStkPushInitiated(false);
        setStkPushMessage('');

        try {
            // Initiate M-Pesa STK Push
            const response = await fetch('http://localhost:5000/api/donations/initiate-stk-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // STK Push initiated successfully
                setStkPushInitiated(true);
                setStkPushMessage(data.customerMessage || 'Please check your phone and enter your M-Pesa PIN to complete the payment.');
                setSubmitting(false);

                // Refresh the data after successful donation initiation
                console.log('Setting refresh trigger after donation initiation');
                setRefreshTrigger(prev => {
                    const newValue = prev + 1;
                    console.log('New refresh trigger value:', newValue);
                    return newValue;
                });
                // For now, we'll just show the success message and let the callback handle the rest
            } else {
                setSubmitMessage(data.error || 'An error occurred. Please try again.');
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Donation submission error:', error);
            setSubmitMessage('An error occurred. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <div className="donate-page">
            {/* Payment Success/Cancel Messages */}
            {paymentSuccess && (
                <div className="payment-message success-message">
                    <div className="message-content">
                        <FaHeart className="message-icon" />
                        <div>
                            <h3>Thank You for Your Donation!</h3>
                            <p>Your payment has been processed successfully. A confirmation email has been sent to you.</p>
                        </div>
                        <button
                            className="close-message-btn"
                            onClick={() => setPaymentSuccess(false)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {paymentCanceled && (
                <div className="payment-message cancel-message">
                    <div className="message-content">
                        <FaCreditCard className="message-icon" />
                        <div>
                            <h3>Payment Canceled</h3>
                            <p>Your donation was not completed. You can try again whenever you're ready.</p>
                        </div>
                        <button
                            className="close-message-btn"
                            onClick={() => setPaymentCanceled(false)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Upper Section: Why We Need Donations */}
            <section className="donate-header">
                <div className="header-content">
                    <h1><FaHeart className="heart-icon" /> Support Our Mission</h1>
                    <p className="header-subtitle">
                        Your generous donations make a real difference in connecting resources with those who need them most.
                    </p>

                    <div className="why-donate-grid">
                        <div className="why-donate-card">
                            <FaTruck className="why-icon" />
                            <h3>Resource Transportation</h3>
                            <p>
                                We transport essential resources from generous donors to communities and projects in need.
                                Every donation helps us cover fuel costs, vehicle maintenance, and logistics to ensure
                                that food, clothing, and supplies reach their intended destinations efficiently.
                            </p>
                        </div>

                        <div className="why-donate-card">
                            <FaHandshake className="why-icon" />
                            <h3>Coordination & Management</h3>
                            <p>
                                Coordinating resources and projects requires dedicated staff and technology.
                                Your support enables us to match donors with projects, verify needs, and ensure
                                that every contribution creates maximum impact in our communities.
                            </p>
                        </div>

                        <div className="why-donate-card">
                            <FaUsers className="why-icon" />
                            <h3>Team & Operations</h3>
                            <p>
                                Behind every successful connection is a team of passionate professionals.
                                We employ coordinators, drivers, administrators, and support staff who work tirelessly
                                to make SDGConnect a bridge between generosity and need.
                            </p>
                        </div>
                    </div>

                    <div className="impact-message">
                        <p>
                            <strong>Without your support, these critical operations would not be possible.</strong>
                            Every Ksh donated directly contributes to building stronger, more connected communities
                            and achieving our shared sustainable development goals.
                        </p>
                    </div>

                    <div className="donate-action">
                        <button
                            className="donate-now-btn"
                            onClick={() => setShowForm(!showForm)}
                        >
                            <FaCreditCard /> Make a Donation
                        </button>
                    </div>
                </div>
            </section>

            {/* Donation Form */}
            {showForm && (
                <section className="donation-form-section">
                    <div className="form-container">
                        <h2><FaCreditCard /> Make Your Donation</h2>
                        <form onSubmit={handleSubmit} className="donation-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">M-Pesa Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="254XXXXXXXXX (without +)"
                                        pattern="254[0-9]{9}"
                                        title="Enter phone number in format: 254XXXXXXXXX"
                                    />
                                    <small className="form-hint">Enter your M-Pesa registered phone number (254XXXXXXXXX)</small>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="amount">Donation Amount (Ksh) *</label>
                                    <input
                                        type="number"
                                        id="amount"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        placeholder="Enter amount in Ksh"
                                    />
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="anonymous"
                                        checked={formData.anonymous}
                                        onChange={handleInputChange}
                                    />
                                    <span className="checkmark"></span>
                                    I wish to remain anonymous in the donation list
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="submit-donation-btn"
                                disabled={submitting}
                            >
                                {submitting ? 'Processing...' : 'Submit Donation'}
                            </button>

                            {stkPushInitiated && (
                                <div className="message success">
                                    <strong>M-Pesa STK Push Initiated!</strong><br />
                                    {stkPushMessage}<br />
                                    <small>Please check your phone and enter your M-Pesa PIN to complete the payment. You will receive a confirmation email once the payment is processed.</small>
                                </div>
                            )}

                            {submitMessage && (
                                <div className={`message ${submitMessage.includes('error') ? 'error' : 'success'}`}>
                                    {submitMessage}
                                </div>
                            )}
                        </form>
                    </div>
                </section>
            )}

            {/* Bank Account Details */}
            <section className="bank-details-section">
                    <div className="bank-details-container">
                        <h2><FaUniversity /> Alternative Payment Methods</h2>
                        <p>You can also donate directly to our bank accounts or use other M-Pesa options. Please include your name and "SDGConnect Donation" in the reference.</p>

                    <div className="bank-accounts">
                        <div className="bank-card">
                            <h3>M-Pesa Paybill</h3>
                            <div className="bank-info">
                                <p><strong>Business Number:</strong> 174379</p>
                                <p><strong>Account Name:</strong> SDGConnect Donation</p>
                                <p><strong>Instructions:</strong> Go to M-Pesa → Pay Bill → Enter business number → Enter account name → Enter amount</p>
                            </div>
                        </div>

                        <div className="bank-card">
                            <h3>KCB Bank</h3>
                            <div className="bank-info">
                                <p><strong>Account Name:</strong> SDGConnect Foundation</p>
                                <p><strong>Branch:</strong> Westlands Branch</p>
                                <p><strong>Account Number:</strong> 1234567890</p>
                                <p><strong>Swift Code:</strong> KCBLKENX</p>
                            </div>
                        </div>

                        <div className="bank-card">
                            <h3>Equity Bank</h3>
                            <div className="bank-info">
                                <p><strong>Account Name:</strong> SDGConnect Foundation</p>
                                <p><strong>Branch:</strong> Karen Branch</p>
                                <p><strong>Account Number:</strong> 0987654321</p>
                                <p><strong>Swift Code:</strong> EQBLKENA</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Body Section: Donation Details */}
            <section className="donation-details">
                <div className="details-content">
                    <div className="recent-donations">
                        <h3>Recent Contributions</h3>
                        <div className="donations-list">
                            {recentDonationsLoading ? (
                                <div className="loading-donations">
                                    <p>Loading recent donations...</p>
                                </div>
                            ) : recentDonations.length > 0 ? (
                                recentDonations.map((donation, index) => (
                                    <div key={index} className="donation-item">
                                        <div className="donor-info">
                                            <span className="donor-name">{donation.donorName}</span>
                                            <span className="donation-amount">{donation.amount}</span>
                                        </div>
                                        <div className="donation-purpose">{donation.purpose}</div>
                                        <div className="donation-date">{donation.date}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-donations">
                                    <p>No recent donations to display.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Lower Section: Thank You */}
            <section className="thank-you-section">
                <div className="thank-you-content">
                    <h2>Thank You for Your Continued Support</h2>
                    <p>
                        We are deeply grateful for every contribution, big or small. Your generosity enables us to
                        continue our vital work of connecting resources with communities in need. Together, we are
                        building a more sustainable and equitable world.
                    </p>

                    <div className="thank-you-message">
                        <FaHeart className="thank-you-icon" />
                        <p>
                            <strong>From the bottom of our hearts, thank you.</strong><br />
                            Your support means the world to us and to the communities we serve.
                        </p>
                    </div>

                    <div className="future-vision">
                        <h3>Looking Ahead</h3>
                        <p>
                            With your ongoing support, we envision expanding our reach to help even more communities
                            achieve their sustainable development goals. Every donation brings us closer to this vision.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Donate;
