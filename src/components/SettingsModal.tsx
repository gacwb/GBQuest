import React, { useState, useEffect, useRef } from 'react';
import {
  getAppConfig,
  saveAppConfig,
  testSupabaseConnection,
  sincronizarDadosParaSupabase,
  substituirNuvemComDadosLocais,
  sincronizacaoBidirecionalIncremental,
  gerarBackupLocalCompleto,
  restaurarBackupLocalJson,
  migrarDadosLegadosParaAdm,
  syncConfigFromServer,
} from '../services/supabaseClient';
import { testGeminiApiKey } from '../services/geminiService';
import { SUPABASE_SQL_SCRIPT } from '../services/supabaseSql';
import { AppConfig } from '../types';
import { isAdmin, getCurrentUser, ADMIN_CONFIG } from '../services/authService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const [activeTab, setActiveTab] = useState<'chaves' | 'sql' | 'migracao'>('chaves');
  const [config, setConfig] = useState<AppConfig>({
    supabaseUrl: '',
    supabaseAnonKey: '',
    geminiApiKey: '',
  });

  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    tables?: {
      bancas: boolean;
      blocos: boolean;
      materias: boolean;
      questoes: boolean;
      sessoes: boolean;
      historico: boolean;
      usuarios: boolean;
    };
  }>({ loading: false });

  const [geminiTestStatus, setGeminiTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [replaceStatus, setReplaceStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [backupStatus, setBackupStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [migrationStatus, setMigrationStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [copied, setCopied] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin(currentUser);

  useEffect(() => {
    if (isOpen) {
      const current = getAppConfig();
      setConfig(current);
      setTestStatus({ loading: false });
      setGeminiTestStatus({ loading: false });
      setSyncStatus({ loading: false });
      setMigrationStatus({ loading: false });
      setSaveFeedback(false);

      // Busca a configuração mais recente compartilhada no servidor
      syncConfigFromServer().then((srv) => {
        if (srv.supabaseUrl) {
          setConfig((prev) => ({
            ...prev,
            supabaseUrl: prev.supabaseUrl || srv.supabaseUrl,
            supabaseAnonKey: prev.supabaseAnonKey || srv.supabaseAnonKey,
          }));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Security gate: only Administrator can view Cloud Settings
  if (!userIsAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="bg-[#131b2e] border border-red-800 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-950 border border-red-700 flex items-center justify-center text-red-400 text-xl">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h2 className="text-base font-bold text-white">Acesso Restrito ao Administrador</h2>
          <p className="text-xs text-gray-300 leading-relaxed">
            A tela de configurações da nuvem e chaves de IA é restrita ao perfil de Administrador (<b>{ADMIN_CONFIG.EMAIL}</b>).
          </p>
          <button onClick={onClose} className="btn-secondary w-full text-xs py-2">
            Voltar ao MIRAQuest
          </button>
        </div>
      </div>
    );
  }

  const handleTestGemini = async () => {
    saveAppConfig(config);
    setGeminiTestStatus({ loading: true });
    const res = await testGeminiApiKey(config.geminiApiKey);
    setGeminiTestStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  const handleSave = () => {
    saveAppConfig(config);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
    onConfigSaved();
  };

  const handleTestSupabase = async () => {
    saveAppConfig(config);
    setTestStatus({ loading: true });
    const result = await testSupabaseConnection();
    setTestStatus({
      loading: false,
      success: result.success,
      message: result.message,
      tables: result.tables,
    });
  };

  const handleSyncToSupabase = async () => {
    saveAppConfig(config);
    setSyncStatus({ loading: true });
    const result = await sincronizarDadosParaSupabase();
    setSyncStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
    if (result.success) {
      onConfigSaved();
    }
  };

  const handleSincronizacaoBidirecional = async () => {
    saveAppConfig(config);
    setReplaceStatus({ loading: true });
    const result = await sincronizacaoBidirecionalIncremental();
    setReplaceStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
    if (result.success) {
      onConfigSaved();
    }
  };

  const handleBaixarBackup = async () => {
    setBackupStatus({ loading: true });
    const result = await gerarBackupLocalCompleto();
    setBackupStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
  };

  const handleRestaurarBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreStatus({ loading: true, message: 'Lendo arquivo e restaurando estado...' });
    try {
      const text = await file.text();
      const result = await restaurarBackupLocalJson(text);
      setRestoreStatus({
        loading: false,
        success: result.success,
        message: result.message,
      });
      if (result.success) {
        onConfigSaved();
      }
    } catch (err: any) {
      setRestoreStatus({
        loading: false,
        success: false,
        message: 'Erro ao restaurar backup: ' + (err.message || 'Falha ao ler arquivo.'),
      });
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleRunMigration = async () => {
    setMigrationStatus({ loading: true });
    const result = await migrarDadosLegadosParaAdm(ADMIN_CONFIG.EMAIL);
    setMigrationStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
    if (result.success) {
      onConfigSaved();
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0a0f1d]/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400">
              <i className="fa-solid fa-crown text-base"></i>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Painel do Administrador • Nuvem & IA</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-yellow-300 border border-amber-500/30">
                  ADM EXCLUSIVO
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Gerencie banco Supabase, chaves do Gemini e vinculação dos dados legados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#1e293b] transition"
            title="Fechar"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 pt-3 border-b border-[#1e293b] flex space-x-2 bg-[#0a0f1d]/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chaves')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'chaves'
                ? 'border-yellow-400 text-yellow-400 bg-[#131b2e]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-key mr-2 text-yellow-400"></i> Credenciais & Conexão
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-blue-400 text-blue-400 bg-[#131b2e]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-database mr-2 text-blue-400"></i> Script SQL Supabase
          </button>
          <button
            onClick={() => setActiveTab('migracao')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'migracao'
                ? 'border-emerald-400 text-emerald-400 bg-[#131b2e]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-arrows-split-up-and-left mr-2 text-emerald-400"></i> Transferência 100% de Dados
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'chaves' && (
            <div className="space-y-5">
              {/* Info banner */}
              <div className="bg-[#0a0f1d] border border-blue-900/60 rounded-xl p-4 text-xs text-gray-300 flex items-start space-x-3">
                <i className="fa-solid fa-circle-info text-blue-400 text-base mt-0.5 shrink-0"></i>
                <div className="space-y-1">
                  <span className="font-bold text-white block">Persistência na Nuvem em Tempo Real</span>
                  <p className="text-gray-400 leading-relaxed">
                    Com o Supabase conectado, todas as premissas, blocos, arquivos de legislação, cadernos de treino e histórico de acertos são armazenados na nuvem com isolamento individual por usuário.
                  </p>
                </div>
              </div>

              {/* Multi-Device & Mobile Banner */}
              <div className="bg-[#0a0f1d] border border-amber-800/60 rounded-xl p-4 text-xs text-gray-300 flex items-start space-x-3">
                <i className="fa-solid fa-mobile-screen-button text-yellow-400 text-lg mt-0.5 shrink-0"></i>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white block">Sincronização com Celular & Outros Dispositivos</span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded text-[10px] font-bold">AUTOMÁTICO</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    Ao salvar aqui no PC, as credenciais da nuvem são sincronizadas pelo servidor. Quando você abrir no seu celular e fizer login como Administrador (<b>{ADMIN_CONFIG.EMAIL}</b>), o celular conectará diretamente ao mesmo Supabase e puxará todas as suas bancas, matérias e sessões!
                  </p>
                </div>
              </div>

              {/* Supabase inputs */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center">
                  <i className="fa-solid fa-server mr-2 text-yellow-400"></i> 1. Supabase (Banco de Dados Nuvem)
                </h3>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={config.supabaseUrl}
                    onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value.trim() })}
                    placeholder="https://sua-instancia.supabase.co"
                    className="input-field text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Supabase Anon Public Key (anon / public)
                  </label>
                  <input
                    type="password"
                    value={config.supabaseAnonKey}
                    onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value.trim() })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="input-field text-xs font-mono"
                  />
                </div>
              </div>

              {/* Card de Backup Físico JSON (Hard Backup) */}
              <div className="bg-[#0a0f1d] border border-emerald-900/50 rounded-xl p-4 text-xs text-gray-300 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-600/60 flex items-center justify-center text-emerald-400 shrink-0">
                      <i className="fa-solid fa-file-shield text-sm"></i>
                    </div>
                    <div>
                      <span className="font-bold text-white block text-sm">Backup de Segurança Físico (JSON)</span>
                      <p className="text-gray-400 leading-relaxed mt-0.5">
                        Exporte ou importe o arquivo físico (.json) completo com todas as 2.000 questões, bancas, matérias, sessões e histórico de resoluções.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação de Backup e Upload */}
                <div className="pt-2 border-t border-emerald-900/30 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleBaixarBackup}
                    disabled={backupStatus.loading || restoreStatus.loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg disabled:opacity-50 cursor-pointer text-xs"
                    title="Baixar arquivo físico .json com o backup completo"
                  >
                    {backupStatus.loading ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-download"></i>
                    )}
                    <span>Baixar Backup (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={backupStatus.loading || restoreStatus.loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 border border-blue-400/40 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-900/30 disabled:opacity-50 cursor-pointer text-xs"
                    title="Fazer upload de arquivo .json de backup para restaurar localmente e sincronizar com o Supabase"
                  >
                    {restoreStatus.loading ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-cloud-arrow-up text-white"></i>
                    )}
                    <span>Upload do Backup (JSON)</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleRestaurarBackup}
                    className="hidden"
                  />
                </div>

                {/* Zona de Drop para Upload do Arquivo JSON */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && fileInputRef.current) {
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      fileInputRef.current.files = dataTransfer.files;
                      handleRestaurarBackup({ target: fileInputRef.current } as any);
                    }
                  }}
                  className="border border-dashed border-blue-800/60 hover:border-blue-400 bg-blue-950/20 hover:bg-blue-950/40 rounded-xl p-3 text-center cursor-pointer transition flex items-center justify-center space-x-2 text-blue-300 text-xs"
                >
                  <i className="fa-solid fa-cloud-arrow-up text-blue-400"></i>
                  <span>Clique ou arraste seu arquivo <b>.json</b> aqui para fazer <b>Upload do Backup</b></span>
                </div>
                {backupStatus.message && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs animate-fadeIn ${
                      backupStatus.success
                        ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                        : 'bg-red-950/60 border-red-800 text-red-200'
                    }`}
                  >
                    <i className={`fa-solid ${backupStatus.success ? 'fa-circle-check text-emerald-400' : 'fa-triangle-exclamation text-red-400'} mr-1.5`}></i>
                    {backupStatus.message}
                  </div>
                )}
                {restoreStatus.message && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs animate-fadeIn ${
                      restoreStatus.success
                        ? 'bg-cyan-950/60 border-cyan-700 text-cyan-200'
                        : 'bg-red-950/60 border-red-800 text-red-200'
                    }`}
                  >
                    <i className={`fa-solid ${restoreStatus.success ? 'fa-circle-check text-cyan-400' : 'fa-triangle-exclamation text-red-400'} mr-1.5`}></i>
                    {restoreStatus.message}
                  </div>
                )}
              </div>

              {/* Test and Sync buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleTestSupabase}
                  disabled={testStatus.loading}
                  className="btn-secondary text-xs py-2 px-3.5 flex items-center space-x-1.5"
                >
                  {testStatus.loading ? (
                    <i className="fa-solid fa-spinner fa-spin mr-1 text-yellow-400"></i>
                  ) : (
                    <i className="fa-solid fa-bolt mr-1 text-yellow-400"></i>
                  )}
                  <span>Testar Conexão Supabase</span>
                </button>

                <button
                  onClick={handleSincronizacaoBidirecional}
                  disabled={replaceStatus.loading || !config.supabaseUrl}
                  className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 text-xs py-2 px-3.5 rounded-lg font-semibold flex items-center space-x-1.5 transition disabled:opacity-40 shadow-sm cursor-pointer"
                  title="Mescla de forma bidirecional e segura os dados locais e remotos via upsert, sem perdas nem deleções"
                >
                  {replaceStatus.loading ? (
                    <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                  ) : (
                    <i className="fa-solid fa-arrows-rotate mr-1 text-emerald-400"></i>
                  )}
                  <span>Sincronização Nuvem (Merge Bidirecional)</span>
                </button>
              </div>

              {/* Incremental Sync Feedback */}
              {replaceStatus.message && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
                    replaceStatus.success
                      ? 'bg-green-950/40 border-green-700 text-green-200'
                      : 'bg-red-950/40 border-red-800 text-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold mb-1">
                    <i className={`fa-solid ${replaceStatus.success ? 'fa-circle-check text-green-400' : 'fa-triangle-exclamation text-red-400'}`}></i>
                    <span>{replaceStatus.success ? 'Sincronização Concluída!' : 'Falha na Sincronização'}</span>
                  </div>
                  <p>{replaceStatus.message}</p>
                </div>
              )}

              {/* Test feedback */}
              {testStatus.message && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    testStatus.success
                      ? 'bg-green-950/30 border-green-800 text-green-300'
                      : 'bg-amber-950/30 border-amber-800 text-amber-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold mb-1">
                    <i
                      className={`fa-solid ${
                        testStatus.success ? 'fa-circle-check text-green-400' : 'fa-triangle-exclamation text-amber-400'
                      }`}
                    ></i>
                    <span>{testStatus.success ? 'Conexão Estabelecida!' : 'Atenção na Conexão'}</span>
                  </div>
                  <p>{testStatus.message}</p>
                  {testStatus.tables && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                      <span className="flex items-center">
                        <i
                          className={`fa-solid ${
                            testStatus.tables.usuarios ? 'fa-check text-green-400' : 'fa-xmark text-red-400'
                          } mr-1.5`}
                        ></i>
                        usuarios
                      </span>
                      <span className="flex items-center">
                        <i
                          className={`fa-solid ${
                            testStatus.tables.bancas ? 'fa-check text-green-400' : 'fa-xmark text-red-400'
                          } mr-1.5`}
                        ></i>
                        bancas
                      </span>
                      <span className="flex items-center">
                        <i
                          className={`fa-solid ${
                            testStatus.tables.blocos ? 'fa-check text-green-400' : 'fa-xmark text-red-400'
                          } mr-1.5`}
                        ></i>
                        blocos
                      </span>
                      <span className="flex items-center">
                        <i
                          className={`fa-solid ${
                            testStatus.tables.materias ? 'fa-check text-green-400' : 'fa-xmark text-red-400'
                          } mr-1.5`}
                        ></i>
                        materias
                      </span>
                      <span className="flex items-center">
                        <i
                          className={`fa-solid ${
                            testStatus.tables.questoes ? 'fa-check text-green-400' : 'fa-xmark text-red-400'
                          } mr-1.5`}
                        ></i>
                        questoes
                      </span>
                      <span className="flex items-center">
                        <i
                          className={`fa-solid ${
                            testStatus.tables.sessoes ? 'fa-check text-green-400' : 'fa-xmark text-red-400'
                          } mr-1.5`}
                        ></i>
                        sessoes
                      </span>
                      <span className="flex items-center">
                        <i
                          className={`fa-solid ${
                            testStatus.tables.historico ? 'fa-check text-green-400' : 'fa-xmark text-red-400'
                          } mr-1.5`}
                        ></i>
                        historico
                      </span>
                    </div>
                  )}
                </div>
              )}

              {syncStatus.message && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    syncStatus.success
                      ? 'bg-green-950/30 border-green-800 text-green-300'
                      : 'bg-red-950/30 border-red-800 text-red-300'
                  }`}
                >
                  <i
                    className={`fa-solid ${
                      syncStatus.success ? 'fa-circle-check text-green-400' : 'fa-circle-xmark text-red-400'
                    } mr-1.5`}
                  ></i>
                  {syncStatus.message}
                </div>
              )}

              <hr className="border-[#1e293b]" />

              {/* Gemini API Key input */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center">
                  <i className="fa-solid fa-wand-magic-sparkles mr-2 text-yellow-400"></i> 2. Chave da API do Google Gemini
                </h3>
                <p className="text-xs text-gray-400">
                  Cole sua chave de API pessoal do Google AI Studio para gerar questões com máxima velocidade e precisão:
                </p>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Gemini API Key (Google AI Studio)
                  </label>
                  <input
                    type="password"
                    value={config.geminiApiKey}
                    onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value.trim() })}
                    placeholder="AIzaSy..."
                    className="input-field text-xs font-mono"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleTestGemini}
                    disabled={geminiTestStatus.loading || !config.geminiApiKey}
                    className="btn-secondary text-xs py-2 px-3.5 flex items-center space-x-1.5 disabled:opacity-40"
                  >
                    {geminiTestStatus.loading ? (
                      <i className="fa-solid fa-spinner fa-spin mr-1 text-yellow-400"></i>
                    ) : (
                      <i className="fa-solid fa-vial-circle-check mr-1 text-yellow-400"></i>
                    )}
                    <span>Testar Chave Gemini</span>
                  </button>
                </div>

                {geminiTestStatus.message && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      geminiTestStatus.success
                        ? 'bg-green-950/30 border-green-800 text-green-300'
                        : 'bg-red-950/30 border-red-800 text-red-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold mb-1">
                      <i
                        className={`fa-solid ${
                          geminiTestStatus.success ? 'fa-circle-check text-green-400' : 'fa-circle-xmark text-red-400'
                        }`}
                      ></i>
                      <span>{geminiTestStatus.success ? 'Chave Válida e Conectada!' : 'Falha na Validação'}</span>
                    </div>
                    <p>{geminiTestStatus.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <i className="fa-solid fa-code text-yellow-400 mr-2"></i> Script SQL Completo para o Supabase
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    No seu projeto Supabase, acesse o <b>SQL Editor</b>, crie uma <b>New Query</b>, cole o script abaixo e clique em <b>Run</b>.
                  </p>
                </div>
                <button
                  onClick={copySql}
                  className="btn-primary text-xs py-2 px-3.5 flex items-center space-x-1.5"
                >
                  <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} mr-1.5`}></i>
                  <span>{copied ? 'Copiado para Área de Transferência!' : 'Copiar Script SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-4 text-xs font-mono text-gray-300 overflow-x-auto max-h-[50vh] leading-relaxed select-all">
                  {SUPABASE_SQL_SCRIPT}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'migracao' && (
            <div className="space-y-4">
              <div className="bg-[#0a0f1d] border border-emerald-900/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <i className="fa-solid fa-user-check text-lg"></i>
                  <span>Transferência de Dados 100% para o Administrador</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Conforme configurado, todas as bancas, premissas de blocos, matérias com leis em PDF, cadernos de sessões e questões geradas que existiam no banco ou cache local são vinculadas diretamente à sua conta de Administrador (<b>{ADMIN_CONFIG.EMAIL}</b>).
                </p>
                <div className="text-[11px] text-gray-400 bg-[#131b2e] p-3 rounded-lg border border-[#1e293b] space-y-1">
                  <div><b>Usuário Destino:</b> {ADMIN_CONFIG.USERNAME} ({ADMIN_CONFIG.EMAIL})</div>
                  <div><b>Telefone:</b> {ADMIN_CONFIG.PHONE}</div>
                  <div><b>Perfil:</b> Administrador (Acesso pleno a configurações)</div>
                </div>

                <button
                  onClick={handleRunMigration}
                  disabled={migrationStatus.loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {migrationStatus.loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Transferindo dados...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-bolt"></i>
                      <span>Executar Vinculação Total Agora</span>
                    </>
                  )}
                </button>

                {migrationStatus.message && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      migrationStatus.success
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                        : 'bg-red-950/40 border-red-800 text-red-300'
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        migrationStatus.success ? 'fa-circle-check text-emerald-400' : 'fa-circle-xmark text-red-400'
                      } mr-1.5`}
                    ></i>
                    {migrationStatus.message}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1e293b] bg-[#0a0f1d]/50 flex items-center justify-between">
          <div className="text-xs text-gray-400 flex items-center">
            {saveFeedback && (
              <span className="text-green-400 flex items-center animate-pulse">
                <i className="fa-solid fa-circle-check mr-1.5"></i> Configurações salvas com sucesso!
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button onClick={onClose} className="btn-secondary text-xs">
              Fechar
            </button>
            <button onClick={handleSave} className="btn-primary text-xs">
              <i className="fa-solid fa-floppy-disk mr-1.5"></i> Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
