import { getEnv } from '../../config/env';
import { NormalizedSearchResult } from '../capabilities/types';

export class SearchService {
  /**
   * Search using the best configured provider, or a specific requested provider, with fallback.
   */
  async search(query: string, preferredProvider?: string, limit = 5): Promise<{ provider: string; results: NormalizedSearchResult[] }> {
    const providers = this.getProviderExecutionOrder(preferredProvider);

    if (providers.length === 0) {
      throw new Error('No search providers are currently configured. Set TAVILY_API_KEY, GOOGLE_SEARCH_API_KEY, or other search keys in .env.');
    }

    const errors: string[] = [];
    for (const provider of providers) {
      try {
        const results = await this.executeProviderSearch(provider, query, limit);
        if (results && results.length > 0) {
          return { provider, results };
        }
      } catch (err: any) {
        errors.push(`${provider}: ${err.message || 'failed'}`);
      }
    }

    throw new Error(`All search providers failed: ${errors.join('; ')}`);
  }

  /**
   * Deep research: performs multi-query or extraction using deep search capabilities.
   */
  async research(topic: string, depth: 'standard' | 'deep' = 'standard'): Promise<{
    summary?: string;
    sources: NormalizedSearchResult[];
    queriesExecuted: string[];
  }> {
    const searchRes = await this.search(topic, undefined, depth === 'deep' ? 8 : 4);
    return {
      sources: searchRes.results,
      queriesExecuted: [topic],
    };
  }

  private getProviderExecutionOrder(preferred?: string): string[] {
    const env = getEnv();
    const configured: Record<string, boolean> = {
      tavily: Boolean(env.TAVILY_API_KEY),
      exa: Boolean(env.EXA_API_KEY),
      jina: Boolean(env.JINA_API_KEY),
      firecrawl: Boolean(env.FIRECRAWL_API_KEY),
      serper: Boolean(env.SERPER_API_KEY),
      google: Boolean(env.GOOGLE_SEARCH_API_KEY && env.GOOGLE_SEARCH_ENGINE_ID),
      bing: Boolean(env.BING_API_KEY),
      you: Boolean(env.YOU_COM_API_KEY),
    };

    const defaultOrder = ['tavily', 'exa', 'serper', 'google', 'jina', 'firecrawl', 'bing', 'you'];
    const active = defaultOrder.filter((p) => configured[p]);

    if (preferred && configured[preferred]) {
      return [preferred, ...active.filter((p) => p !== preferred)];
    }
    return active;
  }

  private async executeProviderSearch(provider: string, query: string, limit: number): Promise<NormalizedSearchResult[]> {
    const env = getEnv();

    switch (provider) {
      case 'tavily': {
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: env.TAVILY_API_KEY,
            query,
            search_depth: 'basic',
            max_results: limit,
          }),
        });
        if (!res.ok) throw new Error(`Tavily API error: ${res.statusText}`);
        const data: any = await res.json();
        return (data.results || []).map((r: any) => ({
          title: r.title || 'Untitled',
          url: r.url,
          snippet: r.content || '',
          source: 'Tavily',
          content: r.raw_content,
          score: r.score,
        }));
      }

      case 'exa': {
        const res = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.EXA_API_KEY!,
          },
          body: JSON.stringify({
            query,
            numResults: limit,
            useAutoprompt: true,
          }),
        });
        if (!res.ok) throw new Error(`Exa API error: ${res.statusText}`);
        const data: any = await res.json();
        return (data.results || []).map((r: any) => ({
          title: r.title || 'Untitled',
          url: r.url,
          snippet: r.text || r.snippet || '',
          source: 'Exa',
          publishedAt: r.publishedDate,
          score: r.score,
        }));
      }

      case 'serper': {
        const res = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': env.SERPER_API_KEY!,
          },
          body: JSON.stringify({
            q: query,
            num: limit,
          }),
        });
        if (!res.ok) throw new Error(`Serper API error: ${res.statusText}`);
        const data: any = await res.json();
        return (data.organic || []).map((r: any) => ({
          title: r.title || 'Untitled',
          url: r.link,
          snippet: r.snippet || '',
          source: 'Google (Serper)',
          score: r.position ? 1 / r.position : undefined,
        }));
      }

      case 'google': {
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key', env.GOOGLE_SEARCH_API_KEY!);
        url.searchParams.set('cx', env.GOOGLE_SEARCH_ENGINE_ID!);
        url.searchParams.set('q', query);
        url.searchParams.set('num', String(Math.min(limit, 10)));

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Google Custom Search error: ${res.statusText}`);
        const data: any = await res.json();
        return (data.items || []).map((item: any) => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet || '',
          source: 'Google Custom Search',
        }));
      }

      case 'jina': {
        const url = `https://s.jina.ai/${encodeURIComponent(query)}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${env.JINA_API_KEY}`,
            Accept: 'application/json',
          },
        });
        if (!res.ok) throw new Error(`Jina Search error: ${res.statusText}`);
        const data: any = await res.json();
        return (data.data || []).slice(0, limit).map((r: any) => ({
          title: r.title || 'Untitled',
          url: r.url,
          snippet: r.description || r.content?.slice(0, 300) || '',
          source: 'Jina AI',
          content: r.content,
        }));
      }

      case 'firecrawl': {
        const res = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.FIRECRAWL_API_KEY}`,
          },
          body: JSON.stringify({
            query,
            limit,
          }),
        });
        if (!res.ok) throw new Error(`Firecrawl Search error: ${res.statusText}`);
        const data: any = await res.json();
        return (data.data || []).map((r: any) => ({
          title: r.metadata?.title || r.url,
          url: r.url,
          snippet: r.markdown?.slice(0, 300) || '',
          source: 'Firecrawl',
          content: r.markdown,
        }));
      }

      case 'bing': {
        const url = new URL('https://api.bing.microsoft.com/v7.0/search');
        url.searchParams.set('q', query);
        url.searchParams.set('count', String(limit));

        const res = await fetch(url.toString(), {
          headers: { 'Ocp-Apim-Subscription-Key': env.BING_API_KEY! },
        });
        if (!res.ok) throw new Error(`Bing API error: ${res.statusText}`);
        const data: any = await res.json();
        return (data.webPages?.value || []).map((r: any) => ({
          title: r.name,
          url: r.url,
          snippet: r.snippet || '',
          source: 'Bing',
        }));
      }

      case 'you': {
        const url = new URL('https://api.ydc-index.io/search');
        url.searchParams.set('query', query);
        url.searchParams.set('count', String(limit));

        const res = await fetch(url.toString(), {
          headers: { 'X-API-Key': env.YOU_COM_API_KEY! },
        });
        if (!res.ok) throw new Error(`You.com API error: ${res.statusText}`);
        const data: any = await res.json();
        return (data.hits || []).map((r: any) => ({
          title: r.title,
          url: r.url,
          snippet: (r.snippets || []).join(' '),
          source: 'You.com',
        }));
      }

      default:
        throw new Error(`Unsupported search provider: ${provider}`);
    }
  }
}

export const searchService = new SearchService();
