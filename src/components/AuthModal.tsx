import React, { useState, useRef } from 'react';
import {
  loginWithCredentials,
  loginWithGoogle,
  registerUser,
  formatPhoneNumber,
  setCurrentUser,
  ADMIN_CONFIG,
} from '../services/authService';
import { restaurarBackupLocalJson } from '../services/supabaseClient';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: UserProfile) => void;
  initialTab?: 'login' | 'register';
  canClose?: boolean;
  inline?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'login',
  canClose = true,
  inline = false,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginIdentificador, setLoginIdentificador] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Register form state
  const [regNome, setRegNome] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCelular, setRegCelular] = useState('');
  const [regSenha, setRegSenha] = useState('');

  if (!isOpen) return null;

  const authFileInputRef = useRef<HTMLInputElement | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegCelular(formatPhoneNumber(e.target.value));
  };

  const handleUploadBackupAuthModal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const text = await file.text();
      const res = await restaurarBackupLocalJson(text);
      if (res.success) {
        setSuccessMessage(res.message);
        const adminProfile: UserProfile = {
          id: 'admin-gabriel-01',
          email: ADMIN_CONFIG.EMAIL,
          nome: ADMIN_CONFIG.USERNAME,
          username: ADMIN_CONFIG.USERNAME,
          celular: ADMIN_CONFIG.PHONE,
          role: 'ADMIN',
          created_at: new Date().toISOString(),
        };
        setCurrentUser(adminProfile);
        setTimeout(() => {
          onSuccess(adminProfile);
          onClose?.();
        }, 800);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage('Erro ao ler arquivo de backup: ' + (err.message || 'Falha ao processar'));
    } finally {
      setRestoreLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const user = await loginWithCredentials(loginIdentificador, loginSenha);
      setSuccessMessage(`Bem-vindo de volta, ${user.nome}!`);
      setTimeout(() => {
        onSuccess(user);
        onClose?.();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const user = await registerUser({
        nome: regNome,
        username: regUsername,
        email: regEmail,
        celular: regCelular,
        senha: regSenha,
      });
      setSuccessMessage(`Conta criada com sucesso! Bem-vindo, ${user.nome}!`);
      setTimeout(() => {
        onSuccess(user);
        onClose?.();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao registrar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const user = await loginWithGoogle();
      if (user) {
        setSuccessMessage(`Conectado via Google como ${user.nome}!`);
        setTimeout(() => {
          onSuccess(user);
          onClose?.();
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha no login com Google.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCreds = () => {
    setLoginIdentificador(ADMIN_CONFIG.EMAIL);
    setLoginSenha(ADMIN_CONFIG.PASSWORD);
    setErrorMessage('');
  };

  const cardContent = (
    <div className="bg-[#101726] border border-[#1e293b] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1e293b] flex items-center justify-between bg-[#0a0f1d]/70">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="MIRAQuest"
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-blue-500/30 border border-blue-500/40"
            />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Acesso ao MIRAQuest</h2>
              <p className="text-xs text-gray-400">MIRAQuest • Precisão em Questões</p>
            </div>
          </div>
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1e293b] transition"
              title="Fechar"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          )}
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-[#1e293b] bg-[#0c1220]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'login'
                ? 'border-yellow-400 text-yellow-400 bg-[#131b2e]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-arrow-right-to-bracket text-xs"></i>
            <span>ENTRAR</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'register'
                ? 'border-blue-400 text-blue-400 bg-[#131b2e]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-user-plus text-xs"></i>
            <span>CRIAR CONTA</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Notification Banners */}
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs flex items-start space-x-2">
              <i className="fa-solid fa-triangle-exclamation text-red-400 mt-0.5"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-start space-x-2">
              <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5"></i>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Social Google Login Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 bg-[#1a2333] hover:bg-[#222e44] border border-[#2a374f] text-gray-200 rounded-xl text-xs font-semibold transition active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.9 7C.7 9.4 0 12 0 14.7s.7 5.3 1.9 7.7l3.7-2.9c0-.2 0-.4 0-.8z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17c1.8 3.8 5.6 6.5 10.1 6.5z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>

            <div className="flex items-center my-4 space-x-2">
              <div className="flex-1 border-t border-[#1e293b]"></div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                ou com suas credenciais
              </span>
              <div className="flex-1 border-t border-[#1e293b]"></div>
            </div>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  E-mail, Celular ou Nome de Usuário
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-xs">
                    <i className="fa-solid fa-user"></i>
                  </span>
                  <input
                    type="text"
                    required
                    value={loginIdentificador}
                    onChange={(e) => setLoginIdentificador(e.target.value)}
                    placeholder="gahenrique.eng@gmail.com ou Gabriel"
                    className="w-full pl-9 pr-3 py-2 bg-[#0c1220] border border-[#1e293b] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-300">Senha</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-gray-400 hover:text-gray-200 transition"
                  >
                    {showPassword ? 'Ocultar' : 'Visualizar'}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-xs">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginSenha}
                    onChange={(e) => setLoginSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-9 pr-10 py-2 bg-[#0c1220] border border-[#1e293b] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 text-xs"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Quick Fill Admin Button */}
              <div className="p-3 bg-[#0a0f1d] border border-blue-900/40 rounded-xl flex items-center justify-between">
                <div className="text-[11px] text-gray-300">
                  <span className="font-semibold text-blue-400">Administrador:</span> Gabriel Henrique
                </div>
                <button
                  type="button"
                  onClick={fillAdminCreds}
                  className="px-2.5 py-1 text-[10px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg transition cursor-pointer"
                >
                  Preencher dados ADM
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Verificando credenciais...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-arrow-right-to-bracket"></i>
                    <span>Entrar no Sistema</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Nome Completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full px-3 py-2 bg-[#0c1220] border border-[#1e293b] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Nome de Usuário <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Ex: carlosedu"
                    className="w-full px-3 py-2 bg-[#0c1220] border border-[#1e293b] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Celular com DDD <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regCelular}
                    onChange={handlePhoneChange}
                    placeholder="(41) 9 9999-9999"
                    maxLength={17}
                    className="w-full px-3 py-2 bg-[#0c1220] border border-[#1e293b] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  E-mail <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-3 py-2 bg-[#0c1220] border border-[#1e293b] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Senha de Acesso <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regSenha}
                    onChange={(e) => setRegSenha(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full px-3 pr-10 py-2 bg-[#0c1220] border border-[#1e293b] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 text-xs"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-xl text-[11px] text-blue-200">
                <i className="fa-solid fa-shield-halved mr-1.5 text-blue-400"></i>
                Você terá seu espaço de estudos individual com premissas, matérias e cadernos próprios.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Cadastrando...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-user-plus"></i>
                    <span>Criar Conta e Acessar</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info & Backup Restore Option */}
        <div className="px-6 py-3.5 bg-[#0a0f1d] border-t border-[#1e293b] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-gray-400">Tem um backup local?</span>
            <button
              type="button"
              onClick={() => authFileInputRef.current?.click()}
              disabled={restoreLoading || loading}
              className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              title="Fazer upload de arquivo .json de backup para restaurar localmente e acessar"
            >
              {restoreLoading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa-solid fa-cloud-arrow-up"></i>
              )}
              <span>Upload do Backup (JSON)</span>
            </button>
            <input
              type="file"
              ref={authFileInputRef}
              accept=".json,application/json"
              onChange={handleUploadBackupAuthModal}
              className="hidden"
            />
          </div>
          <div className="text-center text-[10px] text-gray-500">
            Hierarquia de acesso: Administrador (Configurações Cloud) e Usuário Comum (Treino Individual)
          </div>
        </div>
      </div>
    );

  if (inline) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {cardContent}
    </div>
  );
};
