import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Check, X, Menu, ExternalLink, Home, ChefHat, Sofa, BedDouble,
  ShowerHead, WashingMachine, Monitor, Car, TreePine, Bot, Settings, BookOpen,
  Wallet, Heart, Gift, Landmark, Package, Grid3X3, List, Sparkles,
  CircleDollarSign, Trash2, AlertTriangle, Video, Zap, Lightbulb,
  Link2, Loader2, Sun, Moon, SlidersHorizontal, Bell,
  Download, Upload, RotateCcw, Eye, EyeOff, ArrowUpRight, Image as ImageIcon, Maximize2, Minimize2,
  Pencil, TrendingUp, PiggyBank, Globe, Clipboard,
  CheckCircle2, XCircle, Star, Palette, Tag,
  Utensils, Lamp, Bath, Refrigerator, Tv, Coffee, Bed, Armchair,
  Fan, Thermometer, Lock, Wifi, Speaker, Gamepad2, Dumbbell,
  Baby, Dog, Cat, Flower2, Shirt, BookOpenCheck, GraduationCap,
  Plane, Music, Camera, Brush, Wrench, Hammer, Plug,
  Droplets, Flame, Wind, Snowflake, UtensilsCrossed,
  Crown, Trophy, Medal, Award, Gem, Coins, Receipt,
  Clock, Timer, CalendarDays, MapPin, Navigation,
  ShoppingBag, ShoppingCart, Store, CreditCard, Banknote,
  Phone, Laptop, Tablet, Watch, Headphones, Bluetooth,
  Lightbulb as LightbulbIcon, Power, Battery, Signal,
  Cloud, CloudRain, Umbrella, Rainbow,
  Heart as HeartIcon, Smile, Frown, PartyPopper
} from 'lucide-react';
import './index.css';
import { db, ref, onValue, set as dbSet } from './firebase';

/* ─── Data ─── */
const STORE_KEY = 'nossa_casa_data_v6';
const SETTINGS_KEY = 'nossa_casa_settings_v2';

function loadData() { try { const r = localStorage.getItem(STORE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveData(d) { localStorage.setItem(STORE_KEY, JSON.stringify(d)); }
function loadSettings() { try { const r = localStorage.getItem(SETTINGS_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

async function cloudWrite(data) {
  try {
    const v = Date.now();
    await dbSet(ref(db, 'shared-data'), { ...data, version: v });
    return v;
  } catch (err) { console.warn('Firebase Write Error:', err); return null; }
}

function convertCloudData(remote) {
  if (!remote) return null;
  return { items: remote.items || [], rooms: remote.rooms || DEFAULT_ROOMS, cashBox: remote.cashBox || { dele: 0, dela: 0, outros: 0, reserva: 0 }, version: remote.version || 0 };
}

/* ─── Icon Library ─── */
const ALL_ICONS = {
  Home, ChefHat, Sofa, BedDouble, ShowerHead, WashingMachine, Monitor, Car, TreePine, Bot,
  Utensils, Lamp, Bath, Tv, Coffee, Bed, Armchair, Fan, Thermometer, Lock, Wifi,
  Speaker, Gamepad2, Dumbbell, Baby, Dog, Cat, Flower2, Shirt, BookOpenCheck,
  GraduationCap, Plane, Music, Camera, Brush, Wrench, Hammer, Plug, Droplets,
  Flame, Wind, Snowflake, UtensilsCrossed, Crown, Trophy, Medal, Award, Gem,
  Coins, Receipt, Clock, Timer, CalendarDays, MapPin, Navigation, ShoppingBag,
  ShoppingCart, Store, CreditCard, Banknote, Phone, Laptop, Tablet, Watch,
  Headphones, Bluetooth, Power, Battery, Signal, Cloud, CloudRain,
  Umbrella, Rainbow, Heart, Smile, Frown, PartyPopper, Star, Tag, Package,
  Sparkles, PiggyBank, Gift, Landmark, Wallet, Settings, Pencil, TrendingUp,
  Zap, Lightbulb, AlertTriangle
};

const ICON_NAMES = Object.keys(ALL_ICONS);

const CATEGORY_COLORS = [
  '#f59e0b', '#3b82f6', '#ec4899', '#22c55e', '#a78bfa', '#06b6d4',
  '#ef4444', '#f97316', '#84cc16', '#14b8a6', '#6366f1', '#d946ef',
  '#e11d48', '#0ea5e9', '#10b981', '#f43f5e', '#8b5cf6', '#facc15',
  '#fb923c', '#2dd4bf', '#818cf8', '#c084fc', '#fbbf24', '#34d399',
];

/* ─── Constants ─── */
const VERSES = [
  { text: 'A mulher sábia edifica a sua casa, mas a insensata a derruba com as próprias mãos.', ref: 'Provérbios 14:1' },
  { text: 'Se o Senhor não edificar a casa, em vão trabalham os que a edificam.', ref: 'Salmos 127:1' },
  { text: 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.', ref: '1 Coríntios 13:4' },
  { text: 'Quanto a mim e à minha casa, serviremos ao Senhor.', ref: 'Josué 24:15' },
  { text: 'Por isso, deixará o homem pai e mãe e se unirá à sua mulher, e os dois se tornarão uma só carne.', ref: 'Gênesis 2:24' },
  { text: 'Onde não há conselho, os planos se frustram, mas com muitos conselheiros há bom êxito.', ref: 'Provérbios 15:22' },
  { text: 'Herança do Senhor são os filhos; o fruto do ventre, seu galardão.', ref: 'Salmos 127:3' },
  { text: 'O cordão de três dobras não se rebenta com facilidade.', ref: 'Eclesiastes 4:12' },
  { text: 'Sobre tudo, amai-vos ardentemente uns aos outros, porque o amor cobrirá multidão de pecados.', ref: '1 Pedro 4:8' },
  { text: 'A casa do justo contém grande tesouro, mas nos lucros do ímpio há perturbação.', ref: 'Provérbios 15:6' },
  { text: 'Maridos, amai vossas mulheres, como também Cristo amou a igreja e a si mesmo se entregou por ela.', ref: 'Efésios 5:25' },
  { text: 'Ensina a criança no caminho em que deve andar, e, ainda quando for velha, não se desviará dele.', ref: 'Provérbios 22:6' },
];

const DEFAULT_ROOMS = [
  { id: 'cozinha', name: 'Cozinha', iconKey: 'ChefHat', color: '#f59e0b' },
  { id: 'sala', name: 'Sala', iconKey: 'Sofa', color: '#3b82f6' },
  { id: 'quarto', name: 'Quarto', iconKey: 'BedDouble', color: '#ec4899' },
  { id: 'banheiro', name: 'Banheiro', iconKey: 'ShowerHead', color: '#06b6d4' },
  { id: 'lavanderia', name: 'Lavanderia', iconKey: 'WashingMachine', color: '#a78bfa' },
  { id: 'escritorio', name: 'Escritório', iconKey: 'Monitor', color: '#22c55e' },
  { id: 'garagem', name: 'Garagem', iconKey: 'Car', color: '#f97316' },
  { id: 'area_externa', name: 'Área Externa', iconKey: 'TreePine', color: '#10b981' },
  { id: 'tecnologia', name: 'Tecnologia', iconKey: 'Bot', color: '#6366f1' },
];

const INITIAL_ITEMS = [
  { id: '1', name: 'Geladeira Midea', price: 4200, room: 'cozinha', priority: 1, purchased: false, videoLink: 'https://meli.la/2HsdQuS', rating: 0 },
  { id: '2', name: 'Lava e Seca', price: 3800, room: 'lavanderia', priority: 1, purchased: false, videoLink: 'https://meli.la/1LFYhGq', rating: 0 },
  { id: '3', name: 'Forno Air Fryer', price: 1200, room: 'cozinha', priority: 2, purchased: false, videoLink: 'https://meli.la/27dGe7e', rating: 0 },
  { id: '4', name: 'Air Fryer (Amazon)', price: 600, room: 'cozinha', priority: 2, purchased: false, videoLink: 'https://a.co/d/0dYMbALt', rating: 0 },
  { id: '5', name: 'Liquidificador Turbo', price: 350, room: 'cozinha', priority: 3, purchased: false, videoLink: 'https://a.co/d/03JsJxsy', rating: 0 },
  { id: '6', name: 'Batedeira Planetária', price: 850, room: 'cozinha', priority: 2, purchased: false, videoLink: 'https://a.co/d/02DCpNRM', rating: 0 },
  { id: '7', name: 'Jogo de Talheres', price: 250, room: 'cozinha', priority: 2, purchased: false, videoLink: 'https://a.co/d/0ejzDttK', rating: 0 },
  { id: '8', name: 'Kit de Facas Profissionais', price: 400, room: 'cozinha', priority: 2, purchased: false, videoLink: 'https://a.co/d/05BDTS5i', rating: 0 },
  { id: '9', name: 'Cama King Premium Emma', price: 4500, room: 'quarto', priority: 1, purchased: false, rating: 0 },
  { id: '10', name: 'Sofá Modular 4 Lugares', price: 5800, room: 'sala', priority: 1, purchased: false, videoLink: 'https://sofanacaixa.com.br/products/sofa-na-caixa-modular-4-lugares-em-boucle-1canto-puff-cinza', rating: 0 },
  { id: '11', name: 'Fogão de Indução Midea', price: 1800, room: 'cozinha', priority: 1, purchased: false, videoLink: 'https://www.magazineluiza.com.br/cooktop-4-bocas-eletrico-midea-vitroceramico-touch-digital-preto-acendimento-automatico-cyc40p2/p/240118700/ed/ck4b/', rating: 0 },
  { id: '12', name: 'Kit Panelas Prime', price: 1100, room: 'cozinha', priority: 1, purchased: false, videoLink: 'https://a.co/d/0g1fX5nJ', rating: 0 },
  { id: '13', name: 'Jogo de Copos Cristal', price: 150, room: 'cozinha', priority: 3, purchased: false, videoLink: 'https://www.mercadolivre.com.br/up/MLBU3564789520?pdp_filters=item_id:MLB4305363283', rating: 0 },
  { id: '14', name: '2 Vasos Sanitários Prime', price: 2400, room: 'banheiro', priority: 2, purchased: false, videoLink: 'https://meli.la/1DF17sW', rating: 0 },
  { id: '15', name: 'Tapete Banheiro Soft', price: 120, room: 'banheiro', priority: 3, purchased: false, videoLink: 'https://meli.la/1KpqxMe', rating: 0 },
  { id: '16', name: 'Guarda-roupa Bartira Casal', price: 2200, room: 'quarto', priority: 1, purchased: false, videoLink: 'https://share.google/YHDL6Hd6TwpGV3sy9', rating: 0 },
  { id: '17', name: 'Microondas Inox', price: 900, room: 'cozinha', priority: 2, purchased: false, videoLink: 'https://a.co/d/012NWzEk', rating: 0 },
  { id: '18', name: 'TV Sala 70" Samsung 4K', price: 4200, room: 'sala', priority: 1, purchased: false, videoLink: 'https://www.magazineluiza.com.br/smart-tv-70-samsung-uhd-4k-crystal-u8500f-un70u8500fgxzd-tizen-2025/p/240576700/et/tv4k/', rating: 0 },
  { id: '19', name: 'Rack Vivare 180cm', price: 1000, room: 'sala', priority: 2, purchased: false, videoLink: 'https://share.google/Z6avwn38jV8NEAOgI', rating: 0 },
  { id: '20', name: 'Lustre Moderno Crystal', price: 1500, room: 'sala', priority: 3, purchased: false, videoLink: 'https://meli.la/2JxB3fa', rating: 0 },
];

const PRODUCT_SUGGESTIONS = {
  cozinha: [
    { name: 'Cafeteira Expresso', price: 800, priority: 2 },
    { name: 'Torradeira Inox', price: 200, priority: 3 },
    { name: 'Processador de Alimentos', price: 450, priority: 2 },
    { name: 'Conjunto de Potes Herméticos', price: 120, priority: 3 },
    { name: 'Escorredor de Louça Inox', price: 180, priority: 3 },
    { name: 'Filtro de Água', price: 300, priority: 2 },
    { name: 'Lixeira Automática Inox', price: 350, priority: 3 },
    { name: 'Porta Temperos Giratório', price: 90, priority: 3 },
  ],
  sala: [
    { name: 'Mesa de Centro', price: 800, priority: 2 },
    { name: 'Tapete Decorativo', price: 600, priority: 3 },
    { name: 'Cortina Blackout', price: 400, priority: 2 },
    { name: 'Almofadas Decorativas (kit)', price: 200, priority: 3 },
    { name: 'Luminária de Piso', price: 350, priority: 3 },
    { name: 'Aparador / Console', price: 900, priority: 3 },
  ],
  quarto: [
    { name: 'Kit Lençol 400 Fios', price: 350, priority: 2 },
    { name: 'Travesseiro Nasa (par)', price: 250, priority: 2 },
    { name: 'Edredom Pluma', price: 500, priority: 2 },
    { name: 'Abajur Touch', price: 180, priority: 3 },
    { name: 'Criado-mudo', price: 400, priority: 2 },
    { name: 'Espelho Grande', price: 600, priority: 3 },
  ],
  banheiro: [
    { name: 'Kit Acessórios Banheiro Inox', price: 200, priority: 2 },
    { name: 'Ducha Higiênica', price: 150, priority: 2 },
    { name: 'Organizador de Box', price: 80, priority: 3 },
    { name: 'Toalheiro Elétrico', price: 400, priority: 3 },
  ],
  lavanderia: [
    { name: 'Tábua de Passar', price: 200, priority: 2 },
    { name: 'Varal de Teto Retrátil', price: 250, priority: 2 },
    { name: 'Ferro a Vapor', price: 300, priority: 2 },
  ],
  escritorio: [
    { name: 'Cadeira Ergonômica', price: 1500, priority: 1 },
    { name: 'Mesa de Escritório', price: 800, priority: 1 },
    { name: 'Luminária de Mesa LED', price: 200, priority: 2 },
    { name: 'Organizador de Cabos', price: 60, priority: 3 },
    { name: 'Suporte para Monitor', price: 150, priority: 2 },
  ],
  garagem: [
    { name: 'Organizador de Parede', price: 200, priority: 3 },
    { name: 'Kit Ferramentas Completo', price: 500, priority: 2 },
  ],
  area_externa: [
    { name: 'Churrasqueira a Carvão', price: 1200, priority: 2 },
    { name: 'Conjunto Mesa e Cadeiras Área Externa', price: 1500, priority: 2 },
    { name: 'Rede de Descanso', price: 200, priority: 3 },
  ],
  tecnologia: [
    { name: 'Echo Dot Alexa', price: 350, priority: 2 },
    { name: 'Lâmpadas Inteligentes (kit)', price: 200, priority: 2 },
    { name: 'Tomada Inteligente (kit)', price: 150, priority: 3 },
    { name: 'Câmera de Segurança Wi-Fi', price: 300, priority: 2 },
    { name: 'Roteador Wi-Fi 6', price: 500, priority: 1 },
  ],
};

const DEFAULT_SETTINGS = { theme: 'dark', showPurchased: true, showPrices: true, notifications: true };
const DEFAULT_DATA = { items: INITIAL_ITEMS, rooms: DEFAULT_ROOMS, cashBox: { dele: 0, dela: 0, outros: 0, reserva: 0 }, version: Date.now() };

/* ─── Helpers ─── */
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const genId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

function detectStore(url) {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes('amazon') || u.includes('a.co')) return { name: 'Amazon', color: '#FF9900' };
  if (u.includes('mercadolivre') || u.includes('meli.la') || u.includes('mercadolibre')) return { name: 'Mercado Livre', color: '#FFE600' };
  if (u.includes('magazineluiza') || u.includes('magalu')) return { name: 'Magazine Luiza', color: '#0086FF' };
  if (u.includes('americanas')) return { name: 'Americanas', color: '#E60014' };
  if (u.includes('casasbahia')) return { name: 'Casas Bahia', color: '#0066CC' };
  if (u.includes('shopee')) return { name: 'Shopee', color: '#EE4D2D' };
  if (u.includes('aliexpress')) return { name: 'AliExpress', color: '#E43225' };
  if (u.includes('kabum')) return { name: 'KaBuM!', color: '#FF6500' };
  return { name: 'Loja Online', color: '#888' };
}

function detectRoomFromKeywords(name) {
  const n = (name || '').toLowerCase();
  const map = {
    cozinha: ['geladeira', 'fogão', 'cooktop', 'panela', 'talher', 'faca', 'liquidificador', 'batedeira', 'microondas', 'air fryer', 'forno', 'copos', 'prato', 'frigideira', 'cafeteira', 'torradeira'],
    sala: ['sofá', 'sofa', 'rack', 'tv', 'televisão', 'lustre', 'mesa de centro', 'tapete sala', 'cortina'],
    quarto: ['cama', 'colchão', 'guarda-roupa', 'armário', 'travesseiro', 'lençol', 'edredom', 'criado-mudo', 'abajur'],
    banheiro: ['vaso sanitário', 'chuveiro', 'box', 'tapete banheiro', 'toalha', 'espelho banheiro', 'pia banheiro'],
    lavanderia: ['lava', 'máquina de lavar', 'secadora', 'ferro de passar', 'tábua', 'varal'],
    escritorio: ['mesa escritório', 'cadeira escritório', 'monitor', 'teclado', 'mouse', 'webcam', 'headset'],
    garagem: ['carro', 'moto', 'ferrament', 'furadeira', 'compressor'],
    area_externa: ['churrasqueira', 'jardim', 'piscina', 'rede', 'varanda'],
    tecnologia: ['alexa', 'smart', 'automação', 'câmera', 'sensor', 'wi-fi', 'roteador'],
  };
  for (const [room, keywords] of Object.entries(map)) {
    if (keywords.some(k => n.includes(k))) return room;
  }
  return 'sala';
}

async function extractProductFromUrl(url) {
  // Resolve short URLs first
  let resolvedUrl = url;
  try { resolvedUrl = await resolveShortUrl(url); } catch {}

  const proxies = [
    { makeUrl: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`, isJson: true },
    { makeUrl: (u) => `https://api.codetabs.com/v1/proxy?url=${encodeURIComponent(u)}`, isJson: false },
    { makeUrl: (u) => `https://thingproxy.freeboard.io/fetch/${u}`, isJson: false },
    { makeUrl: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, isJson: false },
    { makeUrl: (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`, isJson: false },
  ];
  const urlsToTry = resolvedUrl !== url ? [resolvedUrl, url] : [url];

  for (const tryUrl of urlsToTry) {
    for (const { makeUrl, isJson } of proxies) {
      try {
        const res = await fetch(makeUrl(tryUrl), { signal: AbortSignal.timeout(12000) });
        if (!res.ok) continue;
        let html;
        if (isJson) { const json = await res.json(); html = json.contents || ''; }
        else { html = await res.text(); }
        if (!html) continue;
        const result = parseProductHtml(html, url);
        if (result && result.name && result.name !== 'Produto') {
          // If no image from the link, try searching by product name
          if (!result.image && result.name) {
            try { result.image = await searchImageByName(result.name) || ''; } catch {}
          }
          return result;
        }
      } catch { continue; }
    }
  }
  return null;
}

function parseProductHtml(html, url) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const getMeta = (prop) => (doc.querySelector(`meta[property="${prop}"]`) || doc.querySelector(`meta[name="${prop}"]`))?.getAttribute('content') || '';

  let title = getMeta('og:title') || getMeta('twitter:title') || doc.querySelector('title')?.textContent || '';
  
  // High-priority selector extraction
  if (url.includes('mercadolivre') || url.includes('meli.la')) {
    title = doc.querySelector('.ui-pdp-title')?.textContent || title;
  } else if (url.includes('amazon') || url.includes('a.co')) {
    title = doc.querySelector('#productTitle')?.textContent || title;
  } else if (url.includes('magazineluiza') || url.includes('magalu')) {
    title = doc.querySelector('[data-testid="heading-product-title"]')?.textContent || title;
  }

  title = title.replace(/\s*[-|–]\s*(Amazon|Mercado Livre|Magazine Luiza|Magalu|KaBuM|Shopee|AliExpress).*$/i, '').replace(/\n/g, '').trim();
  const description = getMeta('og:description') || getMeta('description') || '';
  let image = getMeta('og:image') || getMeta('twitter:image') || '';

  // Better image extraction for stores
  if (!image || image.includes('placeholder')) {
    const imgEl = doc.querySelector('.ui-pdp-gallery__figure__image, img.ui-pdp-image, #landingImage, #imgBlkFront, [data-testid="image-selected"] img');
    if (imgEl) image = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || image;
  }

  let price = 0;
  // Specific for ML
  if (url.includes('mercadolivre') || url.includes('meli.la')) {
    const mlPrice = doc.querySelector('.ui-pdp-price__part--medium .andes-money-amount__fraction, .andes-money-amount__fraction')?.textContent;
    if (mlPrice) price = parseFloat(mlPrice.replace(/[^\d]/g, '')) || 0;
  } else if (url.includes('amazon') || url.includes('a.co')) {
     const pWhole = doc.querySelector('.a-price-whole')?.textContent || '';
     const pFrac = doc.querySelector('.a-price-fraction')?.textContent || '';
     if (pWhole) price = parseFloat(pWhole.replace(/[^\d]/g, '') + '.' + pFrac.replace(/[^\d]/g, '')) || 0;
  } else if (url.includes('magazineluiza') || url.includes('magalu')) {
     const magPrice = doc.querySelector('[data-testid="price-value"]')?.textContent;
     if (magPrice) price = parseFloat(magPrice.replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.')) || 0;
  }
  
  if (!price) {
    const priceAmount = getMeta('product:price:amount') || getMeta('og:price:amount');
    if (priceAmount) price = parseFloat(priceAmount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  }
  
  if (!price) {
    const m = [...html.matchAll(/R\$\s*([\d.,]+)/g)];
    if (m.length > 0) price = parseFloat(m[0][1].replace(/\./g, '').replace(',', '.')) || 0;
  }

  return {
    name: title.slice(0, 140) || 'Produto',
    price, description: description.slice(0, 250), image,
    store: detectStore(url)?.name || '', videoLink: url,
    room: detectRoomFromKeywords(title + ' ' + description), priority: 2, rating: 0
  };
}

/* ─── Image extraction (lightweight - just gets og:image) ─── */

// Resolve shortened URLs to their final destination
async function resolveShortUrl(url) {
  // Known shortener patterns - expand to full URLs
  const shorteners = {
    'meli.la': true, 'a.co': true, 'amzn.to': true, 'bit.ly': true,
    'goo.gl': true, 'tinyurl.com': true, 'share.google': true,
  };
  try {
    const hostname = new URL(url).hostname;
    if (!shorteners[hostname]) return url;
  } catch { return url; }

  // Use allorigins to follow redirects — it returns the final URL in headers
  const proxies = [
    (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  ];
  for (const makeUrl of proxies) {
    try {
      const res = await fetch(makeUrl(url), { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      // allorigins /get returns JSON with the final content
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        // The HTML content will contain meta refresh or og tags from final URL
        if (json.contents) {
          const doc = new DOMParser().parseFromString(json.contents, 'text/html');
          // Check if there's a redirect in meta refresh
          const metaRefresh = doc.querySelector('meta[http-equiv="refresh"]');
          if (metaRefresh) {
            const content = metaRefresh.getAttribute('content') || '';
            const m = content.match(/url=(.+)/i);
            if (m) return m[1].trim().replace(/['"]/g, '');
          }
          // Check canonical link
          const canonical = doc.querySelector('link[rel="canonical"]');
          if (canonical) return canonical.getAttribute('href');
          // If the page has og:image, just return original — we'll extract from this content
          const ogImg = doc.querySelector('meta[property="og:image"]');
          if (ogImg) return url; // Content already has what we need
          // Check og:url for the final destination
          const ogUrl = doc.querySelector('meta[property="og:url"]');
          if (ogUrl) return ogUrl.getAttribute('content');
        }
        return json.status?.url || url;
      }
      // For corsproxy, read the HTML and look for og:url
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const ogUrl = (doc.querySelector('meta[property="og:url"]') || doc.querySelector('link[rel="canonical"]'));
      if (ogUrl) return ogUrl.getAttribute('content') || ogUrl.getAttribute('href') || url;
      return url;
    } catch { continue; }
  }
  return url;
}

async function extractImageFromUrl(url) {
  // First, try to resolve shortened URLs
  let resolvedUrl = url;
  try {
    resolvedUrl = await resolveShortUrl(url);
  } catch { /* keep original */ }

  const proxies = [
    // allorigins /get returns JSON with HTML content (follows redirects)
    { makeUrl: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`, isJson: true },
    // allorigins /raw returns raw HTML
    { makeUrl: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, isJson: false },
    // corsproxy
    { makeUrl: (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`, isJson: false },
  ];

  // Try with resolved URL first, then original if different
  const urlsToTry = resolvedUrl !== url ? [resolvedUrl, url] : [url];

  for (const tryUrl of urlsToTry) {
    for (const { makeUrl, isJson } of proxies) {
      try {
        const res = await fetch(makeUrl(tryUrl), { signal: AbortSignal.timeout(10000) });
        if (!res.ok) continue;

        let html;
        if (isJson) {
          const json = await res.json();
          html = json.contents || '';
        } else {
          html = await res.text();
        }

        if (!html) continue;

        const doc = new DOMParser().parseFromString(html, 'text/html');
        const getMeta = (prop) => (doc.querySelector(`meta[property="${prop}"]`) || doc.querySelector(`meta[name="${prop}"]`))?.getAttribute('content') || '';

        const img = getMeta('og:image') || getMeta('twitter:image') || '';
        if (img && img.startsWith('http')) return img;

        // Try to find product images in common patterns
        const imgEl = doc.querySelector('img.a-dynamic-image') // Amazon
          || doc.querySelector('img[data-zoom]') // ML
          || doc.querySelector('.gallery img')
          || doc.querySelector('picture img[src*="http"]');
        if (imgEl) {
          const src = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '';
          if (src && src.startsWith('http')) return src;
        }
      } catch { continue; }
    }
  }
  return null;
}

async function searchImageByName(productName) {
  if (!productName || productName.length < 3) return null;
  // Clean up the name for better search results
  const query = productName.replace(/[^\w\sÀ-ú]/g, '').trim();
  if (!query) return null;

  const proxies = [
    { makeUrl: (q) => `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q + ' produto')}`)}`, isJson: true },
    { makeUrl: (q) => `https://corsproxy.io/?${encodeURIComponent(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q + ' produto')}`)}`, isJson: false },
  ];

  for (const { makeUrl, isJson } of proxies) {
    try {
      const res = await fetch(makeUrl(query), { signal: AbortSignal.timeout(12000) });
      if (!res.ok) continue;

      let html;
      if (isJson) {
        const json = await res.json();
        html = json.contents || '';
      } else {
        html = await res.text();
      }
      if (!html) continue;

      // Extract image URLs from Google Images results
      // Google embeds image URLs in data attributes and script tags
      const imgMatches = [];

      // Pattern 1: Direct image URLs in the HTML (data-src, data-iurl, etc.)
      const dataUrlRegex = /(?:data-src|data-iurl|data-ou|imgurl)="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi;
      let match;
      while ((match = dataUrlRegex.exec(html)) !== null) {
        if (!match[1].includes('google') && !match[1].includes('gstatic')) {
          imgMatches.push(match[1]);
        }
      }

      // Pattern 2: Image URLs in JSON-like structures within scripts
      const jsonImgRegex = /\["(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)",\s*\d+,\s*\d+\]/gi;
      while ((match = jsonImgRegex.exec(html)) !== null) {
        const url = match[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
        if (!url.includes('google') && !url.includes('gstatic') && !url.includes('favicon')) {
          imgMatches.push(url);
        }
      }

      // Pattern 3: og:image or similar meta
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
      if (ogImg && ogImg.startsWith('http')) imgMatches.push(ogImg);

      // Return the first valid-looking product image (prefer larger ones)
      for (const img of imgMatches) {
        if (img.startsWith('http') && img.length > 30) return img;
      }
    } catch { continue; }
  }

  // Fallback: try DuckDuckGo
  try {
    const ddgUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`)}`;
    const res = await fetch(ddgUrl, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const json = await res.json();
      const html = json.contents || '';
      const imgRegex = /vqd=[^&]*&.*?(?:thumbnail|image)":"(https?:\/\/[^"]+)"/gi;
      const match = imgRegex.exec(html);
      if (match && match[1].startsWith('http')) return match[1];
    }
  } catch { /* skip */ }

  return null;
}

/* ─── Animation (Snappier) ─── */
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } };
const modalV = { initial: { opacity: 0, scale: 0.96, y: 16 }, animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }, exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.15 } } };
const cardV = { initial: { opacity: 0, y: 12, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } }, exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12 } } };

/* ─── Animated Icon Component ─── */
function AIcon({ name, size = 16, color, className = '' }) {
  const Comp = ALL_ICONS[name] || Package;
  return (
    <motion.span className={`aicon ${className}`} whileHover={{ scale: 1.15, rotate: 5 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
      <Comp size={size} color={color} strokeWidth={1.8} />
    </motion.span>
  );
}

function RoomIcon({ room, size = 16, color }) {
  const iconKey = room?.iconKey || 'Home';
  return <AIcon name={iconKey} size={size} color={color || room?.color} />;
}

/* ─── Main App ─── */
export default function App() {
  const [data, setData] = useState(() => loadData() || DEFAULT_DATA);
  const [settings, setSettings] = useState(() => loadSettings() || DEFAULT_SETTINGS);
  const [activeRoom, setActiveRoom] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showCashModal, setShowCashModal] = useState(null);
  const [cashAmount, setCashAmount] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('priority');
  const [syncStatus, setSyncStatus] = useState('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [fetchingImages, setFetchingImages] = useState(false);
  const [fetchProgress, setFetchProgress] = useState({ done: 0, total: 0 });

  const isFirstRender = useRef(true);
  const imagesFetchedRef = useRef(false);
  const writeTimerRef = useRef(null);
  const isWritingRef = useRef(false);

  const items = data.items || [];
  const rooms = data.rooms || DEFAULT_ROOMS;
  const purchasedCount = items.filter(i => i.purchased).length;
  const totalItems = items.length;
  const progressPct = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;
  const totalSpent = items.filter(i => i.purchased).reduce((s, i) => s + (i.price || 0), 0);
  const totalPending = items.filter(i => !i.purchased).reduce((s, i) => s + (i.price || 0), 0);
  const totalCash = (data.cashBox?.dele || 0) + (data.cashBox?.dela || 0) + (data.cashBox?.outros || 0) + (data.cashBox?.reserva || 0);
  const theme = settings.theme;

  const updateSettings = useCallback((updates) => {
    setSettings(prev => { const next = { ...prev, ...updates }; saveSettings(next); return next; });
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    saveData(data);
    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(async () => {
      setSyncStatus('syncing');
      const ok = await cloudWrite(data);
      setSyncStatus(ok ? 'ok' : 'err');
    }, 200);
  }, [data]);

  useEffect(() => {
    if (!db) return;
    const dbRef = ref(db, 'shared-data');
    const unsub = onValue(dbRef, (snap) => {
      try {
        const remote = snap.val();
        if (!remote?.version) return;
        setData(cur => {
          if (remote.version > (cur.version || 0)) {
            return convertCloudData(remote) || cur;
          }
          return cur;
        });
      } catch (e) { console.error('Sync err:', e); }
    });
    return () => unsub();
  }, []);

  const [vIdx, setVIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setVIdx(p => (p + 1) % VERSES.length), 15000); return () => clearInterval(t); }, []);

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeRoom !== 'all') list = list.filter(i => i.room === activeRoom);
    if (search) { const q = search.toLowerCase(); list = list.filter(i => i.name.toLowerCase().includes(q) || (i.store && i.store.toLowerCase().includes(q))); }
    if (!settings.showPurchased) list = list.filter(i => !i.purchased);
    return [...list].sort((a, b) => {
      if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
      if (sortBy === 'priority') return (a.priority || 3) - (b.priority || 3);
      if (sortBy === 'price') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return a.name.localeCompare(b.name);
    });
  }, [items, activeRoom, search, sortBy, settings.showPurchased]);

  const suggestions = useMemo(() => {
    const room = activeRoom === 'all' ? null : activeRoom;
    const roomSuggestions = room ? (PRODUCT_SUGGESTIONS[room] || []) : Object.values(PRODUCT_SUGGESTIONS).flat();
    const existingNames = new Set(items.map(i => i.name.toLowerCase()));
    return roomSuggestions.filter(s => !existingNames.has(s.name.toLowerCase())).slice(0, 8);
  }, [items, activeRoom]);

  const updateData = useCallback((fn) => {
    setData(prev => { const copy = JSON.parse(JSON.stringify(prev)); const next = fn(copy); next.version = Date.now(); return next; });
  }, []);

  const handleToggle = (id) => updateData(d => { const i = d.items.find(x => x.id === id); if (i) i.purchased = !i.purchased; return d; });
  const handleDelete = (id) => updateData(d => { d.items = d.items.filter(x => x.id !== id); return d; });

  const handleSave = (val) => {
    updateData(d => {
      if (val.id) { const i = d.items.findIndex(x => x.id === val.id); if (i >= 0) d.items[i] = { ...d.items[i], ...val }; }
      else d.items.push({ ...val, id: genId(), purchased: false });
      return d;
    });
    setShowModal(false); setEditItem(null);
  };

  const handleAddSuggestion = (sug) => {
    const room = activeRoom === 'all' ? detectRoomFromKeywords(sug.name) : activeRoom;
    updateData(d => { d.items.push({ ...sug, id: genId(), room, purchased: false, rating: 0 }); return d; });
  };

  // Auto-fetch images for items with links but no image
  const handleFetchAllImages = useCallback(async () => {
    const needImage = items.filter(i => i.videoLink && !i.image);
    if (needImage.length === 0) return;
    setFetchingImages(true);
    setFetchProgress({ done: 0, total: needImage.length });

    const results = {};
    for (let idx = 0; idx < needImage.length; idx++) {
      const item = needImage[idx];
      try {
        // Priority 1: try to extract image from the product link
        let img = await extractImageFromUrl(item.videoLink);
        // Fallback: search by product name if link extraction failed
        if (!img && item.name) {
          img = await searchImageByName(item.name);
        }
        if (img) results[item.id] = img;
      } catch { /* skip */ }
      setFetchProgress({ done: idx + 1, total: needImage.length });
    }

    if (Object.keys(results).length > 0) {
      updateData(d => {
        for (const [id, img] of Object.entries(results)) {
          const item = d.items.find(x => x.id === id);
          if (item) {
            item.image = img;
            if (!item.store) {
              const store = detectStore(item.videoLink);
              if (store) item.store = store.name;
            }
          }
        }
        return d;
      });
    }
    setFetchingImages(false);
  }, [items, updateData]);

  // Auto-fetch on first load
  useEffect(() => {
    if (imagesFetchedRef.current) return;
    const needImage = items.filter(i => i.videoLink && !i.image);
    if (needImage.length > 0) {
      imagesFetchedRef.current = true;
      // Small delay to let the UI render first
      const t = setTimeout(() => handleFetchAllImages(), 2000);
      return () => clearTimeout(t);
    }
  }, [items, handleFetchAllImages]);

  const handleSaveCategory = (cat) => {
    updateData(d => {
      if (cat.isNew) {
        const id = cat.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        d.rooms.push({ id, name: cat.name, iconKey: cat.iconKey, color: cat.color });
      } else {
        const idx = d.rooms.findIndex(r => r.id === cat.id);
        if (idx >= 0) d.rooms[idx] = { ...d.rooms[idx], name: cat.name, iconKey: cat.iconKey, color: cat.color };
      }
      return d;
    });
    setShowCategoryModal(false); setEditCategory(null);
  };

  const handleDeleteCategory = (id) => {
    updateData(d => {
      d.rooms = d.rooms.filter(r => r.id !== id);
      d.items = d.items.map(i => i.room === id ? { ...i, room: 'sala' } : i);
      return d;
    });
    setShowCategoryModal(false); setEditCategory(null);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `nossa-casa-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { try { const d = JSON.parse(ev.target.result); if (d.items) setData({ ...d, version: Date.now() }); } catch { alert('Arquivo inválido.'); } };
      reader.readAsText(file);
    };
    input.click();
  };

  const activeRoomData = rooms.find(r => r.id === activeRoom);

  return (
    <div className={`app-root ${theme}`} data-theme={theme}>
      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <button className={`bnav-btn ${!showUrlModal && !showSettings && activeRoom === 'all' ? 'active' : ''}`} onClick={() => { setActiveRoom('all'); setSidebarOpen(false); }}>
          <Home size={20} /><span>Início</span>
        </button>
        <button className="bnav-btn" onClick={() => setShowUrlModal(true)}>
          <Link2 size={20} /><span>Link</span>
        </button>
        <button className="bnav-btn bnav-center" onClick={() => { setEditItem(null); setShowModal(true); }}>
          <div className="bnav-plus-ring"><Plus size={22} /></div>
        </button>
        <button className="bnav-btn" onClick={() => setShowSuggestions(true)}>
          <Lightbulb size={20} /><span>Ideias</span>
        </button>
        <button className="bnav-btn" onClick={() => setShowSettings(true)}>
          <SlidersHorizontal size={20} /><span>Config</span>
        </button>
      </nav>

      {/* Sidebar Backdrop */}
      <AnimatePresence>{sidebarOpen && <motion.div className="sidebar-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />}</AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sb-inner">
          <div className="sb-logo"><Home size={18} strokeWidth={2.5} /> Nossa Casa</div>
          <p className="sb-sub">Planejando o nosso lar</p>

          <AnimatePresence mode="wait">
            <motion.div className="verse-card glass" key={vIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.5 }}>
              <BookOpen size={12} className="verse-ico" />
              <p className="verse-txt">"{VERSES[vIdx].text}"</p>
              <p className="verse-ref">{VERSES[vIdx].ref}</p>
            </motion.div>
          </AnimatePresence>

          <div className="sb-label">CATEGORIAS</div>
          <button className={`sb-nav ${activeRoom === 'all' ? 'active' : ''}`} onClick={() => { setActiveRoom('all'); setSidebarOpen(false); }}>
            <Grid3X3 size={15} /> <span>Todos</span> <span className="sb-badge">{totalItems}</span>
          </button>
          {rooms.map(r => (
            <button key={r.id} className={`sb-nav ${activeRoom === r.id ? 'active' : ''}`} onClick={() => { setActiveRoom(r.id); setSidebarOpen(false); }}
              onContextMenu={e => { e.preventDefault(); setEditCategory(r); setShowCategoryModal(true); }}>
              <RoomIcon room={r} size={15} /> <span>{r.name}</span>
              <span className="sb-badge">{items.filter(i => i.room === r.id).length}</span>
            </button>
          ))}
          <button className="sb-nav sb-add-cat" onClick={() => { setEditCategory(null); setShowCategoryModal(true); }}>
            <Plus size={14} /> <span>Nova Categoria</span>
          </button>

          <div className="sb-footer">
            <div className="sync-pill glass">
              <div className={`sync-dot ${syncStatus === 'syncing' ? 'syncing' : syncStatus === 'err' ? 'err' : 'ok'}`} />
              <span>{syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'err' ? 'Erro' : 'Sincronizado'}</span>
            </div>
            <div className="sb-foot-btns">
              <button className="icon-btn-sm glass" onClick={() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })} title="Tema">
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="m-header">
          <button className="icon-btn glass" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="m-logo"><Home size={16} /> Nossa Casa</div>
          <div style={{ width: 40 }} /> {/* Spacer */}
        </header>

        {/* Mobile Room Chips */}
        <div className="m-rooms">
          <div className="chips-scroll">
            <button className={`chip ${activeRoom === 'all' ? 'active' : ''}`} onClick={() => setActiveRoom('all')}>Tudo</button>
            {rooms.map(r => (
              <button key={r.id} className={`chip ${activeRoom === r.id ? 'active' : ''}`} style={activeRoom === r.id ? { background: r.color, borderColor: r.color } : {}} onClick={() => setActiveRoom(r.id)}>
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <motion.div className="pg-header" {...fadeUp}>
          <div className="pg-top">
            <div>
              <h1 className="pg-title">
                {activeRoom === 'all' ? 'Nossa Casa' : activeRoomData?.name || 'Nossa Casa'}
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}>
                  <Sparkles size={18} className="sparkle" />
                </motion.span>
              </h1>
              <p className="pg-sub">Construindo o nosso lar com amor</p>
            </div>
            <div className="pg-actions desktop-only">
              <button className="icon-btn glass" onClick={() => setShowSettings(true)}><Settings size={18} /></button>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card glass">
              <div className="stat-label">Progresso</div>
              <div className="stat-val accent">{purchasedCount}/{totalItems}</div>
              <div className="mini-bar"><div className="mini-fill" style={{ width: `${progressPct}%` }} /></div>
            </div>
            <div className="stat-card glass">
              <div className="stat-label">Investido</div>
              <div className="stat-val green">{fmt(totalSpent)}</div>
            </div>
            <div className="stat-card glass">
              <div className="stat-label">Pendente</div>
              <div className="stat-val red">{fmt(totalPending)}</div>
            </div>
          </div>
        </motion.div>

        {/* Cash Boxes */}
        <motion.div className="cash-section" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
          <div className="sec-head">
            <motion.div className="sec-ico" whileHover={{ rotate: 15 }}><PiggyBank size={14} /></motion.div>
            <span className="sec-title">CAIXINHAS</span><div className="sec-line" />
          </div>
          <div className="cash-grid">
            {[
              { key: 'dele', label: 'Dele', icon: Wallet, color: '#3b82f6' },
              { key: 'dela', label: 'Dela', icon: Heart, color: '#ec4899' },
              { key: 'outros', label: 'Outros', icon: Gift, color: '#a78bfa' },
              { key: 'reserva', label: 'Reserva', icon: Landmark, color: '#06b6d4' },
            ].map((box, i) => (
              <motion.div key={box.key} className="cash-card glass" whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.1 }}
                onClick={() => { setCashAmount(String(data.cashBox[box.key] || '')); setShowCashModal(box.key); }}>
                <div className="cash-ico" style={{ color: box.color, background: `${box.color}18` }}><box.icon size={14} /></div>
                <div className="cash-lbl">{box.label}</div>
                <div className="cash-val">{fmt(data.cashBox[box.key] || 0)}</div>
              </motion.div>
            ))}
            <motion.div className="cash-card glass cash-total" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="cash-ico accent-ico"><CircleDollarSign size={14} /></div>
              <div className="cash-lbl">Total Disponível</div>
              <div className="cash-val accent">{fmt(totalCash)}</div>
              <div className="mini-bar mt-6"><div className="mini-fill" style={{ width: `${progressPct}%` }} /></div>
              <div className="cash-pct">{progressPct}% concluído</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div className="toolbar" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <div className="search-box glass">
            <Search size={16} />
            <input placeholder="Buscar itens..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="search-x" onClick={() => setSearch('')}><X size={14} /></button>}
          </div>
          <div className="tb-actions">
            <select className="tb-select glass" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="priority">Prioridade</option>
              <option value="price">Maior Preço</option>
              <option value="rating">Avaliação</option>
              <option value="name">Nome (A-Z)</option>
            </select>
            <div className="view-tog glass">
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><Grid3X3 size={14} /></button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={14} /></button>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div className="action-row" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }}>
          <button className="action-btn glass" onClick={() => setShowUrlModal(true)}>
            <Link2 size={15} /> <span>Importar por Link</span>
          </button>
          <button className="action-btn glass" onClick={() => setShowSuggestions(true)}>
            <Lightbulb size={15} /> <span>Sugestões</span>
            {suggestions.length > 0 && <span className="action-badge">{suggestions.length}</span>}
          </button>
          {items.some(i => i.videoLink && !i.image) && (
            <button className="action-btn glass" onClick={handleFetchAllImages} disabled={fetchingImages}>
              {fetchingImages ? (
                <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={15} /></motion.span> <span>Buscando imagens... ({fetchProgress.done}/{fetchProgress.total})</span></>
              ) : (
                <><ImageIcon size={15} /> <span>Buscar Imagens dos Links</span><span className="action-badge">{items.filter(i => i.videoLink && !i.image).length}</span></>
              )}
            </button>
          )}
        </motion.div>

        {/* Image fetch progress bar */}
        {fetchingImages && (
          <motion.div className="fetch-progress" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="fetch-bar"><div className="fetch-fill" style={{ width: `${fetchProgress.total > 0 ? (fetchProgress.done / fetchProgress.total) * 100 : 0}%` }} /></div>
            <span className="fetch-text">Buscando imagens dos produtos... {fetchProgress.done} de {fetchProgress.total}</span>
          </motion.div>
        )}

        {/* Items */}
        <div className={`items-${viewMode}`}>
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div className="empty glass" {...fadeUp}>
                <Package size={48} strokeWidth={1} />
                <p className="empty-title">Nenhum item encontrado</p>
                <p className="empty-sub">Adicione itens ou importe por link</p>
                <button className="btn-accent" onClick={() => { setEditItem(null); setShowModal(true); }}><Plus size={16} /> Adicionar</button>
              </motion.div>
            ) : filteredItems.map(item => {
              const roomData = rooms.find(r => r.id === item.room);
              return (
                <motion.div 
                  key={item.id} 
                  className={`card ${item.purchased ? 'purchased' : ''} ${viewMode}`} 
                  variants={cardV} initial="initial" animate="animate" exit="exit" 
                  layout
                  onClick={() => { setEditItem(item); setShowModal(true); }} 
                  whileHover={viewMode === 'grid' ? { y: -4, scale: 1.01 } : { x: 2 }}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="card-vis">
                        {item.image ? (
                          <>
                            <img src={item.image} alt="" className="card-img" loading="lazy" />
                            <button className="card-expand" onClick={e => { e.stopPropagation(); setLightboxImg({ src: item.image, name: item.name, price: item.price, store: item.store, link: item.videoLink }); }} title="Ver imagem">
                              <Maximize2 size={14} />
                            </button>
                          </>
                        ) : <div className="card-ph"><RoomIcon room={roomData} size={28} color="var(--text-muted)" /></div>}
                        <div className="card-grad" />
                        {item.purchased && <div className="card-done-ov"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}><CheckCircle2 size={32} color="#22c55e" /></motion.div></div>}
                        <div className={`card-pri p${item.priority || 3}`}>
                          {item.priority === 1 ? <AlertTriangle size={10} /> : item.priority === 2 ? <Zap size={10} /> : <Lightbulb size={10} />}
                        </div>
                        {item.videoLink && !item.purchased && (
                          <a href={item.videoLink} target="_blank" rel="noopener noreferrer" className="card-link" onClick={e => e.stopPropagation()}>
                            <ExternalLink size={10} /> Ver
                          </a>
                        )}
                        {!item.purchased && item.price > 0 && item.price <= totalCash && (
                          <div className="card-afford"><Sparkles size={9} /> Pode comprar</div>
                        )}
                      </div>
                      <div className="card-body">
                        <div className="card-room-tag" style={{ color: roomData?.color || '#888' }}>
                          <RoomIcon room={roomData} size={10} color={roomData?.color} /> {roomData?.name}
                        </div>
                        <div className={`card-name ${item.purchased ? 'done' : ''}`}>{item.name}</div>
                        {item.rating > 0 && <div className="card-stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={10} fill={i < item.rating ? '#f59e0b' : 'transparent'} color={i < item.rating ? '#f59e0b' : '#333'} />)}</div>}
                        <div className="card-foot">
                          <div className="card-price">{settings.showPrices ? fmt(item.price || 0) : '****'}</div>
                          <button className={`card-chk ${item.purchased ? 'done' : ''}`} onClick={e => { e.stopPropagation(); handleToggle(item.id); }}>
                            <Check size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className={`card-chk ${item.purchased ? 'done' : ''}`} onClick={e => { e.stopPropagation(); handleToggle(item.id); }}><Check size={14} strokeWidth={3} /></button>
                      <div className="list-ico" style={{ background: `${roomData?.color || '#888'}18`, color: roomData?.color }}>
                        <RoomIcon room={roomData} size={14} color={roomData?.color} />
                      </div>
                      <div className="list-mid">
                        <div className={`card-name ${item.purchased ? 'done' : ''}`}>{item.name}</div>
                        <div className="list-meta">{roomData?.name}{item.store && ` · ${item.store}`}</div>
                      </div>
                      <div className="list-end">
                        <div className="card-price">{settings.showPrices ? fmt(item.price || 0) : '****'}</div>
                        <div className={`list-dot p${item.priority || 3}`} />
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <motion.button className="fab desktop-only" whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditItem(null); setShowModal(true); }}>
          <Plus size={20} /> <span>Novo Item</span>
        </motion.button>
      </main>

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {showModal && (
          <Modal onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Editar Item' : 'Novo Item'}>
            <ItemForm item={editItem} rooms={rooms} onSave={handleSave} onDelete={editItem ? () => { handleDelete(editItem.id); setShowModal(false); setEditItem(null); } : null} />
          </Modal>
        )}
        {showUrlModal && (
          <Modal onClose={() => setShowUrlModal(false)} title="Importar por Link">
            <UrlExtractor rooms={rooms} onImport={(item) => { handleSave(item); setShowUrlModal(false); }} />
          </Modal>
        )}
        {showCashModal && (
          <Modal onClose={() => setShowCashModal(null)} title="Atualizar Saldo" small>
            <div className="modal-body">
              <label className="fld-label">Novo Valor (R$)</label>
              <input type="number" className="fld-input" placeholder="0.00" value={cashAmount} onChange={e => setCashAmount(e.target.value)} autoFocus />
              <button className="btn-accent full mt-16" onClick={() => {
                updateData(d => { d.cashBox[showCashModal] = parseFloat(cashAmount) || 0; return d; });
                setCashAmount(''); setShowCashModal(null);
              }}>Salvar</button>
            </div>
          </Modal>
        )}
        {showCategoryModal && (
          <Modal onClose={() => { setShowCategoryModal(false); setEditCategory(null); }} title={editCategory ? 'Editar Categoria' : 'Nova Categoria'}>
            <CategoryForm category={editCategory} onSave={handleSaveCategory} onDelete={editCategory ? () => handleDeleteCategory(editCategory.id) : null} />
          </Modal>
        )}
        {showSuggestions && (
          <Modal onClose={() => setShowSuggestions(false)} title="Sugestões de Produtos">
            <SuggestionsPanel suggestions={suggestions} rooms={rooms} activeRoom={activeRoom} onAdd={handleAddSuggestion} onClose={() => setShowSuggestions(false)} />
          </Modal>
        )}
        {showSettings && (
          <Modal onClose={() => setShowSettings(false)} title="Configurações">
            <SettingsPanel settings={settings} updateSettings={updateSettings} syncStatus={syncStatus}
              onExport={handleExport} onImport={handleImport} onReset={() => { if (confirm('Resetar todos os dados?')) setData({ ...DEFAULT_DATA, version: Date.now() }); }}
              onClose={() => setShowSettings(false)} />
          </Modal>
        )}

        {/* Lightbox */}
        {lightboxImg && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxImg(null)}>
            <motion.div className="lightbox-content" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setLightboxImg(null)}><X size={20} /></button>
              <div className="lightbox-img-wrap">
                <img src={lightboxImg.src} alt={lightboxImg.name} />
              </div>
              <div className="lightbox-info">
                <h3>{lightboxImg.name}</h3>
                <div className="lightbox-meta">
                  {lightboxImg.price > 0 && <span className="lightbox-price">{fmt(lightboxImg.price)}</span>}
                  {lightboxImg.store && <span className="lightbox-store">{lightboxImg.store}</span>}
                </div>
                {lightboxImg.link && (
                  <a href={lightboxImg.link} target="_blank" rel="noopener noreferrer" className="lightbox-link">
                    <ExternalLink size={14} /> Abrir no site
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Modal Wrapper ─── */
function Modal({ children, onClose, title, small }) {
  return (
    <motion.div className="modal-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className={`modal glass ${small ? 'modal-sm' : ''}`} {...modalV} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-x" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── Toggle ─── */
function Toggle({ checked, onChange }) {
  return (
    <button className={`toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
      <motion.div className="toggle-knob" layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </button>
  );
}

/* ─── Star Rating ─── */
function StarRating({ value = 0, onChange }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <motion.button key={n} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }} onClick={() => onChange(value === n ? 0 : n)}>
          <Star size={18} fill={n <= value ? '#f59e0b' : 'transparent'} color={n <= value ? '#f59e0b' : 'var(--text-muted)'} />
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Item Form ─── */
function ItemForm({ item, rooms, onSave, onDelete }) {
  const [f, setF] = useState(item || { name: '', room: rooms[0]?.id, price: '', priority: 2, store: '', videoLink: '', image: '', rating: 0 });
  return (
    <div className="modal-body">
      <div className="fld"><label className="fld-label">Nome do Item</label><input className="fld-input" placeholder="Ex: Geladeira Brastemp" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} autoFocus /></div>
      <div className="fld-row">
        <div className="fld"><label className="fld-label">Preço (R$)</label><input type="number" className="fld-input" placeholder="0.00" value={f.price} onChange={e => setF({ ...f, price: parseFloat(e.target.value) || '' })} /></div>
        <div className="fld"><label className="fld-label">Prioridade</label>
          <select className="fld-select" value={f.priority} onChange={e => setF({ ...f, priority: parseInt(e.target.value) })}>
            <option value="1">Alta</option><option value="2">Média</option><option value="3">Baixa</option>
          </select>
        </div>
      </div>
      <div className="fld-row">
        <div className="fld"><label className="fld-label">Cômodo</label>
          <select className="fld-select" value={f.room} onChange={e => setF({ ...f, room: e.target.value })}>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="fld"><label className="fld-label">Loja</label><input className="fld-input" placeholder="Amazon, ML..." value={f.store || ''} onChange={e => setF({ ...f, store: e.target.value })} /></div>
      </div>
      <div className="fld"><label className="fld-label">Link do Produto</label><input className="fld-input" placeholder="https://..." value={f.videoLink || ''} onChange={e => setF({ ...f, videoLink: e.target.value })} /></div>
      <div className="fld"><label className="fld-label">Imagem (URL)</label><input className="fld-input" placeholder="https://...imagem.jpg" value={f.image || ''} onChange={e => setF({ ...f, image: e.target.value })} /></div>
      {f.image && <div className="img-preview"><img src={f.image} alt="Preview" /></div>}
      <div className="fld"><label className="fld-label">Avaliação</label><StarRating value={f.rating || 0} onChange={v => setF({ ...f, rating: v })} /></div>
      <div className="form-btns">
        {onDelete && <button className="btn-danger" onClick={onDelete}><Trash2 size={14} /> Excluir</button>}
        <button className="btn-accent" style={{ flex: 1 }} onClick={() => onSave(f)}>{item ? 'Atualizar' : 'Adicionar'}</button>
      </div>
    </div>
  );
}

/* ─── Category Form ─── */
function CategoryForm({ category, onSave, onDelete }) {
  const [name, setName] = useState(category?.name || '');
  const [iconKey, setIconKey] = useState(category?.iconKey || 'Home');
  const [color, setColor] = useState(category?.color || '#f59e0b');
  const [iconSearch, setIconSearch] = useState('');

  const filteredIcons = iconSearch ? ICON_NAMES.filter(n => n.toLowerCase().includes(iconSearch.toLowerCase())) : ICON_NAMES;

  return (
    <div className="modal-body">
      <div className="fld"><label className="fld-label">Nome da Categoria</label><input className="fld-input" placeholder="Ex: Área Gourmet" value={name} onChange={e => setName(e.target.value)} autoFocus /></div>

      <div className="fld">
        <label className="fld-label">Cor</label>
        <div className="color-grid">
          {CATEGORY_COLORS.map(c => (
            <motion.button key={c} className={`color-btn ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)}
              whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}>
              {color === c && <Check size={12} color="#fff" />}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="fld">
        <label className="fld-label">Ícone</label>
        <input className="fld-input" placeholder="Buscar ícone..." value={iconSearch} onChange={e => setIconSearch(e.target.value)} />
        <div className="icon-grid">
          {filteredIcons.slice(0, 60).map(n => {
            const Icon = ALL_ICONS[n];
            return (
              <motion.button key={n} className={`icon-btn-pick ${iconKey === n ? 'active' : ''}`} onClick={() => setIconKey(n)}
                whileHover={{ scale: 1.15, rotate: 8 }} whileTap={{ scale: 0.85 }} style={iconKey === n ? { borderColor: color, background: `${color}20` } : {}}>
                <Icon size={18} color={iconKey === n ? color : undefined} />
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="cat-preview glass">
        <div style={{ background: `${color}18`, color, padding: 8, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AIcon name={iconKey} size={20} color={color} />
        </div>
        <span style={{ fontWeight: 700 }}>{name || 'Categoria'}</span>
      </div>

      <div className="form-btns">
        {onDelete && <button className="btn-danger" onClick={onDelete}><Trash2 size={14} /> Excluir</button>}
        <button className="btn-accent" style={{ flex: 1 }} onClick={() => onSave({ name, iconKey, color })}>{category ? 'Atualizar' : 'Adicionar'}</button>
      </div>
    </div>
  );
}

/* ─── URL Extractor ─── */
function UrlExtractor({ rooms, onImport }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(null);

  const handleExtract = useCallback(async (targetUrl) => {
    const cleanUrl = (targetUrl || url).trim();
    if (!cleanUrl || !cleanUrl.startsWith('http')) return;
    setLoading(true); setError(''); setResult(null); setEdit(null);
    try {
      const data = await extractProductFromUrl(cleanUrl);
      if (data?.name && data.name !== 'Produto') { 
        setResult(data); 
        setEdit({ ...data }); 
      } else {
        setError('Não conseguimos ler os dados deste link. Tente outro ou preencha manualmente.');
      }
    } catch (e) { 
      setError('Erro ao acessar o link. Pode ser uma restrição do site ou conexão.'); 
    }
    setLoading(false);
  }, [url]);

  useEffect(() => {
    if (url.length > 20 && url.startsWith('http') && !loading && !result) {
      const t = setTimeout(() => handleExtract(), 450);
      return () => clearTimeout(t);
    }
  }, [url, handleExtract, result, loading]);

  const handlePaste = async () => { 
    try { 
      const t = await navigator.clipboard.readText(); 
      if (t && t.startsWith('http')) {
        setUrl(t);
        handleExtract(t);
      }
    } catch {} 
  };

  return (
    <div className="modal-body url-ext">
      <style>{`
        .url-loading-card {
          padding: 20px; border-radius: var(--radius);
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          display: flex; flex-direction: column; gap: 16px; margin-top: 10px;
        }
        .skeleton-img { width: 100%; height: 160px; border-radius: var(--radius-sm); background: var(--glass-border); }
        .skeleton-line { height: 14px; border-radius: 4px; background: var(--glass-border); }
        .skeleton-line.short { width: 40%; }
        .skeleton-line.mid { width: 70%; }
        .url-extract-header {
            display: flex; flex-direction: column; align-items: center; gap: 12px;
            padding: 10px 0 20px; text-align: center;
        }
        .url-extract-header p { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
        .magic-sparkle { color: var(--accent); filter: drop-shadow(0 0 8px var(--accent-glow)); }
        :root {
          --accent-glow: rgba(245, 158, 11, 0.4);
          --error-glow: rgba(239, 68, 68, 0.3);
          --shimmer: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .shimmer { position: relative; overflow: hidden; }
        .shimmer::after { content: ''; position: absolute; inset: 0; background: var(--shimmer); animation: shimmer 1.5s infinite; }
      `}</style>
      <div className="url-extract-header">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
           <Sparkles size={32} className="magic-sparkle" />
        </motion.div>
        <p>Cole o link do produto desejado e nossa IA fará o resto!</p>
      </div>

      <div className="url-row">
        <div className="url-wrap glass transition-all">
          <Globe size={18} className={loading ? 'animate-pulse' : ''} />
          <input className="url-input" placeholder="https://www.loja.com/produto..." value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleExtract()} />
        </div>
        <div className="url-btn-group">
          <motion.button className="icon-btn glass" whileTap={{ scale: 0.9 }} onClick={handlePaste} title="Colar" style={{ height: '44px', width: '44px' }}><Clipboard size={18} /></motion.button>
          <button className="btn-accent" onClick={() => handleExtract()} disabled={loading || !url.trim()} style={{ flex: 1, height: '44px' }}>
            {loading ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Loader2 size={18} /></motion.span> : <Search size={18} />}
            {loading ? 'Lendo...' : 'Extrair'}
          </button>
        </div>
      </div>

      {error && <motion.div className="url-error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><XCircle size={16} /> {error}</motion.div>}
      
      {loading && (
        <motion.div className="url-loading-card glass" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="skeleton-img shimmer"></div>
          <div className="skeleton-line mid shimmer"></div>
          <div className="skeleton-line shimmer"></div>
          <div className="skeleton-line short shimmer"></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <div className="skeleton-line short shimmer" style={{ flex: 1 }}></div>
            <div className="skeleton-line short shimmer" style={{ flex: 1 }}></div>
          </div>
        </motion.div>
      )}

      {edit && !loading && (
        <motion.div className="url-result" {...fadeUp}>
          <div className="url-ok"><CheckCircle2 size={18} /> Produto Identificado!</div>
          {edit.image && (
            <motion.div className="url-img shadow-lg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <img src={edit.image} alt="" />
            </motion.div>
          )}
          
          <div className="fld"><label className="fld-label">Nome do Produto</label><input className="fld-input" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} /></div>
          
          <div className="fld-row">
            <div className="fld"><label className="fld-label">Preço</label><input type="number" className="fld-input" value={edit.price} onChange={e => setEdit({ ...edit, price: parseFloat(e.target.value) || 0 })} /></div>
            <div className="fld"><label className="fld-label">Cômodo</label>
              <select className="fld-select" value={edit.room} onChange={e => setEdit({ ...edit, room: e.target.value })}>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="fld-row">
            <div className="fld"><label className="fld-label">Prioridade</label>
              <select className="fld-select" value={edit.priority} onChange={e => setEdit({ ...edit, priority: parseInt(e.target.value) })}>
                <option value="1">Alta</option><option value="2">Média</option><option value="3">Baixa</option>
              </select>
            </div>
            <div className="fld"><label className="fld-label">Loja</label><input className="fld-input" value={edit.store || ''} onChange={e => setEdit({ ...edit, store: e.target.value })} /></div>
          </div>
          
          <button className="btn-accent full mt-16 py-12" onClick={() => onImport(edit)} style={{ height: '52px', fontSize: '15px' }}>
            <Plus size={20} /> Adicionar à Lista
          </button>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Suggestions ─── */
function SuggestionsPanel({ suggestions, rooms, activeRoom, onAdd, onClose }) {
  return (
    <div className="modal-body">
      <p className="url-desc">Produtos sugeridos que você ainda não tem na sua lista{activeRoom !== 'all' ? ` para ${rooms.find(r => r.id === activeRoom)?.name}` : ''}.</p>
      {suggestions.length === 0 ? (
        <div className="empty-mini"><Sparkles size={24} /><p>Sua lista já está bem completa!</p></div>
      ) : (
        <div className="sug-grid">
          {suggestions.map((s, i) => (
            <motion.div key={i} className="sug-card glass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.02 }}>
              <div className="sug-info">
                <div className="sug-name">{s.name}</div>
                <div className="sug-price">{fmt(s.price)}</div>
              </div>
              <div className={`sug-pri p${s.priority}`}>{s.priority === 1 ? 'Alta' : s.priority === 2 ? 'Média' : 'Baixa'}</div>
              <motion.button className="sug-add" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onAdd(s)}>
                <Plus size={16} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Settings ─── */
function SettingsPanel({ settings, updateSettings, syncStatus, onExport, onImport, onReset, onClose }) {
  return (
    <div className="modal-body settings">
      <div className="stg-section">
        <h3 className="stg-title">Aparência</h3>
        <div className="stg-row">
          <div className="stg-info">{settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}<div><div className="stg-name">Tema</div><div className="stg-desc">Alterna entre claro e escuro</div></div></div>
          <div className="theme-btns">
            <button className={settings.theme === 'dark' ? 'active' : ''} onClick={() => updateSettings({ theme: 'dark' })}><Moon size={14} /> Escuro</button>
            <button className={settings.theme === 'light' ? 'active' : ''} onClick={() => updateSettings({ theme: 'light' })}><Sun size={14} /> Claro</button>
          </div>
        </div>
      </div>
      <div className="stg-section">
        <h3 className="stg-title">Exibição</h3>
        <div className="stg-row"><div className="stg-info"><Eye size={16} /><div><div className="stg-name">Mostrar comprados</div><div className="stg-desc">Exibir itens já comprados</div></div></div><Toggle checked={settings.showPurchased} onChange={v => updateSettings({ showPurchased: v })} /></div>
        <div className="stg-row"><div className="stg-info"><CircleDollarSign size={16} /><div><div className="stg-name">Mostrar preços</div><div className="stg-desc">Exibir preços nos cards</div></div></div><Toggle checked={settings.showPrices} onChange={v => updateSettings({ showPrices: v })} /></div>
        <div className="stg-row"><div className="stg-info"><Bell size={16} /><div><div className="stg-name">Notificações</div><div className="stg-desc">Alertas de alterações</div></div></div><Toggle checked={settings.notifications} onChange={v => updateSettings({ notifications: v })} /></div>
      </div>
      <div className="stg-section">
        <h3 className="stg-title">Dados</h3>
        <div className="stg-row"><div className="stg-info"><Download size={16} /><div><div className="stg-name">Exportar dados</div><div className="stg-desc">Backup em JSON</div></div></div><button className="btn-outline" onClick={onExport}><Download size={14} /> Exportar</button></div>
        <div className="stg-row"><div className="stg-info"><Upload size={16} /><div><div className="stg-name">Importar dados</div><div className="stg-desc">Restaurar backup</div></div></div><button className="btn-outline" onClick={onImport}><Upload size={14} /> Importar</button></div>
        <div className="stg-row"><div className="stg-info"><RotateCcw size={16} /><div><div className="stg-name">Resetar tudo</div><div className="stg-desc">Voltar aos dados iniciais</div></div></div><button className="btn-danger-sm" onClick={onReset}><RotateCcw size={14} /> Resetar</button></div>
      </div>
      <div className="stg-section">
        <h3 className="stg-title">Sincronização</h3>
        <div className="sync-card glass">
          <div className={`sync-dot-lg ${syncStatus === 'ok' ? 'ok' : syncStatus === 'syncing' ? 'syncing' : 'err'}`} />
          <div><div className="stg-name">Firebase Realtime</div><div className="stg-desc">{syncStatus === 'ok' ? 'Conectado e sincronizado' : syncStatus === 'syncing' ? 'Sincronizando...' : 'Erro na conexão'}</div></div>
        </div>
        <p className="stg-note">Alterações feitas por outra pessoa aparecem automaticamente em tempo real.</p>
      </div>
      <button className="btn-accent full mt-16" onClick={onClose}>Fechar</button>
    </div>
  );
}
