import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, LogOut, Plus, Edit, Loader2, User, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';
import eventoService from '../services/evento.service';
import authService from '../services/auth.service';

function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [eventosInscritos, setEventosInscritos] = useState([]);
  const [eventosProximos, setEventosProximos] = useState([]);
  const [loadingInscritos, setLoadingInscritos] = useState(true);
  const [loadingProximos, setLoadingProximos] = useState(true);
  const [error, setError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Estados do modal de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const hasLoaded = useRef(false);
  
 

  useEffect(() => {
    // ✅ Guard clause
    if (hasLoaded.current) {
      console.log('⏭️ Admin já carregado, pulando...');
      return;
    }

    console.log('🔄 Admin carregando pela primeira vez...');

    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    loadEventosInscritos();
    loadEventosProximos();

    // ✅ Marcar como carregado
    hasLoaded.current = true;
  }, [navigate]);

  const loadEventosInscritos = async () => {
    try {
      setLoadingInscritos(true);
      console.log('📥 Carregando inscrições...');
      const data = await eventoService.getMinhasInscricoes();
      const inscricoes = data.data || data || [];
      setEventosInscritos(Array.isArray(inscricoes) ? inscricoes : []);
      console.log('✅ Inscrições:', inscricoes.length);
    } catch (err) {
      console.error('❌ Erro:', err);
    } finally {
      setLoadingInscritos(false);
    }
  };

  const loadEventosProximos = async () => {
    try {
      setLoadingProximos(true);
      console.log('📥 Carregando meus eventos...');
      const data = await eventoService.getMeusEventos();
      const eventos = data.data || data || [];
      setEventosProximos(Array.isArray(eventos) ? eventos : []);
      console.log('✅ Meus eventos:', eventos.length);
    } catch (err) {
      console.error('❌ Erro:', err);
    } finally {
      setLoadingProximos(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const handleEventoClick = (eventoId) => {
    navigate(`/evento/${eventoId}`);
  };

  const handleEditEvento = (eventoId, e) => {
    e.stopPropagation();
    navigate(`/editar-evento/${eventoId}`);
  };

  const handleDeleteClick = (evento, e) => {
    e.stopPropagation();
    setEventoToDelete(evento);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventoToDelete) return;

    try {
      setDeleting(true);
      console.log('🗑️ Excluindo evento:', eventoToDelete.id);
      
      await eventoService.deleteEvento(eventoToDelete.id);
      
      console.log('✅ Evento excluído com sucesso');
      
      // Remover da lista
      setEventosProximos(prev => prev.filter(e => e.id !== eventoToDelete.id));
      
      // Fechar modal
      setShowDeleteModal(false);
      setEventoToDelete(null);
      
    } catch (err) {
      console.error('❌ Erro ao excluir:', err);
      alert(err.message || 'Erro ao excluir evento');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEventoToDelete(null);
  };

  const getImageUrl = (imagemUrl) => {
  
    if (imagemUrl.startsWith('/storage')) return imagemUrl;
    if (imagemUrl.startsWith('http')) return imagemUrl;
    return `/storage/${imagemUrl}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR FIXED */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* LOGO */}
            <div onClick={() => navigate('/')} className="text-2xl font-bold text-primary cursor-pointer">
              <div className="text-3xl font-bold text-primary">
                Event<span className="text-secondary">Soft</span>
              </div>
            </div>

            {/* LINKS CENTRAIS */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-primary transition">Eventos</a>
              <a href="/admin" className="text-primary font-semibold">Meu Perfil</a>
            </div>

            {/* BOTÕES DIREITA */}
            <div className="flex items-center space-x-4">
              <a href="/criar-evento" className="hidden md:block px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition">
                Criar Evento
              </a>
              
              {/* ÍCONE DE PERFIL */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-purple rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown size={18} className="text-gray-600" />
                </button>

                {/* DROPDOWN MENU */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    <a
                      href="/admin"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="mr-3" size={18} />
                      Meu Perfil
                    </a>

                      
                    <a
                      href="/minhaconta"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="mr-3" size={18} />
                      Minha Conta
                    </a>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="mr-3" size={18} />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary to-accent-purple text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Olá, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-xl text-white/90">
              Gerencie seus eventos e acompanhe suas inscrições
            </p>
          </div>
        </div>
      </section>

      {/* MEUS EVENTOS CRIADOS */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Meus eventos criados</h3>
            <span className="text-gray-600">{eventosProximos.length} evento(s)</span>
          </div>

          {loadingProximos ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin h-12 w-12 text-primary" />
            </div>
          ) : eventosProximos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {eventosProximos.map((evento) => (
                <div key={evento.id} onClick={() => handleEventoClick(evento.id)} className="group cursor-pointer">
                  <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition">
                    <div className="relative">
                      <img
                        src={getImageUrl(evento.imagem_url)}
                        alt={evento.titulo}
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                         
                        }}
                      />

                      {/* BOTÕES DE AÇÃO */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditEvento(evento.id, e)}
                          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition flex items-center space-x-1"
                          title="Editar evento"
                        >
                          <Edit size={16} className="text-primary" />
                          <span className="text-xs font-medium text-gray-900">Editar</span>
                        </button>
                        
                        <button
                          onClick={(e) => handleDeleteClick(evento, e)}
                          className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition flex items-center space-x-1"
                          title="Excluir evento"
                        >
                          <Trash2 size={16} className="text-red-600" />
                          <span className="text-xs font-medium text-red-600">Excluir</span>
                        </button>
                      </div>

                      {evento.status === 'publicado' && (
                        <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Publicado
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition line-clamp-2">
                        {evento.titulo}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2 text-primary" />
                          <span>{formatDate(evento.data_inicio)}</span>
                        </div>
                        
                        {evento.local && (
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-2 text-primary" />
                            <span className="line-clamp-1">{evento.local.cidade}, {evento.local.estado}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h4 className="text-xl font-semibold text-gray-600 mb-2">Nenhum evento criado ainda</h4>
              <p className="text-gray-500 mb-6">Crie seu primeiro evento e compartilhe!</p>
              <a href="/criar-evento" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                Criar evento
              </a>
            </div>
          )}
        </div>
      </section>

      {/* MINHAS INSCRIÇÕES */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Minhas inscrições</h3>
            <span className="text-gray-600">{eventosInscritos.length} evento(s)</span>
          </div>

          {loadingInscritos ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin h-12 w-12 text-primary" />
            </div>
          ) : eventosInscritos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {eventosInscritos.map((inscricao) => {
                const evento = inscricao.evento || inscricao;
                return (
                  <div key={evento.id} onClick={() => handleEventoClick(evento.id)} className="group cursor-pointer">
                    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition">
                      <div className="relative">
                        <img
                          src={getImageUrl(evento.imagem_url)}
                          alt={evento.titulo}
                          className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/eventos.png';
                          }}
                        />
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition line-clamp-2">
                          {evento.titulo}
                        </h3>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2 text-primary" />
                            <span>{formatDate(evento.data_inicio)}</span>
                          </div>
                          
                          {evento.local && (
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-2 text-primary" />
                              <span className="line-clamp-1">{evento.local.cidade}, {evento.local.estado}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
              <h4 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma inscrição ainda</h4>
              <p className="text-gray-500 mb-6">Você ainda não está inscrito em nenhum evento.</p>
              <a href="/" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                Buscar eventos
              </a>
            </div>
          )}
        </div>
      </section>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Excluir Evento?
            </h3>

            <p className="text-gray-600 text-center mb-2">
              Tem certeza que deseja excluir o evento:
            </p>
            <p className="text-gray-900 font-semibold text-center mb-6">
              "{eventoToDelete?.titulo}"
            </p>
            <p className="text-sm text-red-600 text-center mb-6">
              ⚠️ Esta ação não pode ser desfeita!
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:bg-red-400 flex items-center justify-center"
              >
                {deleting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2" size={18} />
                    Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;