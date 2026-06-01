import axios from 'axios';
import { mockSneakers } from '../constants/mockSneakers.js';

const api = axios.create({
  baseURL: 'https://api.thesneakerdatabase.com/v2',
  timeout: 15000,
});

const pickImage = (image) =>
  image?.original ||
  image?.small ||
  image?.thumbnail ||
  image ||
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80';

export const normalizeSneaker = (item) => ({
  id: item.id || item._id || item.sku || item.name,
  name: item.name || item.title || 'Кроссовки',
  brand: item.brand || item.make || 'SneakerTown',
  retailPrice: item.retailPrice || item.estimatedMarketValue || item.price || 0,
  colorway: item.colorway || item.color || 'Classic',
  releaseDate: item.releaseDate || item.year || '',
  description: item.story || item.description || 'Лаконичная модель для города, прогулок и повседневного стиля.',
  image: pickImage(item.image),
  gender: item.gender,
  sku: item.sku,
});

const normalizeList = (data) => {
  const list = data?.results || data?.sneakers || data?.data || [];
  return list.map(normalizeSneaker);
};

const fallbackSneakers = (params = {}) => {
  const query = String(params.name || '').toLowerCase();
  const brand = String(params.brand || '').toLowerCase();
  const minPrice = Number(params.minPrice || 0);
  const maxPrice = Number(params.maxPrice || Infinity);
  const [sortField, sortDirection] = String(params.sort || 'releaseDate:desc').split(':');
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 24);

  const filtered = mockSneakers
    .filter((item) => !query || `${item.name} ${item.brand}`.toLowerCase().includes(query))
    .filter((item) => !brand || item.brand.toLowerCase() === brand)
    .filter((item) => Number(item.retailPrice) >= minPrice && Number(item.retailPrice) <= maxPrice)
    .filter((item) => !params.releaseDate || item.releaseDate === params.releaseDate)
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name) * direction;
      if (sortField === 'retailPrice') return (Number(a.retailPrice) - Number(b.retailPrice)) * direction;
      return (new Date(a.releaseDate) - new Date(b.releaseDate)) * direction;
    });

  const start = (page - 1) * limit;
  return {
    sneakers: filtered.slice(start, start + limit),
    total: filtered.length,
  };
};

export const sneakersApi = {
  async getSneakers(params = {}) {
    try {
      const { data } = await api.get('/sneakers', { params });
      const sneakers = normalizeList(data);
      return {
        sneakers: sneakers.length ? sneakers : fallbackSneakers(params).sneakers,
        total: data?.count || data?.total || sneakers.length || fallbackSneakers(params).total,
      };
    } catch {
      return fallbackSneakers(params);
    }
  },
  async getSneakerById(id) {
    try {
      const { data } = await api.get(`/sneakers/${id}`);
      return normalizeSneaker(data?.results?.[0] || data?.sneaker || data);
    } catch {
      return mockSneakers.find((item) => item.id === id) || mockSneakers[0];
    }
  },
  async getSneakersByBrand(brand, params = {}) {
    return this.getSneakers({ ...params, brand });
  },
  async searchSneakers(query, params = {}) {
    return this.getSneakers({ ...params, name: query });
  },
  async getPopularSneakers() {
    return this.getSneakers({ limit: 8, brand: 'nike', sort: 'retailPrice:desc' });
  },
};
