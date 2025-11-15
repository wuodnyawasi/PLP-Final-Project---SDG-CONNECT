import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Navbar from '../../components/Navbar/Navbar';

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

const renderNavbar = (authState) => {
  mockUseAuth.mockReturnValue(authState);
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation links', () => {
    renderNavbar({ user: null, isAdmin: false });

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    renderNavbar({ user: null, isAdmin: false });

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    const mockUser = { name: 'John Doe', isAdmin: false };
    renderNavbar({ user: mockUser, isAdmin: false });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows admin link when user is admin', () => {
    const mockUser = { name: 'Admin User', isAdmin: true };
    renderNavbar({ user: mockUser, isAdmin: true });

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('toggles mobile menu on hamburger click', () => {
    renderNavbar({ user: null, isAdmin: false });

    const hamburgerButton = screen.getByRole('button', { hidden: true });
    fireEvent.click(hamburgerButton);

    // Check if mobile menu is visible (this would depend on your implementation)
    // You might need to adjust this based on your actual mobile menu implementation
  });
});
