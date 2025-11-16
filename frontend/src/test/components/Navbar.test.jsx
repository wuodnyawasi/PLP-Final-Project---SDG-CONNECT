import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Navbar from '../../../components/Navbar/Navbar';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock addEventListener and removeEventListener
const addEventListenerMock = vi.fn();
const removeEventListenerMock = vi.fn();
vi.stubGlobal('addEventListener', addEventListenerMock);
vi.stubGlobal('removeEventListener', removeEventListenerMock);

const renderNavbar = (user = null) => {
  // Clear mocks
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  addEventListenerMock.mockClear();
  removeEventListenerMock.mockClear();

  // Setup localStorage mocks
  if (user) {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'user') return JSON.stringify(user);
      return null;
    });
  } else {
    localStorageMock.getItem.mockReturnValue(null);
  }

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
    renderNavbar();

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    renderNavbar();

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    const mockUser = { name: 'John Doe', isAdmin: false };
    renderNavbar(mockUser);

    expect(screen.getByText('John Doe logged in')).toBeInTheDocument();
  });

  it('shows admin link when user is logged in and is admin', () => {
    const mockUser = { name: 'Admin User', isAdmin: true };
    renderNavbar(mockUser);

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('does not show admin link when user is admin but not logged in', () => {
    renderNavbar();

    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('toggles mobile menu on hamburger click', () => {
    renderNavbar();

    const hamburgerButton = screen.getByRole('button', { hidden: true });
    fireEvent.click(hamburgerButton);

    // Check if mobile menu is visible (this would depend on your implementation)
    // You might need to adjust this based on your actual mobile menu implementation
  });
});
