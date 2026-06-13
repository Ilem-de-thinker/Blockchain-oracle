const BASE_URL = 'https://countriesnow.space/api/v0.1/countries';

export interface Country {
  country: string;
  cities: string[];
}

export const countriesApi = {
  getCountries: async (): Promise<Country[]> => {
    const res = await fetch(BASE_URL);
    const json = await res.json();
    const data = json.data;
    if (Array.isArray(data)) return data;
    return [];
  },

  getStates: async (country: string): Promise<{ name: string; state_code: string }[]> => {
    const res = await fetch(`${BASE_URL}/states`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country }),
    });
    const json = await res.json();
    const data = json.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.states)) return data.states;
    return [];
  },

  getCities: async (country: string): Promise<string[]> => {
    const res = await fetch(`${BASE_URL}/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country }),
    });
    const json = await res.json();
    const data = json.data;
    if (Array.isArray(data)) return data;
    return [];
  },

  getStateCities: async (country: string, state: string): Promise<string[]> => {
    const res = await fetch(`${BASE_URL}/state/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country, state }),
    });
    const json = await res.json();
    const data = json.data;
    if (Array.isArray(data)) return data;
    return [];
  },
};

export default countriesApi;
