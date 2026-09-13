import { tokenStore } from '../services/oauth/token-store';

describe('OAuth Token Store and State Management', () => {
  it('creates and validates states with proper prefixes', () => {
    const ytState = tokenStore.createState('yt');
    expect(ytState.startsWith('yt_')).toBe(true);
    expect(tokenStore.validateState(ytState)).toBe(true);
  });

  it('validates fallback prefixes for server restarts', () => {
    expect(tokenStore.validateState('yt_1234567890')).toBe(true);
    expect(tokenStore.validateState('sc_1234567890')).toBe(true);
    expect(tokenStore.validateState('gh_1234567890')).toBe(true);
    expect(tokenStore.validateState('google_1234567890')).toBe(true);
    expect(tokenStore.validateState('invalid_state')).toBe(false);
    expect(tokenStore.validateState(undefined)).toBe(false);
  });

  it('stores, retrieves, and checks connection status', () => {
    tokenStore.set('youtube', {
      provider: 'youtube',
      accessToken: 'test_token',
      accountName: 'Test Channel',
      scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    });

    expect(tokenStore.isConnected('youtube')).toBe(true);
    const status = tokenStore.getStatus('youtube');
    expect(status.connected).toBe(true);
    expect(status.accountName).toBe('Test Channel');

    tokenStore.delete('youtube');
    expect(tokenStore.isConnected('youtube')).toBe(false);
    expect(tokenStore.getStatus('youtube').connected).toBe(false);
  });
});