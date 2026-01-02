// src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut } from 'lucide-react';
import authService from '../services/auth.service';

const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setShowProfileMenu(false);
    window.location.href = '/';
  };

  return (
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
                       
                      <a
                        href="/minhaconta"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <User size={18} className="mr-3 text-primary" />
                        <span>Minha Conta</span>
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
  );
};

export default Header;