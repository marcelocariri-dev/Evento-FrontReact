// src/pages/CreateEvent.jsx - COM DEBUG

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Users, Image as ImageIcon, Save, ArrowLeft, Loader2 } from 'lucide-react';
import eventoService from '../services/evento.service';
import locaisService from '../services/locais.service';
import authService from '../services/auth.service';

function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingLocais, setLoadingLocais] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locais, setLocais] = useState([]);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    hora_inicio: '',
    hora_fim: '',
    status: 'rascunho',
    capacidade_maxima: '',
    valor_padrao: '',
    local_id: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Modal de criar local
  const [showModalLocal, setShowModalLocal] = useState(false);
  const [savingLocal, setSavingLocal] = useState(false);
  const [localFormData, setLocalFormData] = useState({
    nome: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    capacidade: '',
  });

  // Carregar locais ao montar a página
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      sessionStorage.setItem('redirectAfterLogin', '/criar-evento');
      navigate('/login');
      return;
    }

    const carregarLocais = async () => {
      try {
        setLoadingLocais(true);
        console.log('Carregando locais...');
        
        const response = await locaisService.getLocal();
        console.log('Resposta da API:', response);
        
        // Tentar diferentes formatos de resposta
        const locaisData = response.data || response || [];
        console.log('Locais extraídos:', locaisData);
        
        setLocais(Array.isArray(locaisData) ? locaisData : []);
      } catch (err) {
        console.error('Erro ao carregar locais:', err);
        setError(`Não foi possível carregar os locais: ${err.message}`);
      } finally {
        setLoadingLocais(false);
      }
    };

    carregarLocais();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateLocal = async () => {
    console.log('🎯 handleCreateLocal CHAMADO!');
    console.log('📋 Dados do formulário:', localFormData);
    
    // Validação simples
    if (!localFormData.nome || !localFormData.endereco || !localFormData.numero || 
        !localFormData.bairro || !localFormData.cidade || !localFormData.estado || 
        !localFormData.cep || !localFormData.capacidade) {
      alert('⚠️ Por favor, preencha todos os campos!');
      return;
    }
    
    try {
      setSavingLocal(true);
      console.log('📤 Criando local:', localFormData);
      
      const response = await locaisService.createLocal(localFormData);
      console.log('✅ Local criado - Response completa:', response);
      
      const novoLocal = response?.data || response;
      console.log('✅ Novo local extraído:', novoLocal);
      
      // Adicionar novo local à lista
      setLocais(prev => {
        const novosLocais = [...prev, novoLocal];
        console.log('📋 Lista atualizada de locais:', novosLocais);
        return novosLocais;
      });
      
      // Selecionar automaticamente o novo local
      setFormData(prev => {
        const novoForm = { ...prev, local_id: novoLocal.id };
        console.log('✅ FormData atualizado com local_id:', novoForm.local_id);
        return novoForm;
      });
      
      // Limpar form e fechar modal
      setLocalFormData({
        nome: '',
        endereco: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        capacidade: '',
      });
      
      console.log('✅ Modal fechando...');
      setShowModalLocal(false);
      
      alert('✅ Local criado com sucesso!');
      
    } catch (err) {
      console.error('❌ Erro ao criar local:', err);
      console.error('❌ Stack:', err.stack);
      alert(err.message || 'Erro ao criar local');
    } finally {
      setSavingLocal(false);
      console.log('🔄 savingLocal = false');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.local_id) {
      setError('Por favor, selecione um local.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // 1. Criar FormData com todos os campos + imagem
      const eventoFormData = new FormData();
      
      // Campos obrigatórios
      eventoFormData.append('titulo', formData.titulo);
      eventoFormData.append('descricao', formData.descricao);
      eventoFormData.append('status', formData.status);
      eventoFormData.append('local_id', formData.local_id);
      
      // Datas (se preenchidas)
      if (formData.data_inicio && formData.hora_inicio) {
        eventoFormData.append('data_inicio', `${formData.data_inicio} ${formData.hora_inicio}`);
      }
      if (formData.data_fim && formData.hora_fim) {
        eventoFormData.append('data_fim', `${formData.data_fim} ${formData.hora_fim}`);
      }
      
      // Números (se preenchidos)
      if (formData.capacidade_maxima) {
        eventoFormData.append('capacidade_maxima', formData.capacidade_maxima);
      }
      if (formData.valor_padrao) {
        eventoFormData.append('valor_padrao', formData.valor_padrao);
      }
      
      // ✅ IMAGEM (se houver)
      if (imageFile) {
        eventoFormData.append('imagem', imageFile);
        console.log('📤 1. Criando evento COM imagem:', imageFile.name, imageFile.type, imageFile.size);
      } else {
        console.log('📤 1. Criando evento SEM imagem');
      }

      // POST com FormData (multipart/form-data)
      const eventoResponse = await eventoService.createEventoComImagem(eventoFormData);
      console.log('✅ 1. Evento criado:', eventoResponse);

      // Extrair ID do evento
      const eventoId = eventoResponse?.data?.id || eventoResponse?.id;
      
      if (!eventoId) {
        console.error('❌ Erro: ID do evento não encontrado na resposta:', eventoResponse);
        throw new Error('ID do evento não retornado pelo servidor');
      }

      console.log('✅ ID do evento:', eventoId);

      // 2. Criar ingresso automaticamente
      const ingressoData = {
        evento_id: eventoId,
        tipo_ingresso: 'Comum',
        valor: formData.valor_padrao ? parseFloat(formData.valor_padrao) : 0,
        quantidade_disponivel: formData.capacidade_maxima ? parseInt(formData.capacidade_maxima) : 100,
        descricao: formData.titulo,
        ativo: true
      };

      console.log('📤 2. Criando ingresso:', ingressoData);
      
      try {
        const ingressoResponse = await eventoService.createIngresso(ingressoData);
        console.log('✅ 2. Ingresso criado:', ingressoResponse);
      } catch (ingressoError) {
        console.error('⚠️ Erro ao criar ingresso (evento já foi criado):', ingressoError);
        // Continua mesmo se o ingresso falhar
      }

      setSuccess('✅ Evento criado com sucesso! Redirecionando...');

      // 3. Redirecionar
      setTimeout(() => {
        console.log('🔄 Redirecionando para /evento/' + eventoId);
        navigate(`/evento/${eventoId}`);
      }, 2000);

    } catch (err) {
      console.error('❌ Erro geral:', err);
      console.error('Detalhes do erro:', err.response?.data);
      setError(err.message || 'Erro ao criar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition mb-4"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Criar novo evento</h1>
          <p className="text-gray-600 mt-2">Preencha as informações abaixo</p>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Debug:</strong> {locais.length} locais carregados
            </p>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Imagem do Evento */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagem do evento (opcional)</h3>
            <div className="flex items-center space-x-6">
              <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={48} className="text-gray-400" />
                )}
              </div>
              <div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG até 10MB</p>
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações básicas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título do evento *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                  placeholder="Ex: Conferência de Tecnologia 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none resize-none"
                  placeholder="Descreva o evento, programação, público-alvo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="publicado">Publicado</option>
                  <option value="privado">Privado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data e Hora */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data e hora</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de início *</label>
                <input
                  type="date"
                  name="data_inicio"
                  value={formData.data_inicio}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora de início *</label>
                <input
                  type="time"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de término</label>
                <input
                  type="date"
                  name="data_fim"
                  value={formData.data_fim}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora de término</label>
                <input
                  type="time"
                  name="hora_fim"
                  value={formData.hora_fim}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Local */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Local do evento *</h3>
              <button
                type="button"
                onClick={() => setShowModalLocal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium flex items-center space-x-2"
              >
                <MapPin size={16} />
                <span>Novo Local</span>
              </button>
            </div>
            
            {loadingLocais ? (
              <p className="text-gray-500 flex items-center">
                <Loader2 className="animate-spin mr-2" size={18} />
                Carregando locais...
              </p>
            ) : locais.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  Nenhum local cadastrado ainda. 
                  <button 
                    type="button"
                    onClick={() => setShowModalLocal(true)}
                    className="underline ml-1 hover:text-yellow-900"
                  >
                    Cadastre um local agora
                  </button>
                </p>
              </div>
            ) : (
              <select
                name="local_id"
                value={formData.local_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
              >
                <option value="">Selecione um local</option>
                {locais.map((local) => (
                  <option key={local.id} value={local.id}>
                    {local.nome} - {local.cidade}/{local.estado} ({local.capacidade} pessoas)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* MODAL CRIAR LOCAL */}
          {showModalLocal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              {console.log('🔵 Modal RENDERIZADO - showModalLocal:', showModalLocal)}
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">Cadastrar Novo Local</h2>
                  <p className="text-gray-600 mt-1">Preencha as informações do local</p>
                </div>

                <form className="p-6 space-y-4">
                  {console.log('🟢 Form RENDERIZADO')}
                  {/* Nome do Local */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Local *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={localFormData.nome}
                      onChange={handleLocalChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Ex: Centro de Convenções"
                    />
                  </div>

                  {/* Endereço */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço *
                      </label>
                      <input
                        type="text"
                        name="endereco"
                        value={localFormData.endereco}
                        onChange={handleLocalChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Rua, Avenida..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número *
                      </label>
                      <input
                        type="text"
                        name="numero"
                        value={localFormData.numero}
                        onChange={handleLocalChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  {/* Bairro e Cidade */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bairro *
                      </label>
                      <input
                        type="text"
                        name="bairro"
                        value={localFormData.bairro}
                        onChange={handleLocalChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="Centro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        name="cidade"
                        value={localFormData.cidade}
                        onChange={handleLocalChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="João Pessoa"
                      />
                    </div>
                  </div>

                  {/* Estado, CEP e Capacidade */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                      </label>
                      <select
                        name="estado"
                        value={localFormData.estado}
                        onChange={handleLocalChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      >
                        <option value="">UF</option>
                        <option value="AC">AC</option>
                        <option value="AL">AL</option>
                        <option value="AP">AP</option>
                        <option value="AM">AM</option>
                        <option value="BA">BA</option>
                        <option value="CE">CE</option>
                        <option value="DF">DF</option>
                        <option value="ES">ES</option>
                        <option value="GO">GO</option>
                        <option value="MA">MA</option>
                        <option value="MT">MT</option>
                        <option value="MS">MS</option>
                        <option value="MG">MG</option>
                        <option value="PA">PA</option>
                        <option value="PB">PB</option>
                        <option value="PR">PR</option>
                        <option value="PE">PE</option>
                        <option value="PI">PI</option>
                        <option value="RJ">RJ</option>
                        <option value="RN">RN</option>
                        <option value="RS">RS</option>
                        <option value="RO">RO</option>
                        <option value="RR">RR</option>
                        <option value="SC">SC</option>
                        <option value="SP">SP</option>
                        <option value="SE">SE</option>
                        <option value="TO">TO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP *
                      </label>
                      <input
                        type="text"
                        name="cep"
                        value={localFormData.cep}
                        onChange={handleLocalChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="58000-000"
                        maxLength="9"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidade *
                      </label>
                      <input
                        type="number"
                        name="capacidade"
                        value={localFormData.capacidade}
                        onChange={handleLocalChange}
                        required
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="500"
                      />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCreateLocal}
                      disabled={savingLocal}
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:bg-gray-400"
                    >
                      {savingLocal ? (
                        <>
                          <Loader2 className="animate-spin inline mr-2" size={18} />
                          Salvando...
                        </>
                      ) : (
                        'Cadastrar Local'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModalLocal(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Capacidade e Valor */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacidade e valor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacidade máxima</label>
                <input
                  type="number"
                  name="capacidade_maxima"
                  value={formData.capacidade_maxima}
                  onChange={handleChange}
                  placeholder="Ex: 500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor padrão (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="valor_padrao"
                  value={formData.valor_padrao}
                  onChange={handleChange}
                  placeholder="Ex: 150.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingLocais || locais.length === 0}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Criar evento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;