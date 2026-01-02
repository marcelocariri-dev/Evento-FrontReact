import React, { useState, useEffect } from 'react';

import {useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Lock, 
  Save, 
  X, 
  Edit2, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  Award,
  BarChart3,
  CreditCard
} from 'lucide-react';
import authService from '../services/auth.service';

function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
const { id } = useParams();
  // Tabs
  const [activeTab, setActiveTab] = useState('profile'); // profile, password, statistics

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    cpf: '',
    telefone: '',
    data_nascimento: '',
    cidade: '',
    estado: ''
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Success/Error Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Statistics
  const [statistics, setStatistics] = useState({
    total_eventos_criados: 0,
    total_inscricoes: 0,
    proximos_eventos: 0,
    eventos_passados: 0
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // Preencher form com dados do usuário
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
      
      });

      // TODO: Buscar estatísticas da API
      // const stats = await authService.getUserStatistics();
      // setStatistics(stats);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setErrorMessage('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const userid = user?.id;
      console.log(userid);

      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', profileForm.name);
      formData.append('email', profileForm.email);
      await authService.updateUser(userid, formData);
  
      // Simular atualização
      setTimeout(() => {
        setSuccessMessage('✅ Perfil atualizado com sucesso!');
        setSaving(false);

        // Limpar mensagem após 3 segundos
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 1000);

    } catch (err) {
      setSaving(false);
      setErrorMessage(err.message || 'Erro ao atualizar perfil');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validações
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setErrorMessage('❌ As senhas não coincidem');
      setSaving(false);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setErrorMessage('❌ A senha deve ter no mínimo 8 caracteres');
      setSaving(false);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    try {
      
    

      const userid = user?.id;
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', profileForm.name);
      formData.append('email', profileForm.email);
     formData.append('senha', passwordForm.new_password_password)
      await authService.updateUser(userid, formData);
      setTimeout(() => {
        setSuccessMessage('✅ Senha alterada com sucesso!');
        setSaving(false);

        
        // Limpar form
        setPasswordForm({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 1000);

    } catch (err) {
      setSaving(false);
      setErrorMessage(err.message || 'Erro ao alterar senha');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div onClick={() => navigate('/')} className="text-2xl font-bold text-primary cursor-pointer">
              <div className="text-3xl font-bold text-primary">
                Event<span className="text-secondary">Soft</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-primary transition">Eventos</a>
              <a href="/admin" className="text-gray-700 hover:text-primary transition">Meu Perfil</a>
              <a href="/account" className="text-primary font-semibold">Conta</a>
            </div>

            <div className="flex items-center space-x-4">
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

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    <a href="/admin" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                      <User className="mr-3" size={18} />
                      Meu Perfil
                    </a>

                    <a href="/account" className="flex items-center px-4 py-3 text-sm text-primary hover:bg-gray-50 transition font-semibold">
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
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Minha Conta
              </h1>
              <p className="text-xl text-white/90">
                Gerencie suas informações pessoais e configurações
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS/ERROR MESSAGES */}
      {successMessage && (
        <div className="container mx-auto px-4 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="text-green-600" size={24} />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="container mx-auto px-4 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* SIDEBAR */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => handleProfileSubmit}
                  className={`w-full flex items-center px-6 py-4 text-left transition ${
                    activeTab === 'profile'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="mr-3" size={20} />
                  <span className="font-medium">Dados Pessoais</span>
                </button>

                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center px-6 py-4 text-left transition ${
                    activeTab === 'password'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Lock className="mr-3" size={20} />
                  <span className="font-medium">Segurança</span>
                </button>

                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`w-full flex items-center px-6 py-4 text-left transition ${
                    activeTab === 'statistics'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="mr-3" size={20} />
                  <span className="font-medium">Estatísticas</span>
                </button>

                <div className="border-t border-gray-200">
                  <button
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita!')) {
                        // TODO: Implementar exclusão de conta
                        alert('Funcionalidade em desenvolvimento');
                      }
                    }}
                    className="w-full flex items-center px-6 py-4 text-left text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="mr-3" size={20} />
                    <span className="font-medium">Excluir Conta</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="lg:col-span-3">
              
              {/* TAB: PROFILE */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Dados Pessoais</h2>
                    <Edit2 className="text-gray-400" size={20} />
                  </div>

                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* NOME */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Completo *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                            required
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Seu nome completo"
                          />
                        </div>
                      </div>

                      {/* EMAIL */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-mail *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            required
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="seu@email.com"
                          />
                        </div>
                      </div>

                      

                      
                    
                      

                     

                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={loadUserData}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center"
                      >
                        <X className="mr-2" size={20} />
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center disabled:bg-gray-400"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="animate-spin mr-2" size={20} />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2" size={20} />
                            Salvar Alterações
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB: PASSWORD */}
              {activeTab === 'password' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Segurança</h2>
                    <Lock className="text-gray-400" size={20} />
                  </div>

                  <form onSubmit={handlePasswordSubmit}>
                    <div className="space-y-6">
                      
                      {/* SENHA ATUAL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senha Atual *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            name="current_password"
                            value={passwordForm.current_password}
                            onChange={handlePasswordChange}
                            required
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Digite sua senha atual"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      {/* NOVA SENHA */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nova Senha *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="new_password"
                            value={passwordForm.new_password}
                            onChange={handlePasswordChange}
                            required
                            minLength={8}
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Mínimo 8 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres</p>
                      </div>

                      {/* CONFIRMAR SENHA */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Nova Senha *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="new_password_confirmation"
                            value={passwordForm.new_password_confirmation}
                            onChange={handlePasswordChange}
                            required
                            minLength={8}
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Digite a senha novamente"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordForm({
                            current_password: '',
                            new_password: '',
                            new_password_confirmation: ''
                          });
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center"
                      >
                        <X className="mr-2" size={20} />
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center disabled:bg-gray-400"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="animate-spin mr-2" size={20} />
                            Alterando...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2" size={20} />
                            Alterar Senha
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB: STATISTICS */}
              {activeTab === 'statistics' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Minhas Estatísticas</h2>
                      <BarChart3 className="text-gray-400" size={20} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* EVENTOS CRIADOS */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-700 text-sm font-medium">Eventos Criados</span>
                          <Award className="text-blue-600" size={24} />
                        </div>
                        <p className="text-4xl font-bold text-blue-900">{statistics.total_eventos_criados}</p>
                        <p className="text-blue-600 text-sm mt-1">Total de eventos organizados</p>
                      </div>

                      {/* INSCRIÇÕES */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-700 text-sm font-medium">Inscrições</span>
                          <CheckCircle className="text-green-600" size={24} />
                        </div>
                        <p className="text-4xl font-bold text-green-900">{statistics.total_inscricoes}</p>
                        <p className="text-green-600 text-sm mt-1">Eventos que você participou</p>
                      </div>

                      {/* PRÓXIMOS EVENTOS */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-700 text-sm font-medium">Próximos Eventos</span>
                          <Calendar className="text-purple-600" size={24} />
                        </div>
                        <p className="text-4xl font-bold text-purple-900">{statistics.proximos_eventos}</p>
                        <p className="text-purple-600 text-sm mt-1">Eventos futuros agendados</p>
                      </div>

                      {/* EVENTOS PASSADOS */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 text-sm font-medium">Eventos Passados</span>
                          <Calendar className="text-gray-600" size={24} />
                        </div>
                        <p className="text-4xl font-bold text-gray-900">{statistics.eventos_passados}</p>
                        <p className="text-gray-600 text-sm mt-1">Eventos já realizados</p>
                      </div>

                    </div>
                  </div>

                  {/* ATIVIDADE RECENTE */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Atividade Recente</h3>
                    <div className="text-center py-12 text-gray-500">
                      <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma atividade recente</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Account;
