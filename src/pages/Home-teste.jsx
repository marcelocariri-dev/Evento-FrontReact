import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, Calendar, MapPin, Loader2, User, LogOut } from 'lucide-react';
import eventoService from '../services/evento.service';
import authService from '../services/auth.service';

const Hometeste = () => {
  const navigate = useNavigate();
  
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const categorias = [
    'Show', 'Festival', 'Teatro', 'Esporte', 'Workshop',
    'Conferência', 'Festa', 'Exposição', 'Outros'
  ];

  useEffect(() => {
    loadEventos();
    checkAuth();
  }, []);

  const checkAuth = () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      console.log('✅ Usuário autenticado:', currentUser);
    } else {
      console.log('❌ Usuário NÃO autenticado');
    }
  };

  const loadEventos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await eventoService.getEventos();
      const eventosData = response.data || response || [];
      setEventos(Array.isArray(eventosData) ? eventosData : []);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError('Erro ao carregar eventos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (searchTerm.trim()) params.titulo = searchTerm.trim();
      if (selectedEstado) params.estado = selectedEstado;
      if (selectedCategoria) params.categoria = selectedCategoria;
      
      console.log('🔍 Buscando:', params);
      
      const response = await eventoService.getEventos(params);
      const eventosData = response.data || response || [];
      setEventos(Array.isArray(eventosData) ? eventosData : []);
    } catch (err) {
      console.error('Erro ao buscar:', err);
      setError('Erro ao buscar eventos.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setShowProfileMenu(false);
    window.location.href = '/';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const handleEventoClick = (eventoId) => {
    navigate(`/evento/${eventoId}`);
  };

  const getImageUrl = (imagemUrl) => {
    if (!imagemUrl) return 'public/eventos.png';
    if (imagemUrl.startsWith('/storage')) return imagemUrl;
    if (imagemUrl.startsWith('http')) return imagemUrl;
    return `/storage/${imagemUrl}`;;
  };

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
              <a href="#" className="text-gray-700 hover:text-primary transition">Sobre</a>
            </div>

            {/* BOTÕES DIREITA */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* BOTÃO CRIAR EVENTO */}
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
                          <User size={18} className="mr-3 text-primary" />
                          <span>Meu Perfil</span>
                        </a>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut size={18} className="mr-3" />
                          <span>Sair</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <a href="/login" className="px-4 py-2 text-gray-700 hover:text-primary transition font-medium">
                    Entrar
                  </a>
                  <a href="/conta" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium">
                    Cadastrar
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-accent-purple text-white py-20 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Ouse ir além e viva o novo</h1>
            <p className="text-xl mb-8">Descubra os melhores eventos da sua região</p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar eventos por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <button type="submit" className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100">
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <select value={selectedEstado} onChange={(e) => setSelectedEstado(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-lg appearance-none">
                <option value="">Todos os estados</option>
                {estados.map(estado => <option key={estado} value={estado}>{estado}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>

            <div className="flex-1 relative">
              <select value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-lg appearance-none">
                <option value="">Todas as categorias</option>
                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>

            <button onClick={handleSearch} className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium">
              Filtrar
            </button>
          </div>
        </div>
      </section>

      {/* EVENTOS */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{searchTerm ? `Resultados para "${searchTerm}"` : 'Próximos eventos'}</h2>
          <p className="text-gray-600">{eventos.length} evento(s) encontrado(s)</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
          </div>
        ) : eventos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {eventos.map(evento => (
              <div key={evento.id} onClick={() => handleEventoClick(evento.id)} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer">
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={getImageUrl(evento.imagem_url)}
                    alt={evento.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      if (!e.target.dataset.errorHandled) {
                        e.target.dataset.errorHandled = 'true';
                        e.target.src = '/eventos.png';
                      }
                    }}
                  />
                  {evento.status === 'publicado' && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">Disponível</div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold group-hover:text-primary transition mb-2 line-clamp-2">{evento.titulo}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      <span>{formatDate(evento.data_inicio)}</span>
                    </div>
                    {evento.local && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        <span className="line-clamp-1">{evento.local.cidade}, {evento.local.estado}</span>
                      </div>
                    )}
                  </div>

                  {evento.valor_padrao && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">A partir de</span>
                        <span className="text-primary font-bold text-lg">R$ {parseFloat(evento.valor_padrao).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Filter size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-600 mb-6">{searchTerm ? `Não encontramos eventos com "${searchTerm}"` : 'Tente ajustar os filtros'}</p>
            <button onClick={() => { setSearchTerm(''); setSelectedEstado(''); setSelectedCategoria(''); loadEventos(); }} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark">
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-accent-purple text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Gerencie seus eventos sem sair do celular</h2>
          <p className="text-xl mb-8">Transforme a sua gestão de eventos</p>
          <a href={isAuthenticated ? "/criar-evento" : "/conta"} className="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 text-lg">
            {isAuthenticated ? "Criar meu evento" : "Começar agora"}
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">EventGo</h3>
              <p className="text-gray-400">Plataforma completa para gestão de eventos</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Eventos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">Buscar</a></li>
                <li><a href="/criar-evento" className="hover:text-white">Criar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Termos</a></li>
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EventGo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hometeste;