import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2, Save } from 'lucide-react';
import eventoService from '../services/evento.service';
import locaisService from '../services/locais.service';
import authService from '../services/auth.service';

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    hora_inicio: '',
    data_fim: '',
    hora_fim: '',
    status: 'publicado',
    capacidade_maxima: '',
    valor_padrao: '',
    local_id: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocais, setLoadingLocais] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadEvento();
    loadLocais();
  }, [id, navigate]);

  const loadEvento = async () => {
    try {
      setLoading(true);
      console.log('📤 Carregando evento ID:', id);
      
      const response = await eventoService.getEventoById(id);
      const evento = response?.data || response;
      
      console.log('✅ Evento carregado:', evento);

      // Extrair data e hora
      const dataInicio = evento.data_inicio ? new Date(evento.data_inicio) : null;
      const dataFim = evento.data_fim ? new Date(evento.data_fim) : null;

      setFormData({
        titulo: evento.titulo || '',
        descricao: evento.descricao || '',
        data_inicio: dataInicio ? dataInicio.toISOString().split('T')[0] : '',
        hora_inicio: dataInicio ? dataInicio.toTimeString().slice(0, 5) : '',
        data_fim: dataFim ? dataFim.toISOString().split('T')[0] : '',
        hora_fim: dataFim ? dataFim.toTimeString().slice(0, 5) : '',
        status: evento.status || 'publicado',
        capacidade_maxima: evento.capacidade_maxima || '',
        valor_padrao: evento.valor_padrao || '',
        local_id: evento.local_id || '',
      });

      if (evento.imagem) {
        const imageUrl = evento.imagem.startsWith('http') 
          ? evento.imagem 
          : evento.imagem.startsWith('/storage') 
            ? evento.imagem 
            : `/storage/${evento.imagem}`;
        setCurrentImage(imageUrl);
        setImagePreview(imageUrl);
      }

    } catch (err) {
      console.error('❌ Erro ao carregar evento:', err);
      setError('Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  };

  const loadLocais = async () => {
    try {
      setLoadingLocais(true);
      const response = await locaisService.getLocal();
      const locaisData = response?.data || response || [];
      setLocais(Array.isArray(locaisData) ? locaisData : []);
    } catch (err) {
      console.error('Erro ao carregar locais:', err);
    } finally {
      setLoadingLocais(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(currentImage || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.local_id) {
      setError('Por favor, selecione um local.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      console.log('📋 FormData STATE:', formData);

      // Preparar FormData
      const eventoFormData = new FormData();
      
      // ✅ IMPORTANTE: Laravel precisa do _method para PUT com FormData
      eventoFormData.append('_method', 'PUT');
      
      eventoFormData.append('titulo', formData.titulo);
      eventoFormData.append('descricao', formData.descricao);
      eventoFormData.append('status', formData.status);
      eventoFormData.append('local_id', formData.local_id);
      
      if (formData.data_inicio && formData.hora_inicio) {
        eventoFormData.append('data_inicio', `${formData.data_inicio} ${formData.hora_inicio}`);
      }
      if (formData.data_fim && formData.hora_fim) {
        eventoFormData.append('data_fim', `${formData.data_fim} ${formData.hora_fim}`);
      }
      if (formData.capacidade_maxima) {
        eventoFormData.append('capacidade_maxima', formData.capacidade_maxima);
      }
      if (formData.valor_padrao) {
        eventoFormData.append('valor_padrao', formData.valor_padrao);
      }
      
      // Nova imagem (se houver)
      if (imageFile) {
        eventoFormData.append('imagem', imageFile);
        console.log('📤 Atualizando COM nova imagem:', imageFile.name, imageFile.size);
      } else {
        console.log('📤 Atualizando SEM nova imagem');
      }

      // ✅ DEBUG: Ver conteúdo do FormData
      console.log('📋 Conteúdo do FormData:');
      for (let pair of eventoFormData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: [FILE] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }

      // POST com _method=PUT (em vez de PUT direto)
      console.log('📤 POST /eventos/' + id + ' (com _method=PUT)');
      const response = await eventoService.updateEventoComFormData(id, eventoFormData);
      console.log('✅ Evento atualizado:', response);

      setSuccess('✅ Evento atualizado com sucesso! Redirecionando...');

      setTimeout(() => {
        navigate(`/evento/${id}`);
      }, 2000);

    } catch (err) {
      console.error('❌ Erro ao atualizar:', err);
      console.error('❌ Response:', err.response?.data);
      console.error('❌ Status:', err.response?.status);
      setError(err.message || 'Erro ao atualizar evento.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-20">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary transition mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Evento</h1>
          <p className="text-gray-600 mt-2">Atualize as informações do seu evento</p>
        </div>

        {/* Messages */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Imagem */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem do Evento
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clique para fazer upload</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG ou GIF</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Título */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Evento *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: Festival de Música 2025"
            />
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Descreva seu evento..."
            />
          </div>

          {/* Data/Hora Início */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário de Início *
              </label>
              <input
                type="time"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Data/Hora Fim */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Término
              </label>
              <input
                type="date"
                name="data_fim"
                value={formData.data_fim}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário de Término
              </label>
              <input
                type="time"
                name="hora_fim"
                value={formData.hora_fim}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Local */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local *
            </label>
            {loadingLocais ? (
              <p className="text-gray-500">Carregando locais...</p>
            ) : (
              <select
                name="local_id"
                value={formData.local_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione um local</option>
                {locais.map(local => (
                  <option key={local.id} value={local.id}>
                    {local.nome} - {local.cidade}/{local.estado}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Capacidade e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacidade Máxima
              </label>
              <input
                type="number"
                name="capacidade_maxima"
                value={formData.capacidade_maxima}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Padrão (R$)
              </label>
              <input
                type="number"
                name="valor_padrao"
                value={formData.valor_padrao}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="50.00"
              />
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="publicado">Publicado</option>
              <option value="privado">Privado</option>
              <option value="rascunho">Rascunho</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:bg-gray-400 flex items-center justify-center"
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
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventEdit;