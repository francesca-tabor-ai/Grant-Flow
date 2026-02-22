import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getToken, apiFetch } from './api';

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  describe('getToken', () => {
    it('returns null when no token in localStorage', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
      expect(getToken()).toBe(null);
    });

    it('returns token from localStorage', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('abc123');
      expect(getToken()).toBe('abc123');
    });
  });

  describe('apiFetch', () => {
    it('adds Authorization header when token exists', async () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('secret');
      const fetchMock = vi.fn().mockResolvedValue(new Response());
      vi.stubGlobal('fetch', fetchMock);
      await apiFetch('/api/test');
      expect(fetchMock).toHaveBeenCalled();
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/test');
      const headers = opts?.headers as Headers;
      expect(headers?.get?.('Authorization')).toBe('Bearer secret');
    });
  });
});
