import { create } from 'zustand';

const DEFAULT_DATA = {
  items: [
    { id: '1', name: 'Sofá Retrátil', price: 2490, room: 'sala', purchased: false, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80', store: 'Mobly', linkUrl: '' },
    { id: '2', name: 'Mesa de Jantar', price: 1200, room: 'cozinha', purchased: true, imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=400&q=80', store: 'Tok&Stok', linkUrl: '' },
  ],
  rooms: [
    { id: 'sala', name: 'Sala', color: 'var(--accent)' },
    { id: 'cozinha', name: 'Cozinha', color: '#38BDF8' },
    { id: 'quarto', name: 'Quarto', color: '#64748B' },
    { id: 'banheiro', name: 'Banheiro', color: '#475569' },
  ],
};

export const useStore = create((set) => ({
  user: { name: 'Alex', email: 'alex@example.com', isLoggedIn: true },
  house: { id: 'house123', name: 'Nossa Casa', members: ['Alex'] },
  items: JSON.parse(localStorage.getItem('nossa_casa_items')) || DEFAULT_DATA.items,
  rooms: DEFAULT_DATA.rooms,
  viewMode: 'list', // 'list' | 'grid'
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  login: () => set({ user: { name: 'Alex', email: 'alex@example.com', isLoggedIn: true } }),
  logout: () => set({ user: null }),
  
  addItem: (item) => set((state) => {
    const newItems = [...state.items, { ...item, id: Date.now().toString() }];
    localStorage.setItem('nossa_casa_items', JSON.stringify(newItems));
    return { items: newItems };
  }),
  
  updateItem: (id, updates) => set((state) => {
    const newItems = state.items.map(i => i.id === id ? { ...i, ...updates } : i);
    localStorage.setItem('nossa_casa_items', JSON.stringify(newItems));
    return { items: newItems };
  }),
  
  deleteItem: (id) => set((state) => {
    const newItems = state.items.filter(i => i.id !== id);
    localStorage.setItem('nossa_casa_items', JSON.stringify(newItems));
    return { items: newItems };
  }),
  
  toggleItem: (id) => set((state) => {
    const newItems = state.items.map(i => i.id === id ? { ...i, purchased: !i.purchased } : i);
    localStorage.setItem('nossa_casa_items', JSON.stringify(newItems));
    return { items: newItems };
  })
}));
