import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, Plus, Check, X, Menu, ExternalLink, Home, ChefHat, Sofa, BedDouble,
  ShowerHead, WashingMachine, Monitor, Car, TreePine, Bot, Settings, BookOpen,
  Wallet, Heart, Gift, Landmark, PiggyBank, TrendingUp, Package, BarChart3,
  Grid3X3, List, Sparkles, CircleDollarSign, ArrowUpRight, Trash2, Star,
  AlertTriangle, Clock, CheckCircle2, Video, Image, StickyNote, Tag, GripVertical,
  Zap, Lightbulb, User, Users, Receipt, PiggyBank as Piggy
} from 'lucide-react';
import './index.css';

import { db, ref, onValue, set as dbSet } from './firebase';

/* ─── Data Store ─── */
const STORE_KEY = 'nossa_casa_data_v4';

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { return null; }
  return null;
}

function saveData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

async function cloudWrite(data) {
  try {
    const dbRef = ref(db, 'shared-data');
    await dbSet(dbRef, { ...data, version: Date.now() });
    return true;
  } catch (err) {
    console.warn('Firebase Write Pending/Error:', err);
    return false;
  }
}

function convertCloudData(remote) {
  if (!remote) return null;
  return {
    items: remote.items || [],
    rooms: remote.rooms || DEFAULT_ROOMS,
    cashBox: remote.cashBox || { dele: 0, dela: 0, outros: 0, reserva: 0 },
    version: remote.version || 0
  };
}

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

const ROOM_ICONS = {
  cozinha: ChefHat, sala: Sofa, quarto: BedDouble, banheiro: ShowerHead,
  lavanderia: WashingMachine, escritorio: Monitor, garagem: Car,
  area_externa: TreePine, tecnologia: Bot
};

const DEFAULT_ROOMS = [
  { id: 'cozinha', name: 'Cozinha', iconKey: 'cozinha' },
  { id: 'sala', name: 'Sala', iconKey: 'sala' },
  { id: 'quarto', name: 'Quarto', iconKey: 'quarto' },
  { id: 'banheiro', name: 'Banheiro', iconKey: 'banheiro' },
  { id: 'lavanderia', name: 'Lavanderia', iconKey: 'lavanderia' },
  { id: 'escritorio', name: 'Escritório', iconKey: 'escritorio' },
  { id: 'garagem', name: 'Garagem', iconKey: 'garagem' },
  { id: 'area_externa', name: 'Área Externa', iconKey: 'area_externa' },
  { id: 'tecnologia', name: 'Tecnologia & Automação', iconKey: 'tecnologia' },
];

const DEFAULT_DATA = {
  items: [],
  rooms: DEFAULT_ROOMS,
  cashBox: { dele: 0, dela: 0, outros: 0, reserva: 0 },
  version: 0
};

/* ─── Components ─── */
function AnimIcon({ icon: Icon, size = 16, color, className = '', animate = '' }) {
  if (!Icon) return null;
  return (
    <span className={`anim-icon ${animate} ${className}`}>
      <Icon size={size} color={color} strokeWidth={1.8} />
    </span>
  );
}

function RoomIcon({ roomId, size = 16, color }) {
  const IconComp = ROOM_ICONS[roomId] || Home;
  return <AnimIcon icon={IconComp} size={size} color={color} />;
}

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const genId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [data, setData] = useState(() => loadData() || DEFAULT_DATA);
  const [activeRoom, setActiveRoom] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showCashModal, setShowCashModal] = useState(null);
  const [cashAmount, setCashAmount] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', iconKey: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('priority');
  const [syncStatus, setSyncStatus] = useState('idle');
  const [theme, setTheme] = useState(() => localStorage.getItem('nossa_casa_theme') || 'dark');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const isFirstRender = useRef(true);
  const cloudVersionRef = useRef(data.version || 0);
  const writeTimerRef = useRef(null);

  // Stats
  const items = data.items || [];
  const purchasedCount = items.filter(i => i.purchased).length;
  const totalItems = items.length;
  const progressPct = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;
  const totalSpent = items.filter(i => i.purchased).reduce((s, i) => s + (i.price || 0), 0);
  const totalPending = items.filter(i => !i.purchased).reduce((s, i) => s + (i.price || 0), 0);
  const totalCash = (data.cashBox?.dele || 0) + (data.cashBox?.dela || 0) + (data.cashBox?.outros || 0) + (data.cashBox?.reserva || 0);

  // Logic
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    saveData(data);
    localStorage.setItem('nossa_casa_theme', theme);
    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(async () => {
      setSyncStatus('syncing');
      const ok = await cloudWrite(data);
      setSyncStatus(ok ? 'ok' : 'err');
      if (ok) cloudVersionRef.current = Date.now();
    }, 2500);
  }, [data]);

  // Firebase Realtime Listener with Crash Protection
  useEffect(() => {
    if (!db) {
      setSyncStatus('err');
      return;
    }
    
    try {
      const dbRef = ref(db, 'shared-data');
      const unsubscribe = onValue(dbRef, (snapshot) => {
        try {
          const remote = snapshot.val();
          if (!remote) {
            setSyncStatus('ok');
            return;
          }
          
          if (remote.version && remote.version > cloudVersionRef.current) {
            console.log('Firebase Sync: Updating local state...');
            cloudVersionRef.current = remote.version;
            const newData = convertCloudData(remote);
            if (newData) {
              setData(newData);
              saveData(newData);
              setSyncStatus('ok');
            }
          } else {
            setSyncStatus('ok');
          }
        } catch (innerErr) {
          console.error('Data Conversion Error:', innerErr);
          setSyncStatus('err');
        }
      }, (err) => {
        console.warn('Firebase permission or connection issue:', err);
        setSyncStatus('err');
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase real-time sync failed to initialize:', e);
      setSyncStatus('err');
    }
  }, []);

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeRoom !== 'all') list = list.filter(i => i.room === activeRoom);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || (i.store && i.store.toLowerCase().includes(q)));
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'priority') return (a.priority || 3) - (b.priority || 3);
      if (sortBy === 'price') return (b.price || 0) - (a.price || 0);
      return a.name.localeCompare(b.name);
    });
  }, [items, activeRoom, search, sortBy]);

  const smartRecommendations = useMemo(() => {
    const recs = [];
    if (!items.find(i => i.name.toLowerCase().includes('alexa'))) {
      recs.push({ title: 'Casa Inteligente', desc: 'Considere adicionar uma Alexa para automação por voz.', priority: 3 });
    }
    const urgent = items.filter(i => i.priority === 1 && !i.purchased);
    if (urgent.length > 0) {
      recs.push({ title: 'Urgente', desc: `Você tem ${urgent.length} itens essenciais pendentes.`, priority: 1 });
    }
    return recs;
  }, [items]);

  const updateData = useCallback((fn) => {
    setData(prev => fn(JSON.parse(JSON.stringify(prev))));
  }, []);

  const handleTogglePurchased = (id) => updateData(d => {
    const i = d.items.find(x => x.id === id); if (i) i.purchased = !i.purchased; return d;
  });

  const [vIdx, setVIdx] = useState(0);
  const [vFade, setVFade] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVFade(false);
      setTimeout(() => { setVIdx(p => (p + 1) % VERSES.length); setVFade(true); }, 500);
    }, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`app-layout ${theme === 'light' ? 'light-theme' : ''}`}>
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
        <span className="logo"><AnimIcon icon={Home} size={18} color="#f59e0b" animate="pulse" /> Nossa Casa</span>
      </div>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo"><AnimIcon icon={Home} size={20} color="#f59e0b" animate="pulse" /> Nossa Casa</div>
        <div className="logo-sub">Planejando o nosso futuro lar.</div>

        <div className="verse-banner glass-sm">
          <BookOpen size={12} className="verse-icon" />
          <div className={`verse-content ${vFade ? 'fade-in' : 'fade-out'}`}>
            <p className="verse-text">"{VERSES[vIdx].text}"</p>
            <p className="verse-ref">{VERSES[vIdx].ref}</p>
          </div>
        </div>

        <div className="nav-section">CATEGORIAS</div>
        <button className={`nav-btn ${activeRoom === 'all' ? 'active' : ''}`} onClick={() => { setActiveRoom('all'); setSidebarOpen(false); }}>
          <AnimIcon icon={Grid3X3} size={15} /> Todos os Itens
          <span className="nav-count">{totalItems}</span>
        </button>
        {data.rooms.map(r => (
          <button key={r.id} className={`nav-btn ${activeRoom === r.id ? 'active' : ''}`} onClick={() => { setActiveRoom(r.id); setSidebarOpen(false); }}>
            <RoomIcon roomId={r.iconKey || r.id} size={15} /> {r.name}
            <span className="nav-count">{items.filter(i => i.room === r.id).length}</span>
          </button>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div className="sync-indicator">
            <div className={`sync-dot ${syncStatus}`}></div>
            <span>{syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'err' ? 'Erro na nuvem' : 'Nuvem Atualizada'}</span>
          </div>
          <button className="nav-btn" onClick={() => setShowSettingsModal(true)} style={{ color: '#666' }}>
            <Settings size={14} /> Configurações
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-header animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="page-title">A Nossa Casa <AnimIcon icon={Sparkles} size={18} color="#f59e0b" animate="float" /></h1>
              <p className="page-desc">Construindo o nosso lar com planos e muito amor.</p>
            </div>
            <div className="summary-pill glass-sm">
              <div className="pill-item"><span className="pill-label">Total Gasto</span><span className="pill-value">{fmt(totalSpent)}</span></div>
              <div className="pill-divider" /><div className="pill-item"><span className="pill-label">Pendente</span><span className="pill-value" style={{ color: '#ef4444' }}>{fmt(totalPending)}</span></div>
            </div>
          </div>
        </div>

        {smartRecommendations.length > 0 && (
          <div className="dashboard-widgets animate-in">
            <div className="section-header"><div className="section-icon"><AnimIcon icon={Bot} size={15} color="#f59e0b" animate="pulse" /></div><span className="section-title">SUGESTÕES</span><div className="section-line"></div></div>
            <div className="widgets-grid">{smartRecommendations.map((rec, i) => (<div key={i} className={`widget-card p-${rec.priority}`}><div className="widget-icon">{rec.priority === 1 ? <AlertTriangle size={14} /> : <Zap size={14} />}</div><div className="widget-content"><div className="widget-title">{rec.title}</div><div className="widget-desc">{rec.desc}</div></div></div>))}</div>
          </div>
        )}

        <div className="cash-grid animate-in" style={{ animationDelay: '.1s' }}>
          {[
            { key: 'dele', label: 'Caixa Dele', icon: Wallet, color: '#3b82f6' },{ key: 'dela', label: 'Caixa Dela', icon: Heart, color: '#ec4899' },
            { key: 'outros', label: 'Outros', icon: Gift, color: '#8b5cf6' },{ key: 'reserva', label: 'Reserva', icon: Landmark, color: '#06b6d4' }
          ].map(box => (
            <div key={box.key} className="cash-card">
              <div className="cash-label" style={{ color: box.color }}><box.icon size={12} /> {box.label}</div>
              <div className="cash-value">{fmt(data.cashBox[box.key] || 0)}</div>
              <button className="cash-btn" onClick={() => { 
                setCashAmount(data.cashBox[box.key] || '');
                setShowCashModal(box.key); 
              }}>+ Atualizar</button>
            </div>
          ))}
          <div className="cash-card total">
            <div className="cash-label"><CircleDollarSign size={13} color="#f59e0b" /> Total</div>
            <div className="cash-value">{fmt(totalCash)}</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}>
              <span>{purchasedCount}/{totalItems} comprados</span><span>{progressPct}%</span>
            </div>
          </div>
        </div>

        <div className="toolbar animate-in">
          <div className="search-wrap" style={{ flex: 1 }}><Search size={16} /><input className="search-input" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="form-select" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}><option value="priority">Prioritários</option><option value="price">Maior Preço</option><option value="name">Nome (A-Z)</option></select>
          <div className="view-tabs"><button className={`view-tab ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid3X3 size={13} /></button><button className={`view-tab ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={13} /></button></div>
        </div>

        <div className={`products-${viewMode} animate-in`}>
          {filteredItems.map(item => (
            <div key={item.id} className={`product-card ${item.purchased ? 'purchased' : ''}`} onClick={() => { setEditItem(item); setShowModal(true); }}>
              <div className="product-img-wrap">
                <div className="product-placeholder"><AnimIcon icon={Package} size={32} color="rgba(255,255,255,.05)" /></div><div className="product-img-gradient" />
                {item.purchased && <div className="product-purchased-overlay"><Check size={24} color="#fff" strokeWidth={3} /></div>}
                {item.videoLink && !item.purchased && (<a href={item.videoLink} target="_blank" rel="noopener noreferrer" className="video-badge" onClick={e => e.stopPropagation()}><Video size={12} /> Assistir</a>)}
                <div className={`product-priority priority-${item.priority || 3}`}>{ [AlertTriangle, Zap, Lightbulb][(item.priority || 3)-1] && <AnimIcon icon={[AlertTriangle, Zap, Lightbulb][(item.priority || 3)-1]} size={13} /> }</div>
                {!item.purchased && item.price > 0 && item.price <= totalCash && <div className="product-badge"><Sparkles size={11} /> <span>Pode Comprar</span></div>}
              </div>
              <div className="product-body">
                <div className={`product-name ${item.purchased ? 'done' : ''}`}>{item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div className="product-price">{fmt(item.price || 0)}</div>
                  <button className={`check-btn ${item.purchased ? 'done' : ''}`} onClick={e => { e.stopPropagation(); handleTogglePurchased(item.id); }}><Check size={16} strokeWidth={3} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="fab" onClick={() => { setEditItem(null); setShowModal(true); }}><Plus size={24} /></button>
      </main>

      {showModal && <ItemModal item={editItem} rooms={data.rooms} onSave={val => {
        updateData(d => {
          if (val.id) { const i = d.items.findIndex(x => x.id === val.id); if (i >= 0) d.items[i] = { ...d.items[i], ...val }; }
          else { d.items.push({ ...val, id: genId(), purchased: false }); }
          return d;
        }); setShowModal(false);
      }} onClose={() => setShowModal(false)} />}

      {showCashModal && (
        <div className="modal-overlay" onClick={() => setShowCashModal(null)}><div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 300 }}>
          <div className="modal-header"><h2 className="modal-title">Saldo</h2><button className="modal-close" onClick={() => setShowCashModal(null)}><X size={18} /></button></div>
          <div className="modal-body">
            <label className="form-label">Novo Valor R$</label>
            <input type="number" className="form-input" placeholder="0.00" value={cashAmount} onChange={e => setCashAmount(e.target.value)} />
            <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={() => {
              const v = parseFloat(cashAmount) || 0; 
              updateData(d => { d.cashBox[showCashModal] = v; return d; });
              setCashAmount(''); setShowCashModal(null);
            }}>Salvar</button>
          </div>
        </div></div>
      )}

      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}><div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
          <div className="modal-header"><h2 className="modal-title">Configurações</h2><button className="modal-close" onClick={() => setShowSettingsModal(false)}><X size={18} /></button></div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tema Visual</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className={`btn-secondary ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} style={{ flex: 1, padding: '12px' }}>Escuro</button>
                <button className={`btn-secondary ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} style={{ flex: 1, padding: '12px' }}>Claro</button>
              </div>
            </div>
            <div className="form-group" style={{ opacity: 0.5 }}>
              <label className="form-label">Backup</label>
              <p style={{ fontSize: 11 }}>Os dados estão integrados com o Firebase (Nossa Casa 92ffe).</p>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => setShowSettingsModal(false)}>Fechar</button>
          </div>
        </div></div>
      )}
    </div>
  );
}

function ItemModal({ item, rooms, onSave, onClose }) {
  const [f, setF] = useState(item || { name: '', room: rooms[0]?.id, price: '', priority: 3, store: '', notes: '', videoLink: '' });
  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e => e.stopPropagation()}>
      <div className="modal-header"><h2 className="modal-title">{item ? 'Editar' : 'Novo'}</h2><button className="modal-close" onClick={onClose}><X size={18} /></button></div>
      <div className="modal-body">
        <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Preço</label><input type="number" className="form-input" value={f.price} onChange={e => setF({ ...f, price: parseFloat(e.target.value) || '' })} /></div>
          <div className="form-group"><label className="form-label">Urgência</label><select className="form-select" value={f.priority} onChange={e => setF({ ...f, priority: parseInt(e.target.value) })}><option value="1">Alta</option><option value="2">Média</option><option value="3">Baixa</option></select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Cômodo</label><select className="form-select" value={f.room} onChange={e => setF({ ...f, room: e.target.value })}>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Loja</label><input className="form-input" value={f.store} onChange={e => setF({ ...f, store: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Vídeo</label><input className="form-input" value={f.videoLink} onChange={e => setF({ ...f, videoLink: e.target.value })} /></div>
        <button className="btn-primary" style={{ width: '100%', marginTop: 12, padding: 14 }} onClick={() => onSave(f)}>Salvar</button>
      </div>
    </div></div>
  );
}
