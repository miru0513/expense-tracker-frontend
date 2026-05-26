import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from './Login';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock the API module
vi.mock('../utils/api', () => ({
  loginUser: vi.fn(),
}));

import { loginUser } from '../utils/api';

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  isActive: true,
  role: { id: '2', name: 'normal_user', permissions: [] },
};

const defaultProps = {
  onLogin:      vi.fn(),
  goToRegister: vi.fn(),
  goBack:       vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('Login — rendering', () => {
  it('renders the login form with email and password fields', () => {
    render(<Login {...defaultProps} />);
    expect(screen.getByPlaceholderText(/your.email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders the "Register" navigation link', () => {
    render(<Login {...defaultProps} />);
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('calls goToRegister when the Register button is clicked', () => {
    render(<Login {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(defaultProps.goToRegister).toHaveBeenCalledTimes(1);
  });

  it('calls goBack when the back arrow is clicked', () => {
    render(<Login {...defaultProps} />);
    // The back button contains an ArrowLeft icon; it's the first button rendered
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(defaultProps.goBack).toHaveBeenCalledTimes(1);
  });
});

// ── Successful login ──────────────────────────────────────────────────────────

describe('Login — successful authentication', () => {
  it('calls onLogin with user and token on success', async () => {
    loginUser.mockResolvedValueOnce({ success: true, message: 'Login successful', user: mockUser, token: 'jwt-token-abc' });

    render(<Login {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/your.email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(defaultProps.onLogin).toHaveBeenCalledWith(mockUser, 'jwt-token-abc');
    });
  });

  it('shows "Signing in…" while the request is in flight', async () => {
    loginUser.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<Login {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/your.email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    });
  });

  it('disables the submit button while loading', async () => {
    loginUser.mockImplementation(() => new Promise(() => {}));
    render(<Login {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/your.email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });
});

// ── Failed login ──────────────────────────────────────────────────────────────

describe('Login — failed authentication', () => {
  it('displays error message when server returns success: false', async () => {
    loginUser.mockResolvedValueOnce({ success: false, message: 'Invalid password', user: null, token: null });

    render(<Login {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/your.email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument();
    });
    expect(defaultProps.onLogin).not.toHaveBeenCalled();
  });

  it('displays error message when user is not found', async () => {
    loginUser.mockResolvedValueOnce({ success: false, message: 'User not found or account deactivated', user: null, token: null });

    render(<Login {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/your.email/i), { target: { value: 'nobody@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('User not found or account deactivated')).toBeInTheDocument();
    });
  });

  it('displays a network error when the API call throws', async () => {
    loginUser.mockRejectedValueOnce(new Error('Network error'));

    render(<Login {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/your.email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/could not connect to server/i)).toBeInTheDocument();
    });
    expect(defaultProps.onLogin).not.toHaveBeenCalled();
  });

  it('clears previous error when a new submission starts', async () => {
    loginUser
      .mockResolvedValueOnce({ success: false, message: 'Invalid password', user: null, token: null })
      .mockResolvedValueOnce({ success: true,  message: 'Login successful', user: mockUser, token: 'tok' });

    render(<Login {...defaultProps} />);
    const emailInput = screen.getByPlaceholderText(/your.email/i);
    const passInput  = screen.getByPlaceholderText(/enter your password/i);
    const submitBtn  = screen.getByRole('button', { name: /sign in/i });

    // First attempt fails
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passInput,  { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);
    await waitFor(() => expect(screen.getByText('Invalid password')).toBeInTheDocument());

    // Second attempt — error should vanish before resolution
    fireEvent.change(passInput, { target: { value: 'correct' } });
    fireEvent.click(submitBtn);
    await waitFor(() => expect(defaultProps.onLogin).toHaveBeenCalledTimes(1));
  });
});

// ── Form validation ───────────────────────────────────────────────────────────

describe('Login — form validation', () => {
  it('email field uses type="email" for browser-level validation', () => {
    render(<Login {...defaultProps} />);
    expect(screen.getByPlaceholderText(/your.email/i)).toHaveAttribute('type', 'email');
  });

  it('password field uses type="password" to hide characters', () => {
    render(<Login {...defaultProps} />);
    expect(screen.getByPlaceholderText(/enter your password/i)).toHaveAttribute('type', 'password');
  });

  it('both fields are marked required', () => {
    render(<Login {...defaultProps} />);
    expect(screen.getByPlaceholderText(/your.email/i)).toBeRequired();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeRequired();
  });
});
