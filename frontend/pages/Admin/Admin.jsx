import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import { FaUsers, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaHandsHelping, FaEye, FaMoneyBillWave } from 'react-icons/fa';
import ProjectDetailsModal from '../../components/modal/ProjectDetailsModal';
import ContributorDetailsModal from '../../components/modal/ContributorDetailsModal';
import OfferDetailsModal from '../../components/modal/OfferDetailsModal';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOffers: 0,
    pendingOffers: 0,
    totalProjects: 0,
    pendingProjects: 0,
    totalDonations: 0,
    totalDonated: 0
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectStatusFilter, setProjectStatusFilter] = useState('');
  const [offerStatusFilter, setOfferStatusFilter] = useState('');
  const [offerCategoryFilter, setOfferCategoryFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [isContributorModalOpen, setIsContributorModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [donations, setDonations] = useState([]);
  const [donationStatusFilter, setDonationStatusFilter] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoApproveOffers: false,
    maintenanceMode: false,
    smtpServer: 'smtp.gmail.com',
    adminEmail: 'owadgijagor@gmail.com',
    siteName: 'SDG Connect',
    contactEmail: 'owadgijagor@gmail.com',
    maxProjectsPerUser: 10,
    allowUserRegistration: true
  });

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.isAdmin) {
        setIsAdmin(true);
        fetchStats();
        fetchProjects();
        fetchUsers();
        fetchContributors();
        fetchOffers();
        fetchDonations();
        fetchSettings();
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate, projectStatusFilter]);

  useEffect(() => {
    if (isAdmin) {
      fetchOffers();
    }
  }, [offerStatusFilter, offerCategoryFilter, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchDonations();
    }
  }, [donationStatusFilter, isAdmin]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = projectStatusFilter
        ? `http://localhost:5000/api/admin/projects?status=${projectStatusFilter}`
        : 'http://localhost:5000/api/admin/projects';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/contributors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContributors(data.contributors);
      } else {
        console.error('Failed to fetch contributors');
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = offerStatusFilter || offerCategoryFilter
        ? `http://localhost:5000/api/admin/offers?${offerStatusFilter ? `status=${offerStatusFilter}` : ''}${offerCategoryFilter ? `&category=${offerCategoryFilter}` : ''}`
        : 'http://localhost:5000/api/admin/offers';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers);
      } else {
        console.error('Failed to fetch offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        console.error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'users', label: 'User Management', icon: <FaUsers /> },
    { id: 'projects', label: 'Project Management', icon: <FaClipboardList /> },
    { id: 'offers', label: 'Offer Management', icon: <FaClipboardList /> },
    { id: 'donations', label: 'Donation Management', icon: <FaMoneyBillWave /> },
    { id: 'contributors', label: 'Contributors', icon: <FaHandsHelping /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ];

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon offers">
            <FaClipboardList />
          </div>
          <div className="stat-content">
            <h3>{stats.totalOffers}</h3>
            <p>Total Offers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaClipboardList />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingOffers}</h3>
            <p>Pending Offers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon projects">
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>{stats.totalProjects}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingProjects}</h3>
            <p>Pending Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon donations">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <h3>{stats.totalDonations}</h3>
            <p>Total Donations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon donations">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <h3>Ksh {stats.totalDonated.toLocaleString()}</h3>
            <p>Total Donated</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-time">2 hours ago</span>
            <span className="activity-desc">New user registered: john.doe@example.com</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">4 hours ago</span>
            <span className="activity-desc">New offer submitted: Food donation - 50kg rice</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">6 hours ago</span>
            <span className="activity-desc">Contact form submitted by: jane.smith@example.com</span>
          </div>
        </div>
      </div>
    </div>
  );

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleToggleDisableUser = async (userId, isDisabled) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isDisabled: !isDisabled })
      });

      if (response.ok) {
        setUsers(users.map(user =>
          user._id === userId ? { ...user, isDisabled: !isDisabled } : user
        ));
        alert(`User ${!isDisabled ? 'disabled' : 'enabled'} successfully`);
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleToggleAdmin = async (userId, isAdmin) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAdmin: !isAdmin })
      });

      if (response.ok) {
        setUsers(users.map(user =>
          user._id === userId ? { ...user, isAdmin: !isAdmin } : user
        ));
        alert(`User ${!isAdmin ? 'promoted to admin' : 'demoted from admin'} successfully`);
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleProjectStatusUpdate = async (projectId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setProjects(projects.map(project =>
          project.id === projectId ? { ...project, status: newStatus } : project
        ));
        alert(`Project ${newStatus} successfully`);
        // Refresh stats
        fetchStats();
      } else {
        alert('Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Error updating project status');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProjects(projects.filter(project => project.id !== projectId));
        alert('Project deleted successfully');
        // Refresh stats
        fetchStats();
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const handleViewProjectDetails = (project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setSelectedProject(null);
  };

  const handleViewContributorDetails = (contributor) => {
    setSelectedContributor(contributor);
    setIsContributorModalOpen(true);
  };

  const handleCloseContributorModal = () => {
    setIsContributorModalOpen(false);
    setSelectedContributor(null);
  };

  const handleViewOfferDetails = (offer) => {
    setSelectedOffer(offer);
    setIsOfferModalOpen(true);
  };

  const handleCloseOfferModal = () => {
    setIsOfferModalOpen(false);
    setSelectedOffer(null);
  };

  const handleApproveOffer = async (offerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        setOffers(offers.map(offer =>
          offer._id === offerId ? { ...offer, status: 'approved' } : offer
        ));
        alert('Offer approved successfully');
        // Refresh stats
        fetchStats();
      } else {
        alert('Failed to approve offer');
      }
    } catch (error) {
      console.error('Error approving offer:', error);
      alert('Error approving offer');
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        setOffers(offers.map(offer =>
          offer._id === offerId ? { ...offer, status: 'rejected' } : offer
        ));
        alert('Offer rejected successfully');
        // Refresh stats
        fetchStats();
      } else {
        alert('Failed to reject offer');
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
      alert('Error rejecting offer');
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setOffers(offers.filter(offer => offer._id !== offerId));
        alert('Offer deleted successfully');
        // Refresh stats
        fetchStats();
      } else {
        alert('Failed to delete offer');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Error deleting offer');
    }
  };

  const handleContributorStatusUpdate = async (contributorId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/contributors/${contributorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setContributors(contributors.map(contributor =>
          contributor.id === contributorId ? { ...contributor, status: newStatus } : contributor
        ));
        alert(`Contributor status updated to ${newStatus}`);
      } else {
        alert('Failed to update contributor status');
      }
    } catch (error) {
      console.error('Error updating contributor status:', error);
      alert('Error updating contributor status');
    }
  };

  const handleMarkAttended = async (contributorId, attended) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/contributors/${contributorId}/attend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ attended })
      });

      if (response.ok) {
        setContributors(contributors.map(contributor =>
          contributor.id === contributorId ? { ...contributor, attended } : contributor
        ));
        alert(`Attendance marked as ${attended}`);
      } else {
        alert('Failed to update attendance');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Error updating attendance');
    }
  };

  const handleMarkDelivered = async (contributorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/contributors/${contributorId}/deliver`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setContributors(contributors.map(contributor =>
          contributor.id === contributorId ? { ...contributor, status: 'delivered', resourcesDelivered: 'delivered' } : contributor
        ));
        alert('Resource marked as delivered');
      } else {
        alert('Failed to mark as delivered');
      }
    } catch (error) {
      console.error('Error marking as delivered:', error);
      alert('Error marking as delivered');
    }
  };

  const handleDeleteContributor = async (contributorId) => {
    if (!window.confirm('Are you sure you want to delete this contributor?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/contributors/${contributorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setContributors(contributors.filter(contributor => contributor.id !== contributorId));
        alert('Contributor deleted successfully');
      } else {
        alert('Failed to delete contributor');
      }
    } catch (error) {
      console.error('Error deleting contributor:', error);
      alert('Error deleting contributor');
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = donationStatusFilter
        ? `http://localhost:5000/api/admin/donations?status=${donationStatusFilter}`
        : 'http://localhost:5000/api/admin/donations';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDonations(data.donations);
      } else {
        console.error('Failed to fetch donations');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDonationDetails = (donation) => {
    setSelectedDonation(donation);
    setIsDonationModalOpen(true);
  };

  const handleCloseDonationModal = () => {
    setIsDonationModalOpen(false);
    setSelectedDonation(null);
  };

  const handleDonationStatusUpdate = async (donationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/donations/${donationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setDonations(donations.map(donation =>
          donation._id === donationId ? { ...donation, status: newStatus } : donation
        ));
        alert(`Donation ${newStatus} successfully`);
        // Refresh stats
        fetchStats();
      } else {
        alert('Failed to update donation status');
      }
    } catch (error) {
      console.error('Error updating donation status:', error);
      alert('Error updating donation status');
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/donations/${donationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDonations(donations.filter(donation => donation._id !== donationId));
        alert('Donation deleted successfully');
        // Refresh stats
        fetchStats();
      } else {
        alert('Failed to delete donation');
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Error deleting donation');
    }
  };

  const renderUsers = () => (
    <div className="admin-users">
      <h2>User Management</h2>
      <div className="users-controls">
        <input type="text" placeholder="Search users..." className="search-input" />
        <button className="btn-primary" onClick={fetchUsers}>Refresh Users</button>
      </div>
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                  <td>
                    <span className={`status-badge ${user.isDisabled ? 'disabled' : 'active'}`}>
                      {user.isDisabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                    >
                      {user.isAdmin ? 'Demote' : 'Promote'}
                    </button>
                    <button
                      className={`btn-warning ${user.isDisabled ? 'enable' : 'disable'}`}
                      onClick={() => handleToggleDisableUser(user._id, user.isDisabled)}
                    >
                      {user.isDisabled ? 'Enable' : 'Disable'}
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="admin-projects">
      <h2>Project Management</h2>
      <div className="projects-controls">
        <select
          className="filter-select"
          value={projectStatusFilter}
          onChange={(e) => setProjectStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
        <input type="text" placeholder="Search projects..." className="search-input" />
        <button className="btn-primary" onClick={fetchProjects}>Refresh Projects</button>
      </div>
      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : (
        <div className="projects-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Creator</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.type}</td>
                  <td>{project.createdBy?.name || 'Unknown'}</td>
                  <td>
                    <span className={`status-badge ${project.status}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-info"
                      onClick={() => handleViewProjectDetails(project)}
                      title="View Details"
                    >
                      <FaEye /> View
                    </button>
                    {project.status === 'pending' && (
                      <>
                        <button
                          className="btn-success"
                          onClick={() => handleProjectStatusUpdate(project.id, 'active')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-warning"
                          onClick={() => handleProjectStatusUpdate(project.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {project.status === 'active' && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleProjectStatusUpdate(project.id, 'completed')}
                      >
                        Complete
                      </button>
                    )}
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderOffers = () => (
    <div className="admin-offers">
      <h2>Offer Management</h2>
      <div className="offers-controls">
        <select
          className="filter-select"
          value={offerStatusFilter}
          onChange={(e) => setOfferStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="filter-select"
          value={offerCategoryFilter}
          onChange={(e) => setOfferCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="food-perishables">Food/Perishables</option>
          <option value="clothing-bedding">Clothing/Bedding</option>
          <option value="home-furniture">Home/Furniture</option>
          <option value="money">Money</option>
          <option value="skills-time">Skills/Time</option>
          <option value="other">Other</option>
        </select>
        <input type="text" placeholder="Search offers..." className="search-input" />
        <button className="btn-primary" onClick={fetchOffers}>Refresh Offers</button>
      </div>
      {loading ? (
        <div className="loading">Loading offers...</div>
      ) : (
        <div className="offers-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Donor</th>
                <th>Contact</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <tr key={offer._id}>
                  <td>{offer.category.replace('-', '/').replace(/\b\w/g, l => l.toUpperCase())}</td>
                  <td>{offer.isAnonymous ? 'Anonymous' : (offer.donorName || 'N/A')}</td>
                  <td>{offer.contact}</td>
                  <td>
                    {offer.category === 'skills-time' ? (
                      <div>
                        <strong>{offer.skill}</strong>
                        {offer.timeCommitment && <><br />Time: {offer.timeCommitment}</>}
                        {offer.method && <><br />Method: {offer.method}</>}
                        {offer.experience && <><br />Experience: {offer.experience}</>}
                      </div>
                    ) : (
                      <div>
                        {offer.itemType && <><strong>{offer.itemType}</strong><br /></>}
                        {offer.quantity && <>Quantity: {offer.quantity}<br /></>}
                        {offer.description && <>Description: {offer.description}<br /></>}
                        {offer.logistics && <>Logistics: {offer.logistics}<br /></>}
                        {offer.pickupLocation && <>Pickup: {offer.pickupLocation}<br /></>}
                        {offer.contactPerson && <>Contact Person: {offer.contactPerson}</>}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${offer.status}`}>
                      {offer.status}
                    </span>
                  </td>
                  <td>{new Date(offer.createdAt).toLocaleDateString()}</td>
                  <td>
                    {offer.status === 'pending' && (
                      <>
                        <button
                          className="btn-success"
                          onClick={() => handleApproveOffer(offer._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-warning"
                          onClick={() => handleRejectOffer(offer._id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      className="btn-info"
                      onClick={() => handleViewOfferDetails(offer)}
                      title="View Details"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteOffer(offer._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderContributors = () => (
    <div className="admin-contributors">
      <h2>Contributors Management</h2>
      <div className="contributors-controls">
        <select className="filter-select">
          <option value="">All Types</option>
          <option value="participant">Participants</option>
          <option value="resource_provider">Resource Providers</option>
          <option value="donor">Donors</option>
        </select>
        <input type="text" placeholder="Search contributors..." className="search-input" />
        <button className="btn-primary" onClick={fetchContributors}>Refresh Contributors</button>
      </div>
      {loading ? (
        <div className="loading">Loading contributors...</div>
      ) : (
        <div className="contributors-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Project</th>
                <th>Contribution Type</th>
                <th>Details</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contributors.map(contributor => (
                <tr key={contributor.id}>
                  <td>
                    <div className="user-info">
                      <strong>{contributor.user ? contributor.user.name : 'Unknown User'}</strong>
                      <br />
                      <small>{contributor.user ? contributor.user.email : 'N/A'}</small>
                    </div>
                  </td>
                  <td>
                    <div className="project-info">
                      <strong>{contributor.project ? contributor.project.title : 'Unknown Project'}</strong>
                      <br />
                      <small>{contributor.project ? contributor.project.type : 'N/A'}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`contribution-type ${contributor.contributionType}`}>
                      {contributor.contributionType.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {contributor.contributionType === 'resource_provider' && (
                      <div>
                        {contributor.resourceType} - {contributor.quantity} units
                        {contributor.deliveryDate && (
                          <><br /><small>Delivery: {new Date(contributor.deliveryDate).toLocaleDateString()}</small></>
                        )}
                      </div>
                    )}
                    {contributor.contributionType === 'donor' && (
                      <div>
                        {contributor.donationCategory}
                        {contributor.quantity && ` - ${contributor.quantity} units`}
                      </div>
                    )}
                    {contributor.contributionType === 'participant' && (
                      <div>
                        Attended: {contributor.attended || 'pending'}
                      </div>
                    )}
                  </td>
                  <td>{new Date(contributor.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${contributor.status}`}>
                      {contributor.status}
                    </span>
                  </td>
                  <td>
                    {contributor.contributionType === 'participant' && (
                      <select
                        className="status-select"
                        value={contributor.attended || 'pending'}
                        onChange={(e) => handleMarkAttended(contributor.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="yes">Attended</option>
                        <option value="no">Not Attended</option>
                      </select>
                    )}
                    {contributor.contributionType === 'resource_provider' && (
                      <>
                        {contributor.status !== 'delivered' && (
                          <button
                            className="btn-success"
                            onClick={() => handleMarkDelivered(contributor.id)}
                          >
                            Mark Delivered
                          </button>
                        )}
                        <select
                          className="status-select"
                          value={contributor.status}
                          onChange={(e) => handleContributorStatusUpdate(contributor.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </>
                    )}
                    {contributor.contributionType === 'donor' && (
                      <select
                        className="status-select"
                        value={contributor.status}
                        onChange={(e) => handleContributorStatusUpdate(contributor.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteContributor(contributor.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="admin-settings">
      <h2>Admin Settings</h2>
      <div className="settings-section">
        <h3>System Configuration</h3>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
            />
            Email Notifications
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.autoApproveOffers}
              onChange={(e) => setSettings({...settings, autoApproveOffers: e.target.checked})}
            />
            Auto-approve offers
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
            />
            Maintenance Mode
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.allowUserRegistration}
              onChange={(e) => setSettings({...settings, allowUserRegistration: e.target.checked})}
            />
            Allow User Registration
          </label>
        </div>
        <div className="setting-item">
          <label>Max Projects Per User</label>
          <input
            type="number"
            value={settings.maxProjectsPerUser}
            onChange={(e) => setSettings({...settings, maxProjectsPerUser: parseInt(e.target.value)})}
            min="1"
            max="100"
          />
        </div>
      </div>
      <div className="settings-section">
        <h3>Email Configuration</h3>
        <div className="setting-item">
          <label>SMTP Server</label>
          <input
            type="text"
            value={settings.smtpServer}
            onChange={(e) => setSettings({...settings, smtpServer: e.target.value})}
          />
        </div>
        <div className="setting-item">
          <label>Admin Email</label>
          <input
            type="email"
            value={settings.adminEmail}
            onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
          />
        </div>
        <div className="setting-item">
          <label>Contact Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
          />
        </div>
      </div>
      <div className="settings-section">
        <h3>Site Configuration</h3>
        <div className="setting-item">
          <label>Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
          />
        </div>
      </div>
      <button className="btn-primary" onClick={saveSettings}>Save Settings</button>
    </div>
  );

  const renderDonations = () => (
    <div className="admin-donations">
      <h2>Donation Management</h2>
      <div className="donations-controls">
        <select
          className="filter-select"
          value={donationStatusFilter}
          onChange={(e) => setDonationStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <input type="text" placeholder="Search donations..." className="search-input" />
        <button className="btn-primary" onClick={fetchDonations}>Refresh Donations</button>
      </div>
      {loading ? (
        <div className="loading">Loading donations...</div>
      ) : (
        <div className="donations-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Donor</th>
                <th>Amount</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(donation => (
                <tr key={donation._id}>
                  <td>{donation.donationId}</td>
                  <td>{donation.anonymous ? 'Anonymous' : (donation.name || 'N/A')}</td>
                  <td>Ksh {donation.amount.toLocaleString()}</td>
                  <td>{donation.phone}</td>
                  <td>{donation.email}</td>
                  <td>
                    <span className={`status-badge ${donation.status}`}>
                      {donation.status}
                    </span>
                  </td>
                  <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-info"
                      onClick={() => handleViewDonationDetails(donation)}
                      title="View Details"
                    >
                      <FaEye /> View
                    </button>
                    {donation.status === 'pending' && (
                      <>
                        <button
                          className="btn-success"
                          onClick={() => handleDonationStatusUpdate(donation._id, 'completed')}
                        >
                          Complete
                        </button>
                        <button
                          className="btn-warning"
                          onClick={() => handleDonationStatusUpdate(donation._id, 'failed')}
                        >
                          Fail
                        </button>
                      </>
                    )}
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteDonation(donation._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'projects':
        return renderProjects();
      case 'offers':
        return renderOffers();
      case 'donations':
        return renderDonations();
      case 'contributors':
        return renderContributors();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  if (!isAdmin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h3>SDG Connect Admin</h3>
        </div>
        <nav className="admin-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-footer">
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
          }}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
      <div className="admin-content">
        {renderContent()}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          isOpen={isProjectModalOpen}
          onClose={handleCloseProjectModal}
          project={selectedProject}
          onProjectUpdate={() => {
            // Refresh projects list after any updates
            fetchProjects();
          }}
        />
      )}

      {/* Contributor Details Modal */}
      {selectedContributor && (
        <ContributorDetailsModal
          isOpen={isContributorModalOpen}
          onClose={handleCloseContributorModal}
          contributor={selectedContributor}
        />
      )}

      {/* Offer Details Modal */}
      {selectedOffer && (
        <OfferDetailsModal
          isOpen={isOfferModalOpen}
          onClose={handleCloseOfferModal}
          offer={selectedOffer}
        />
      )}

      {/* Donation Details Modal */}
      {selectedDonation && (
        <div className="modal-overlay" onClick={handleCloseDonationModal}>
          <div className="modal-content donation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Donation Details</h3>
              <button className="close-btn" onClick={handleCloseDonationModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="donation-info">
                <div className="info-row">
                  <strong>Donation ID:</strong> {selectedDonation.donationId}
                </div>
                <div className="info-row">
                  <strong>Donor:</strong> {selectedDonation.anonymous ? 'Anonymous' : (selectedDonation.name || 'N/A')}
                </div>
                <div className="info-row">
                  <strong>Amount:</strong> Ksh {selectedDonation.amount.toLocaleString()}
                </div>
                <div className="info-row">
                  <strong>Phone:</strong> {selectedDonation.phone}
                </div>
                <div className="info-row">
                  <strong>Email:</strong> {selectedDonation.email}
                </div>
                <div className="info-row">
                  <strong>Status:</strong>
                  <span className={`status-badge ${selectedDonation.status}`}>
                    {selectedDonation.status}
                  </span>
                </div>
                <div className="info-row">
                  <strong>Date:</strong> {new Date(selectedDonation.createdAt).toLocaleString()}
                </div>
                {selectedDonation.mpesaTransactionId && (
                  <div className="info-row">
                    <strong>M-Pesa Transaction ID:</strong> {selectedDonation.mpesaTransactionId}
                  </div>
                )}
                {selectedDonation.transactionDate && (
                  <div className="info-row">
                    <strong>Transaction Date:</strong> {new Date(selectedDonation.transactionDate).toLocaleString()}
                  </div>
                )}
                {selectedDonation.donationUsedFor && (
                  <div className="info-row">
                    <strong>Used For:</strong> {selectedDonation.donationUsedFor}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
