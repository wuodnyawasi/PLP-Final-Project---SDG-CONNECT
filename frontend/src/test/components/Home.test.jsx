import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Home from '../../../pages/Home/Home';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock axios for API calls
vi.mock('axios');
import axios from 'axios';

const renderHome = (authState) => {
  mockUseAuth.mockReturnValue(authState);
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section with main heading', () => {
    renderHome({ user: null, isAdmin: false });

    expect(screen.getByText('Making a Difference Together')).toBeInTheDocument();
    expect(screen.getByText('Connect, Collaborate, Create Impact')).toBeInTheDocument();
  });

  it('renders SDG grid section', () => {
    renderHome({ user: null, isAdmin: false });

    expect(screen.getByText('Explore Sustainable Development Goals')).toBeInTheDocument();
    expect(screen.getByText('Click on any SDG to explore related projects')).toBeInTheDocument();
  });

  it('renders recent donations section', async () => {
    // Mock the API call for recent donations
    const mockDonations = [
      {
        donorName: 'John Doe',
        amount: 'Ksh 5,000',
        purpose: 'Donation to SDGConnect',
        date: '2 days ago',
      },
      {
        donorName: 'Anonymous Donor',
        amount: 'Ksh 10,000',
        purpose: 'Donation to SDGConnect',
        date: '1 week ago',
      },
    ];

    axios.get.mockResolvedValueOnce({ data: mockDonations });

    renderHome({ user: null, isAdmin: false });

    await waitFor(() => {
      expect(screen.getByText('Recent Donations')).toBeInTheDocument();
    });

    // Check if donations are displayed
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Ksh 5,000')).toBeInTheDocument();
    });
  });

  it('renders call-to-action buttons', () => {
    renderHome({ user: null, isAdmin: false });

    expect(screen.getByText('Explore Projects')).toBeInTheDocument();
    expect(screen.getByText('Make a Donation')).toBeInTheDocument();
    expect(screen.getByText('Join Our Community')).toBeInTheDocument();
  });

  it('shows login prompt for unauthenticated users', () => {
    renderHome({ user: null, isAdmin: false });

    expect(screen.getByText('Join thousands of change-makers worldwide')).toBeInTheDocument();
  });

  it('shows personalized welcome for authenticated users', () => {
    const mockUser = { name: 'John Doe', isAdmin: false };
    renderHome({ user: mockUser, isAdmin: false });

    expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
  });

  it('renders impact statistics section', () => {
    renderHome({ user: null, isAdmin: false });

    expect(screen.getByText('Our Impact')).toBeInTheDocument();
    // These would be dynamic, but we can check for the section structure
  });

  it('handles SDG grid interactions', () => {
    renderHome({ user: null, isAdmin: false });

    // Check if SDG buttons are present (assuming there are SDG components)
    const sdgElements = screen.getAllByRole('button');
    expect(sdgElements.length).toBeGreaterThan(0);
  });
});
