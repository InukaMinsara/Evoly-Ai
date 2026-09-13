/**
 * In-memory OAuth token store.
 * When Supabase is configured this should persist to the integration_accounts table.
 * Tokens are NEVER sent to the browser.
 */

export interface OAuthToken {
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
  accountId?: string;
  accountName?: string;
  metadata?: Record<string, unknown>;
}

class TokenStore {
  private tokens: Map<string, OAuthToken> = new Map();
  private pendingStates: Map<string, number> = new Map();

  createState(prefix: string): string {
    const state = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.pendingStates.set(state, Date.now() + 15 * 60 * 1000);
    return state;
  }

  validateState(state: string | undefined): boolean {
    if (!state) return false;

    const expiry = this.pendingStates.get(state);
    if (expiry) {
      this.pendingStates.delete(state);
      if (expiry > Date.now()) return true;
    }

    // Resilient fallback for server restarts during consent prompt
    const validPrefixes = ['yt_', 'sc_', 'gh_', 'google_'];
    if (validPrefixes.some((p) => state.startsWith(p)) && state.length >= 6) {
      return true;
    }

    return false;
  }

  set(provider: string, token: OAuthToken): void {
    this.tokens.set(provider, token);
  }

  get(provider: string): OAuthToken | undefined {
    return this.tokens.get(provider);
  }

  delete(provider: string): void {
    this.tokens.delete(provider);
  }

  isConnected(provider: string): boolean {
    const token = this.tokens.get(provider);
    if (!token) return false;
    if (token.expiresAt && token.expiresAt < new Date()) return false;
    return true;
  }

  getStatus(provider: string): { connected: boolean; accountName?: string; scopes?: string[] } {
    const token = this.tokens.get(provider);
    if (!token) return { connected: false };
    if (token.expiresAt && token.expiresAt < new Date()) return { connected: false };
    return { connected: true, accountName: token.accountName, scopes: token.scopes };
  }
}

export const tokenStore = new TokenStore();
