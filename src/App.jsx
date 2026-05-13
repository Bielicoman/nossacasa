import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Settings, Home, Lightbulb, Wallet,
  Check, Trash2, Bell, X, Camera, Link as LinkIcon, Edit2,
  LayoutGrid, List as ListIcon, ShoppingBag,
  ExternalLink, LogOut, UserPlus, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticImpact, hapticSuccess, hapticWarning } from './haptics';
import { useStore } from './store/useStore';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function App() {
  const { items, rooms, viewMode, setViewMode, user, login, logout, addItem, updateItem, deleteItem, toggleItem } = useStore();

  const [activeTab, setActiveTab] = useState('home');
  const [activeRoom, setActiveRoom] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Drawers
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showProductModal, setShowProductModal] = useState(null);

  // Add Form State
  const [addMode, setAddMode] = useState('manual'); // manual, link, photo
  const [newItem, setNewItem] = useState({ name: '', price: '', room: 'sala', linkUrl: '' });
  const [isScraping, setIsScraping] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Derived state
  const listStats = useMemo(() => {
    const total = items.length;
    const purchased = items.filter(i => i.purchased).length;
    const spent = items.filter(i => i.purchased).reduce((acc, i) => acc + (Number(i.price) || 0), 0);
    const pending = items.filter(i => !i.purchased).reduce((acc, i) => acc + (Number(i.price) || 0), 0);
    return { total, purchased, spent, pending, pct: total > 0 ? Math.round((purchased / total) * 100) : 0 };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchRoom = activeRoom === 'all' || item.room === activeRoom;
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRoom && matchSearch;
    }).sort((a, b) => (a.purchased === b.purchased ? 0 : a.purchased ? 1 : -1));
  }, [items, activeRoom, searchTerm]);

  // Actions
  const handleAddItem = () => {
    if (!newItem.name.trim()) { hapticWarning(); return; }
    hapticSuccess();
    addItem({
      name: newItem.name,
      price: Number(newItem.price) || 0,
      room: newItem.room,
      purchased: false,
      linkUrl: newItem.linkUrl,
      imageUrl: addMode === 'link' ? 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80' : '' // Mock image
    });
    setNewItem({ name: '', price: '', room: 'sala', linkUrl: '' });
    setShowAddDrawer(false);
  };

  const handleSimulateScraping = () => {
    if (!newItem.linkUrl) return;
    setIsScraping(true);
    setTimeout(() => {
      setNewItem(prev => ({ ...prev, name: 'Produto Importado do Link', price: '1499.90' }));
      setIsScraping(false);
      hapticSuccess();
    }, 1500);
  }

  const handleDelete = (id) => {
    hapticWarning();
    deleteItem(id);
    if (showProductModal?.id === id) setShowProductModal(null);
  };

  // Login Screen
  if (!user?.isLoggedIn) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: 12 }}>Nossa Casa</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 40 }}>Construa seu lar junto com quem você ama.</p>
        <button className="btn-primary" style={{ width: '100%', height: 56 }} onClick={login}>
          Continuar com Google
        </button>
        <button className="btn-secondary" style={{ width: '100%', height: 56, marginTop: 12 }} onClick={login}>
          Continuar com Email
        </button>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* ─── Header & Finances (Top) ─── */}
      <header className="header" style={{ paddingBottom: 16 }}>
        <div className="nav-top" style={{ marginBottom: 20 }}>
          <div className="profile-circle">
            <img src="https://i.pravatar.cc/100?u=nossa-casa" alt="Profile" />
          </div>
          <div className="icon-btn">
            <Bell size={20} />
          </div>
        </div>

        {/* Finance Header */}
        <div className="surface-glass" style={{ padding: 20, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="section-label" style={{ marginBottom: 4 }}>Progresso da Casa</p>
              <h2 style={{ fontSize: '32px', color: 'var(--accent)', lineHeight: 1 }}>{listStats.pct}%</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="section-label" style={{ marginBottom: 4 }}>Já Investido</p>
              <h3 style={{ fontSize: '18px' }}>{fmt(listStats.spent)}</h3>
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${listStats.pct}%` }} style={{ height: '100%', background: 'var(--accent)' }} />
          </div>
          <div>
            <p className="section-label" style={{ marginBottom: 4, display: 'inline-block', marginRight: 8 }}>Total em Desejos:</p>
            <span style={{ fontWeight: 600 }}>{fmt(listStats.pending)}</span>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search Bar */}
              <section style={{ marginBottom: 16 }}>
                <div className="surface-glass" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '16px', gap: 12 }}>
                  <Search size={20} color="var(--text-dim)" />
                  <input
                    type="text"
                    placeholder="Buscar itens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', outline: 'none', width: '100%' }}
                  />
                </div>
              </section>

              {/* Categories Chips */}
              <section style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', overflowX: 'auto', gap: 8, paddingBottom: 8 }}>
                  <motion.button
                    className={`chip ${activeRoom === 'all' ? 'active' : ''}`}
                    style={{
                      padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)',
                      background: activeRoom === 'all' ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: activeRoom === 'all' ? '#000' : '#fff',
                      fontWeight: 700, fontSize: '14px'
                    }}
                    onClick={() => { hapticImpact(); setActiveRoom('all'); }}
                  >
                    Tudo
                  </motion.button>
                  {rooms.map(room => (
                    <motion.button
                      key={room.id}
                      className={`chip ${activeRoom === room.id ? 'active' : ''}`}
                      style={{
                        padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)',
                        background: activeRoom === room.id ? room.color : 'var(--bg-elevated)',
                        color: activeRoom === room.id ? '#000' : '#fff',
                        fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap'
                      }}
                      onClick={() => { hapticImpact(); setActiveRoom(room.id); }}
                    >
                      {room.name}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* List Section Header */}
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 className="section-label">Itens Recentes ({filteredItems.length})</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="icon-btn" style={{ width: 32, height: 32, background: viewMode === 'list' ? 'var(--accent)' : 'var(--bg-elevated)', color: viewMode === 'list' ? '#000' : '#fff' }} onClick={() => setViewMode('list')}>
                      <ListIcon size={16} />
                    </button>
                    <button className="icon-btn" style={{ width: 32, height: 32, background: viewMode === 'grid' ? 'var(--accent)' : 'var(--bg-elevated)', color: viewMode === 'grid' ? '#000' : '#fff' }} onClick={() => setViewMode('grid')}>
                      <LayoutGrid size={16} />
                    </button>
                  </div>
                </div>

                {/* Items Container */}
                <div style={{
                  display: viewMode === 'grid' ? 'grid' : 'flex',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <AnimatePresence>
                    {filteredItems.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        layout
                        onClick={() => setShowProductModal(item)}
                        className={`surface-glass ${item.purchased ? 'purchased' : ''}`}
                        style={{
                          borderRadius: 20,
                          padding: viewMode === 'list' ? '12px' : '0',
                          display: 'flex',
                          flexDirection: viewMode === 'list' ? 'row' : 'column',
                          alignItems: viewMode === 'list' ? 'center' : 'stretch',
                          gap: 12,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          opacity: item.purchased ? 0.6 : 1
                        }}
                      >
                        {/* Image for Grid View */}
                        {viewMode === 'grid' && (
                          <div style={{ width: '100%', height: 120, background: 'var(--bg-elevated)', position: 'relative' }}>
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShoppingBag size={32} color="var(--text-dim)" />
                              </div>
                            )}
                            {item.purchased && (
                              <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--accent)', borderRadius: '50%', padding: 4 }}>
                                <Check size={16} color="#000" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Icon for List View */}
                        {viewMode === 'list' && (
                          <div onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }} style={{ width: 40, height: 40, borderRadius: '50%', border: `1px solid ${item.purchased ? 'var(--accent)' : 'var(--glass-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.purchased ? <Check size={20} color="var(--accent)" /> : <ShoppingBag size={20} color="#555" />}
                          </div>
                        )}

                        <div style={{ flex: 1, padding: viewMode === 'grid' ? '12px' : 0 }}>
                          <div style={{ fontWeight: 600, textDecoration: item.purchased ? 'line-through' : 'none', marginBottom: 4, fontSize: viewMode === 'grid' ? '14px' : '16px' }}>
                            {item.name}
                          </div>
                          <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: viewMode === 'grid' ? 8 : 0 }}>
                            {rooms.find(r => r.id === item.room)?.name}
                          </div>
                          {viewMode === 'grid' && (
                            <div style={{ fontWeight: 700, color: item.purchased ? '#fff' : 'var(--accent)' }}>
                              {fmt(item.price)}
                            </div>
                          )}
                        </div>

                        {viewMode === 'list' && (
                          <div style={{ fontWeight: 700, color: item.purchased ? '#fff' : 'var(--accent)', paddingRight: 8 }}>
                            {fmt(item.price)}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', gridColumn: '1 / -1' }}>
                        <ShoppingBag size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                        <p>Nenhum item encontrado.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 style={{ fontSize: '24px', marginBottom: 24 }}>Sua Casa</h2>

              <div className="surface-glass" style={{ padding: 20, borderRadius: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="profile-circle" style={{ width: 64, height: 64 }}><img src="https://i.pravatar.cc/100?u=nossa-casa" alt="Profile" /></div>
                <div>
                  <h3 style={{ fontSize: '20px' }}>{user.name}</h3>
                  <p style={{ color: 'var(--text-dim)' }}>{user.email}</p>
                </div>
              </div>

              <h3 className="section-label" style={{ marginBottom: 16 }}>Membros da Casa</h3>
              <div className="surface-glass" style={{ padding: 16, borderRadius: 20, marginBottom: 24 }}>
                {useStore.getState().house.members.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i === 0 ? 12 : 0 }}>
                    <div className="profile-circle" style={{ width: 40, height: 40 }}><img src={`https://i.pravatar.cc/100?u=${m}`} alt={m} /></div>
                    <span style={{ flex: 1 }}>{m}</span>
                  </div>
                ))}
                <button className="btn-secondary" style={{ width: '100%', marginTop: 16 }}>
                  <UserPlus size={18} /> Convidar Pessoa
                </button>
              </div>

              <button className="btn-secondary" style={{ width: '100%', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={logout}>
                <LogOut size={18} /> Sair da Conta
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Bottom Navigation ─── */}
      <nav className="bottom-nav">
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { hapticImpact(); setActiveTab('home'); }}>
          <Home size={24} />
        </div>
        <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => { hapticImpact(); setActiveTab('stats'); }}>
          <Wallet size={24} />
        </div>
        <div className="nav-item" onClick={() => { hapticImpact(); setShowAddDrawer(true); }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)' }}>
            <Plus size={28} />
          </div>
        </div>
        <div className={`nav-item ${activeTab === 'ideas' ? 'active' : ''}`} onClick={() => { hapticImpact(); setActiveTab('ideas'); }}>
          <Lightbulb size={24} />
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { hapticImpact(); setActiveTab('settings'); }}>
          <Settings size={24} />
        </div>
      </nav>

      {/* ─── Product Details Modal (Large Card) ─── */}
      <AnimatePresence>
        {showProductModal && (
          <>
            <motion.div
              className="sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(null)}
              style={{ zIndex: 200 }}
            />
            <motion.div
              className="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ zIndex: 201, height: '90vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{position:'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10}}>
                <div className="sheet-handle" />
              </div>
              {/* Product Image Header */}
              <div style={{ width: '100%', height: '40%', background: 'var(--bg-elevated)', position: 'relative' }}>
                {showProductModal.imageUrl ? (
                  <img src={showProductModal.imageUrl} alt={showProductModal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={64} color="var(--text-dim)" />
                  </div>
                )}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                  <button className="icon-btn" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: 'none' }} onClick={() => setShowProductModal(null)}>
                    <X size={20} color="#fff" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h2 style={{ fontSize: '28px', lineHeight: 1.2 }}>{showProductModal.name}</h2>
                  <button className="icon-btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>
                    <Edit2 size={18} />
                  </button>
                </div>

                <p style={{ color: 'var(--text-dim)', fontSize: '16px', marginBottom: 24 }}>
                  Ambiente: {rooms.find(r => r.id === showProductModal.room)?.name}
                </p>

                <h1 style={{ fontSize: '36px', color: 'var(--accent)', marginBottom: 32 }}>
                  {fmt(showProductModal.price)}
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    className="btn-primary"
                    style={{ background: showProductModal.purchased ? 'var(--bg-elevated)' : 'var(--accent)', color: showProductModal.purchased ? '#fff' : '#000' }}
                    onClick={() => { toggleItem(showProductModal.id); setShowProductModal(null); }}
                  >
                    {showProductModal.purchased ? 'Marcar como Pendente' : 'Marcar como Comprado'}
                  </button>

                  {showProductModal.linkUrl && (
                    <button className="btn-secondary">
                      <ExternalLink size={18} /> Acessar Loja
                    </button>
                  )}

                  <button className="btn-secondary" style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(showProductModal.id)}>
                    <Trash2 size={18} /> Excluir Item
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Modern Add Drawer ─── */}
      <AnimatePresence>
        {showAddDrawer && (
          <>
            <motion.div
              className="sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDrawer(false)}
            />
            <motion.div
              className="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="sheet-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '24px' }}>Novo Item</h2>
                <div className="icon-btn" onClick={() => setShowAddDrawer(false)}>
                  <X size={20} />
                </div>
              </div>

              {/* Premium Segmented Control */}
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 4, marginBottom: 24, position: 'relative' }}>
                {['manual', 'link', 'photo'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAddMode(mode)}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      background: addMode === mode ? 'rgba(255,255,255,0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: 12,
                      color: addMode === mode ? '#fff' : 'var(--text-muted)',
                      fontWeight: addMode === mode ? 600 : 500,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: addMode === mode ? '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1)' : 'none'
                    }}
                  >
                    {mode === 'manual' && 'Manual'}
                    {mode === 'link' && <><LinkIcon size={16} /> Link</>}
                    {mode === 'photo' && <><Camera size={16} /> Foto</>}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {addMode === 'link' && (
                  <div>
                    <label className="section-label">Link do Produto</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={newItem.linkUrl}
                        onChange={e => setNewItem({ ...newItem, linkUrl: e.target.value })}
                        className="surface-glass"
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '16px', outline: 'none' }}
                        placeholder="Cole a URL aqui..."
                      />
                      <button className="btn-secondary" style={{ width: 56, padding: 0 }} onClick={handleSimulateScraping}>
                        {isScraping ? <Loader2 className="lucide-spin" size={20} /> : <Search size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                {addMode === 'photo' && (
                  <div style={{ height: 120, border: '2px dashed var(--glass-border)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', gap: 8 }}>
                    <Camera size={32} />
                    <span>Tirar Foto ou Enviar Imagem</span>
                  </div>
                )}

                <div>
                  <label className="section-label">Nome do Produto</label>
                  <input
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    className="surface-glass"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '16px', outline: 'none' }}
                    placeholder="O que vamos comprar?"
                  />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="section-label">Preço</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 16, top: 16, color: '#fff', fontWeight: 600 }}>R$</span>
                      <input
                        type="number"
                        value={newItem.price}
                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                        className="surface-glass"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px 16px 16px 40px', color: '#fff', fontSize: '16px', outline: 'none' }}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <label className="section-label">Categoria</label>
                    <div
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="surface-glass"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: showCategoryDropdown ? '1px solid var(--accent-glow)' : '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <span style={{ textTransform: 'capitalize' }}>{rooms.find(r => r.id === newItem.room)?.name || 'Selecione'}</span>
                      <motion.div animate={{ rotate: showCategoryDropdown ? 180 : 0 }}>
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {showCategoryDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 8,
                            background: 'rgba(30, 35, 45, 0.95)', backdropFilter: 'blur(16px)',
                            border: '1px solid var(--glass-border)', borderRadius: 16,
                            overflow: 'hidden', zIndex: 3000,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                          }}
                        >
                          {rooms.map((r, idx) => (
                            <div
                              key={r.id}
                              onClick={() => { setNewItem({ ...newItem, room: r.id }); setShowCategoryDropdown(false); }}
                              style={{
                                padding: '14px 16px', color: newItem.room === r.id ? 'var(--accent-glow)' : '#fff',
                                background: newItem.room === r.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderBottom: idx < rooms.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                cursor: 'pointer', fontSize: 16, fontWeight: newItem.room === r.id ? 600 : 400,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                              }}
                            >
                              <span style={{ textTransform: 'capitalize' }}>{r.name}</span>
                              {newItem.room === r.id && <Check size={16} />}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ marginTop: 12, height: '64px', opacity: newItem.name.trim() ? 1 : 0.5 }}
                  onClick={handleAddItem}
                >
                  {addMode === 'manual' ? 'Adicionar Manualmente' : 'Salvar Produto'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
