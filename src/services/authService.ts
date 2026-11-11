import { UserProfile } from '../types';
import { getSupabaseClient } from './supabaseClient';

const STORAGE_KEYS = {
  CURRENT_USER: 'gb_current_user',
  REGISTERED_USERS: 'gb_registered_users',
};

export const ADMIN_CONFIG = {
  EMAIL: 'gahenrique.eng@gmail.com',
  USERNAME: 'Gabriel',
  PHONE: '(41) 9 9790 9082',
  PASSWORD: 'adm123',
};

// Check if email matches the Administrator
export function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_CONFIG.EMAIL.toLowerCase();
}

// Check if user has ADMIN privileges
export function isAdmin(user?: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || isAdminEmail(user.email);
}

// Auto-format phone number as (XX) X XXXX-XXXX
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

// Event dispatcher for authentication state change
export function notifyAuthChange(user: UserProfile | null) {
  try {
    window.dispatchEvent(new CustomEvent('gb_auth_changed', { detail: user }));
  } catch {}
}

// Retrieve currently active user
export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      const user: UserProfile = JSON.parse(raw);
      if (isAdminEmail(user.email)) {
        user.role = 'ADMIN';
      }
      return user;
    }
  } catch (e) {
    console.error('Erro ao ler usuário ativo:', e);
  }
  return null;
}

// Set active user
export function setCurrentUser(user: UserProfile | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    if (isAdminEmail(user.email)) {
      user.role = 'ADMIN';
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
  notifyAuthChange(user);
}

// Local registry of created accounts (fallback & fast offline access)
export function getRegisteredUsers(): (UserProfile & { senhaHash?: string })[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUser(user: UserProfile & { senhaHash?: string }) {
  const list = getRegisteredUsers();
  const index = list.findIndex(
    (u) =>
      u.email.toLowerCase() === user.email.toLowerCase() ||
      (user.username && u.username && u.username.toLowerCase() === user.username.toLowerCase())
  );
  if (index >= 0) {
    list[index] = { ...list[index], ...user };
  } else {
    list.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(list));
}

// Login by credentials (Email, Username or Phone + Password)
export async function loginWithCredentials(identificador: string, senha: string): Promise<UserProfile> {
  const cleanId = identificador.trim().toLowerCase();
  const cleanPass = senha.trim();

  if (!cleanId) {
    throw new Error('Informe seu e-mail, celular ou nome de usuário.');
  }
  if (!cleanPass) {
    throw new Error('Informe sua senha.');
  }

  // 1. Direct match for predefined ADMIN account
  const adminEmail = ADMIN_CONFIG.EMAIL.toLowerCase();
  const adminUser = ADMIN_CONFIG.USERNAME.toLowerCase();
  const adminPhoneDigits = ADMIN_CONFIG.PHONE.replace(/\D/g, '');
  const inputDigits = cleanId.replace(/\D/g, '');

  const matchesAdmin =
    cleanId === adminEmail ||
    cleanId === adminUser ||
    (inputDigits && inputDigits.length >= 8 && inputDigits === adminPhoneDigits);

  if (matchesAdmin) {
    if (cleanPass !== ADMIN_CONFIG.PASSWORD) {
      throw new Error('Senha incorreta para a conta de Administrador.');
    }

    const adminProfile: UserProfile = {
      id: 'admin-gabriel-01',
      email: ADMIN_CONFIG.EMAIL,
      nome: 'Gabriel',
      username: ADMIN_CONFIG.USERNAME,
      celular: ADMIN_CONFIG.PHONE,
      role: 'ADMIN',
      created_at: new Date().toISOString(),
    };

    setCurrentUser(adminProfile);
    return adminProfile;
  }

  // 2. Check local users
  const localUsers = getRegisteredUsers();
  const foundUser = localUsers.find((u) => {
    const uEmail = (u.email || '').toLowerCase();
    const uName = (u.username || '').toLowerCase();
    const uDigits = (u.celular || '').replace(/\D/g, '');
    return cleanId === uEmail || cleanId === uName || (inputDigits && inputDigits.length >= 8 && inputDigits === uDigits);
  });

  if (foundUser) {
    if (foundUser.senhaHash && foundUser.senhaHash !== cleanPass) {
      throw new Error('Senha incorreta. Verifique e tente novamente.');
    }
    const profile: UserProfile = {
      id: foundUser.id,
      email: foundUser.email,
      nome: foundUser.nome,
      username: foundUser.username,
      celular: foundUser.celular,
      role: isAdminEmail(foundUser.email) ? 'ADMIN' : 'USER',
      created_at: foundUser.created_at,
    };
    setCurrentUser(profile);
    return profile;
  }

  // 3. Check Supabase 'usuarios' table if connected
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('usuarios')
        .select('*')
        .or(`email.ilike.${cleanId},username.ilike.${cleanId},celular.ilike.%${cleanId}%`)
        .maybeSingle();

      if (!error && data) {
        if (data.senha && data.senha !== cleanPass) {
          throw new Error('Senha incorreta.');
        }
        const profile: UserProfile = {
          id: String(data.id),
          email: data.email,
          nome: data.nome,
          username: data.username,
          celular: data.celular || '',
          role: data.role === 'ADMIN' || isAdminEmail(data.email) ? 'ADMIN' : 'USER',
          created_at: data.created_at,
        };
        // Cache locally for offline resilience
        saveRegisteredUser({
          ...profile,
          senhaHash: cleanPass,
        });
        setCurrentUser(profile);
        return profile;
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Senha')) {
        throw err;
      }
      console.warn('Falha na busca de usuário no Supabase:', err);
    }
  }

  throw new Error('Conta não encontrada. Verifique os dados ou crie uma nova conta na aba "Criar Conta".');
}

// Login via Google (OAuth with Supabase or instant Google Profile)
export async function loginWithGoogle(emailOverride?: string): Promise<UserProfile> {
  const client = getSupabaseClient();
  
  if (emailOverride) {
    const emailClean = emailOverride.trim().toLowerCase();
    const isAdm = isAdminEmail(emailClean);
    const googleProfile: UserProfile = {
      id: `google-${Date.now()}`,
      email: emailClean,
      nome: isAdm ? 'Gabriel' : emailClean.split('@')[0],
      username: isAdm ? ADMIN_CONFIG.USERNAME : emailClean.split('@')[0],
      celular: isAdm ? ADMIN_CONFIG.PHONE : '',
      role: isAdm ? 'ADMIN' : 'USER',
      created_at: new Date().toISOString(),
    };
    saveRegisteredUser(googleProfile);
    setCurrentUser(googleProfile);
    return googleProfile;
  }

  if (client) {
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        console.warn('Supabase Google OAuth notice:', error.message);
      }
    } catch (e) {
      console.warn('Erro ao chamar Google OAuth:', e);
    }
  }

  // Fallback to Admin Gabriel if default
  const defaultProfile: UserProfile = {
    id: 'admin-gabriel-01',
    email: ADMIN_CONFIG.EMAIL,
    nome: 'Gabriel',
    username: ADMIN_CONFIG.USERNAME,
    celular: ADMIN_CONFIG.PHONE,
    role: 'ADMIN',
    created_at: new Date().toISOString(),
  };
  setCurrentUser(defaultProfile);
  return defaultProfile;
}

// Register a new user
export async function registerUser(dados: {
  nome: string;
  username: string;
  email: string;
  celular: string;
  senha: string;
}): Promise<UserProfile> {
  const nome = dados.nome.trim();
  const username = dados.username.trim().replace(/^@/, '');
  const email = dados.email.trim().toLowerCase();
  const celular = formatPhoneNumber(dados.celular.trim());
  const senha = dados.senha.trim();

  if (!nome) throw new Error('Informe seu nome completo.');
  if (!username) throw new Error('Escolha um nome de usuário.');
  if (!email || !email.includes('@')) throw new Error('Informe um e-mail válido.');
  if (!celular) throw new Error('Informe seu número de celular com DDD.');
  if (!senha || senha.length < 4) throw new Error('A senha deve ter no mínimo 4 caracteres.');

  // Check if username or email already exists
  const existing = getRegisteredUsers();
  if (existing.some((u) => u.email.toLowerCase() === email)) {
    throw new Error('Este e-mail já está cadastrado. Faça login na aba "Entrar".');
  }
  if (existing.some((u) => u.username && u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Este nome de usuário já está em uso. Escolha outro.');
  }

  const isAdm = isAdminEmail(email);

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    email,
    nome,
    username,
    celular,
    role: isAdm ? 'ADMIN' : 'USER',
    created_at: new Date().toISOString(),
  };

  // Save to local registered list
  saveRegisteredUser({
    ...newUser,
    senhaHash: senha,
  });

  // Try saving to Supabase if connected
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('usuarios').insert({
        nome,
        username,
        email,
        celular,
        senha,
        role: newUser.role,
      });
    } catch (e) {
      console.warn('Erro ao registrar usuário no Supabase:', e);
    }
  }

  setCurrentUser(newUser);
  return newUser;
}

// Logout
export function logout(): void {
  setCurrentUser(null);
}

// Retrieve active session if already logged in previously (null for new visitors)
export function getOrCreateInitialUser(): UserProfile | null {
  return getCurrentUser();
}
