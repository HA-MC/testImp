/**
 * API client for French government data services.
 * USES: https://recherche-entreprises.api.gouv.fr/search
 */

export const searchBusinesses = async (query) => {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&per_page=10`);
    if (!response.ok) {
      throw new Error('Error fetching business data');
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Business search error:', error);
    return [];
  }
};
