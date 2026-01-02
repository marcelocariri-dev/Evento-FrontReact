import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, LogOut, Plus, Edit, Loader2, User, ChevronDown } from 'lucide-react';
import eventoService from '../services/evento.service';
import authService from '../services/auth.service';

function Admincopy() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [eventosInscritos, setEventosInscritos] = useState([]);
  const [eventosProximos, setEventosProximos] = useState([]);
  const [loadingInscritos, setLoadingInscritos] = useState(true);
  const [loadingProximos, setLoadingProximos] = useState(true);
  const [error, setError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    loadEventosInscritos();
    loadEventosProximos();
  }, [navigate]);

  const loadEventosInscritos = async () => {
    try {
      setLoadingInscritos(true);
      const data = await eventoService.getMinhasInscricoes();
      const inscricoes = data.data || data || [];
      setEventosInscritos(Array.isArray(inscricoes) ? inscricoes : []);
      console.log('✅ Inscrições carregadas:', inscricoes);
    } catch (err) {
      console.error('Erro ao carregar inscrições:', err);
      setError('Erro ao carregar seus eventos');
    } finally {
      setLoadingInscritos(false);
    }
  };

  const loadEventosProximos = async () => {
    try {
      setLoadingProximos(true);
      const data = await eventoService.getMeusEventos();
      const eventos = data.data || data || [];
      setEventosProximos(Array.isArray(eventos) ? eventos : []);
      console.log('✅ Meus eventos carregados:', eventos);
    } catch (err) {
      console.error('Erro ao carregar eventos criados:', err);
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

  const getImageUrl = (imagemUrl) => {
    if (!imagemUrl) return 'eventos.png';
    if (imagemUrl.startsWith('/storage')) return imagemUrl;
    if (imagemUrl.startsWith('http')) return imagemUrl;
    return `/storage/${imagemUrl}`;;
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
      {/* NAVBAR */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div onClick={() => navigate('/')} className="text-2xl font-bold text-primary cursor-pointer">
              EventGo
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-primary transition">Eventos</a>
              <a href="/admin" className="text-primary font-semibold">Meu Perfil</a>
            </nav>

            <div className="flex items-center space-x-4">
              <a href="/criar-evento" className="hidden md:flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                <Plus size={18} className="mr-2" />
                Criar evento
              </a>
              
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-purple rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <ChevronDown size={18} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <a href="/minha-conta" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50">
                      <User size={18} className="mr-3 text-primary" />
                      Editar perfil
                    </a>
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={18} className="mr-3" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO/PERFIL */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-accent-purple text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
                <p className="text-white/80">{user.email}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <a href="/criar-evento" className="px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition font-medium">
                Criar Evento
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ERRO */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

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
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          if (!e.target.dataset.errorHandled) {
                            e.target.dataset.errorHandled = 'true';
                            e.target.src = '/eventos.png';
                          }
                        }}
                      />
                      
                      <button
                        onClick={(e) => handleEditEvento(evento.id, e)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition flex items-center space-x-1"
                      >
                        <Edit size={16} className="text-primary" />
                        <span className="text-xs font-medium text-gray-900">Editar</span>
                      </button>

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
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            if (!e.target.dataset.errorHandled) {
                              e.target.dataset.errorHandled = 'true';
                              e.target.src = '/eventos.png';
                            }
                          }}
                        />
                        {inscricao.status && (
                          <span className={`absolute top-3 right-3 text-white text-xs px-2 py-1 rounded-full ${
                            inscricao.status === 'confirmado' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}>
                            {inscricao.status_formatado || inscricao.status}
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

                          {inscricao.ingresso && (
                            <div className="flex items-center text-primary mt-3">
                              <Ticket size={14} className="mr-2" />
                              <span className="font-medium">{inscricao.ingresso.tipo_ingresso}</span>
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
    </div>
  );
}

export default Admincopy;