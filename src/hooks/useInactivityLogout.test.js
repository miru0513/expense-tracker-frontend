import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useInactivityLogout } from './useInactivityLogout';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

const TOTAL_MS   = 15 * 60 * 1000;
const WARNING_MS = 60 * 1000;

describe('useInactivityLogout', () => {
  it('does not call onLogout immediately', () => {
    const onLogout = vi.fn();
    renderHook(() => useInactivityLogout(onLogout, true));
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('calls onLogout after the full inactivity period', () => {
    const onLogout = vi.fn();
    renderHook(() => useInactivityLogout(onLogout, true));
    act(() => { vi.advanceTimersByTime(TOTAL_MS + 100); });
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onLogout when disabled', () => {
    const onLogout = vi.fn();
    renderHook(() => useInactivityLogout(onLogout, false));
    act(() => { vi.advanceTimersByTime(TOTAL_MS + 100); });
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('shows secondsLeft warning before logout', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() => useInactivityLogout(onLogout, true));

    expect(result.current.secondsLeft).toBeNull();

    // Advance to the warning window
    act(() => { vi.advanceTimersByTime(TOTAL_MS - WARNING_MS + 100); });
    expect(result.current.secondsLeft).not.toBeNull();
    expect(result.current.secondsLeft).toBeGreaterThan(0);
  });

  it('resets the timer when resetActivity is called', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() => useInactivityLogout(onLogout, true));

    // Advance almost to logout
    act(() => { vi.advanceTimersByTime(TOTAL_MS - 5000); });
    // Simulate user activity
    act(() => { result.current.resetActivity(); });
    // Advance past the original deadline — logout should NOT have fired
    act(() => { vi.advanceTimersByTime(6000); });
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('clears warning when user becomes active again', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() => useInactivityLogout(onLogout, true));

    // Trigger the warning
    act(() => { vi.advanceTimersByTime(TOTAL_MS - WARNING_MS + 100); });
    expect(result.current.secondsLeft).not.toBeNull();

    // User activity should reset everything
    act(() => { result.current.resetActivity(); });
    expect(result.current.secondsLeft).toBeNull();
  });
});
