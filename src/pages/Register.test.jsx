import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Register from './Register';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

vi.mock('../utils/api', () => ({
  registerUser: vi.fn(),
}));

import { registerUser } from '../utils/api';

const mockUser = {
  id: 'user-new',
  name: 'New User',
  email: 'new@example.com',
  role: { id: '2', name: 'normal_user', permissions: [] },
};

const defaultProps = {
  onRegister: vi.fn(),
  goToLogin:  vi.fn(),
  goBack:     vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('Register — rendering', () => {
  it('renders name, email, and password fields', () => {
    render(<Register {...defaultProps} />);
    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your.email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/create a password/i)).toBeInTheDocument();
  });

  it('renders the Register submit button', () => {
    render(<Register {...defaultProps} />);
    expect(screen.getByRole('button', { name: /^register$/i })).toBeInTheDocument();
  });

  it('renders a "Login" navigation link', () => {
    render(<Register {...defaultProps} />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls goToLogin when the Login button is clicked', () => {
    render(<Register {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(defaultProps.goToLogin).toHaveBeenCalledTimes(1);
  });

  it('calls goBack when the back button is clicked', () => {
    render(<Register {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(defaultProps.goBack).toHaveBeenCalledTimes(1);
  });
});

// ── Successful registration ───────────────────────────────────────────────────

describe('Register — successful registration', () => {
  it('calls onRegister with user and token on success', async () => {
    registerUser.mockResolvedValueOnce({ success: true, message: 'Registration successful', user: mockUser, token: 'jwt-reg-token' });

    render(<Register {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/john doe/i),       { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText(/your.email/i),     { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/create a password/i), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith('New User', 'new@example.com', 'pass1234');
      expect(defaultProps.onRegister).toHaveBeenCalledWith(mockUser, 'jwt-reg-token');
    });
  });

  it('shows "Creating account…" while the request is in flight', async () => {
    registerUser.mockImplementation(() => new Promise(() => {}));
    render(<Register {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/john doe/i),          { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText(/your.email/i),        { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/create a password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
    });
  });

  it('disables the submit button while loading', async () => {
    registerUser.mockImplementation(() => new Promise(() => {}));
    render(<Register {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/john doe/i),          { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText(/your.email/i),        { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/create a password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });
  });
});

// ── Failed registration ───────────────────────────────────────────────────────

describe('Register — failed registration', () => {
  it('displays error when email is already registered', async () => {
    registerUser.mockResolvedValueOnce({ success: false, message: 'Email already registered', user: null, token: null });

    render(<Register {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/john doe/i),          { target: { value: 'Bob' } });
    fireEvent.change(screen.getByPlaceholderText(/your.email/i),        { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/create a password/i), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
    expect(defaultProps.onRegister).not.toHaveBeenCalled();
  });

  it('displays server validation error for short name', async () => {
    registerUser.mockResolvedValueOnce({ success: false, message: 'Name must be at least 2 characters', user: null, token: null });

    render(<Register {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/john doe/i),          { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText(/your.email/i),        { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/create a password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('displays a network error when the API call throws', async () => {
    registerUser.mockRejectedValueOnce(new Error('fetch failed'));

    render(<Register {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/john doe/i),          { target: { value: 'Bob' } });
    fireEvent.change(screen.getByPlaceholderText(/your.email/i),        { target: { value: 'bob@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/create a password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /^register$/i }));

    await waitFor(() => {
      expect(screen.getByText(/could not connect to server/i)).toBeInTheDocument();
    });
    expect(defaultProps.onRegister).not.toHaveBeenCalled();
  });
});

// ── Form validation ───────────────────────────────────────────────────────────

describe('Register — form validation', () => {
  it('name, email, and password fields are all required', () => {
    render(<Register {...defaultProps} />);
    expect(screen.getByPlaceholderText(/john doe/i)).toBeRequired();
    expect(screen.getByPlaceholderText(/your.email/i)).toBeRequired();
    expect(screen.getByPlaceholderText(/create a password/i)).toBeRequired();
  });

  it('email field uses type="email"', () => {
    render(<Register {...defaultProps} />);
    expect(screen.getByPlaceholderText(/your.email/i)).toHaveAttribute('type', 'email');
  });

  it('password field uses type="password" to mask input', () => {
    render(<Register {...defaultProps} />);
    expect(screen.getByPlaceholderText(/create a password/i)).toHaveAttribute('type', 'password');
  });
});
