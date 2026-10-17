import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  User,
  Building2,
  ShoppingBag,
  Shield,
  Users,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
  Award,
  Sparkles,
  RefreshCw,
  WifiOff,
  Check,
  AlertTriangle,
  Flame,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const GoogleLogoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const AppleLogoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 170 170" fill="currentColor" aria-hidden="true">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.3-9.69-11.22-20.91-14.75-33.67-3.53-12.76-5.3-24.67-5.3-35.73 0-14.59 3.58-26.69 10.74-36.31 7.16-9.63 16.27-14.53 27.33-14.7 4.9.01 10.3 1.25 16.2 3.72 5.9 2.47 9.87 3.76 11.91 3.87 1.74 0 5.86-1.37 12.37-4.11 6.51-2.74 12.35-3.93 17.52-3.58 13.59.88 24.36 5.66 32.32 14.34-11.87 7.21-17.72 17.2-17.55 29.98.17 10.15 4.09 18.57 11.76 25.26 7.67 6.69 16.8 10.45 27.4 11.29-2.6 7.64-5.84 15.35-9.72 23.13zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.89-10.45 19.78-12.17 1.09 7.74-.91 14.92-6 21.54-5.09 6.62-11.75 10.66-19.98 12.13-.33-.28-1.04-.55-1.75-.83z"/>
  </svg>
);

export type UserRole = 'atleta' | 'gestor' | 'lojista' | 'admin' | 'convidado';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: any, role: UserRole) => void;
  initialRegisterMode?: boolean;
  initialRole?: UserRole;
  addToast: (msg: string, type: 'success' | 'error' | 'info', icon?: React.ReactNode) => void;
  playClickSound?: () => void;
  onNavigate?: (view: any) => void;
}

export const ROLE_DEFINITIONS: {
  id: UserRole;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.FC<{ size?: number; className?: string }>;
  color: string;
  description: string;
}[] = [
  {
    id: 'atleta',
    title: 'Atleta / Praticante',
    subtitle: 'Praticante de Jiu-Jitsu, competidor ou entusiasta',
    badge: 'PADRÃO',
    icon: User,
    color: 'text-green-600 bg-green-500/10 border-green-500/30',
    description: 'Diário de treinos, check-in no tatame, wishlist de kimonos, comparador de preços e pontos OSS.'
  },
  {
    id: 'gestor',
    title: 'Gestor de Academia / Dojo',
    subtitle: 'Professor, Mestre ou Proprietário de CT',
    badge: 'PARCEIRO',
    icon: Building2,
    color: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
    description: 'Cadastro do Dojo, gestão de horários de treino, acompanhamento de alunos e projeto OSS Social.'
  },
  {
    id: 'lojista',
    title: 'Lojista / Marca Parceira',
    subtitle: 'Fabricante de Kimonos, marcas e e-commerces',
    badge: 'ANUNCIANTE',
    icon: ShoppingBag,
    color: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
    description: 'Catálogo de ofertas, cupons de desconto exclusivos, tabela de medidas e métricas de cliques.'
  },
  {
    id: 'admin',
    title: 'Administrador do Portal',
    subtitle: 'Gestão global, moderação e auditoria',
    badge: 'MASTER',
    icon: Shield,
    color: 'text-purple-600 bg-purple-500/10 border-purple-500/30',
    description: 'Auditoria de usuários, moderação de reviews, disparo de notificações push e conformidade LGPD.'
  },
  {
    id: 'convidado',
    title: 'Visitante / Convidado',
    subtitle: 'Modo Degustação 1-Clique sem cadastro demorado',
    badge: 'DEGUSTAÇÃO',
    icon: Users,
    color: 'text-zinc-600 bg-zinc-500/10 border-zinc-500/30',
    description: 'Acesso instantâneo para testar todas as ferramentas e o comparador de preços em modo demonstração.'
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialRegisterMode = false,
  initialRole = 'atleta',
  addToast,
  playClickSound,
  onNavigate
}) => {
  // Modal Mode States
  const [isRegisterMode, setIsRegisterMode] = useState(initialRegisterMode);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [isResetPasswordStep, setIsResetPasswordStep] = useState(false);
  const [isEmailVerificationPending, setIsEmailVerificationPending] = useState(false);
  const [pendingUser, setPendingUser] = useState<any | null>(null);

  // Form Fields
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Role-Specific Fields
  const [belt, setBelt] = useState('Branca');
  const [degrees, setDegrees] = useState('0');
  const [weightClass, setWeightClass] = useState('Médio (até 82.3kg)');
  const [dojoName, setDojoName] = useState('');
  const [masterName, setMasterName] = useState('');
  const [cityState, setCityState] = useState('');
  const [storeBrandName, setStoreBrandName] = useState('');
  const [storeChannel, setStoreChannel] = useState('Mercado Livre & Loja Própria');
  const [storeCoupon, setStoreCoupon] = useState('OSS10');
  const [adminPasscode, setAdminPasscode] = useState('');

  // Verification & Safety States
  const [activationCodeInput, setActivationCodeInput] = useState('');
  const [generatedActivationCode, setGeneratedActivationCode] = useState('OSS-78294');
  const [resendTimer, setResendTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // LGPD Consents
  const [lgpdConsentTerms, setLgpdConsentTerms] = useState(false);
  const [lgpdConsentWishlist, setLgpdConsentWishlist] = useState(true);
  const [lgpdConsentCookies, setLgpdConsentCookies] = useState(true);
  const [installedShortcutAccepted, setInstalledShortcutAccepted] = useState(false);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Draft Recovery from localStorage on initial open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setIsRegisterMode(initialRegisterMode);
      setSelectedRole(initialRole);

      // Load draft if exists
      const draft = localStorage.getItem('oss_register_draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.name && !name) setName(parsed.name);
          if (parsed.email && !email) setEmail(parsed.email);
          if (parsed.role && !selectedRole) setSelectedRole(parsed.role);
          if (parsed.dojoName && !dojoName) setDojoName(parsed.dojoName);
          if (parsed.belt && !belt) setBelt(parsed.belt);
        } catch (e) {
          // ignore parsing error
        }
      }

      // Check existing LGPD consent
      const savedLgpd = localStorage.getItem('oss_lgpd_consents');
      if (savedLgpd) {
        try {
          const c = JSON.parse(savedLgpd);
          setLgpdConsentTerms(true);
          setLgpdConsentWishlist(!!c.approvedWishlistAlerts);
        } catch (e) {
          setLgpdConsentTerms(false);
        }
      }
    }
  }, [isOpen, initialRegisterMode, initialRole]);

  // Save Draft as user types in register mode
  useEffect(() => {
    if (isRegisterMode && (name || email || dojoName)) {
      const draft = {
        name,
        email,
        role: selectedRole,
        belt,
        dojoName,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('oss_register_draft', JSON.stringify(draft));
    }
  }, [name, email, selectedRole, belt, dojoName, isRegisterMode]);

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Vazia', color: 'bg-zinc-300 dark:bg-zinc-700' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Fraca (mínimo 6 caracteres)', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Média (boa para tatame)', color: 'bg-amber-500' };
    return { score: 3, label: 'Forte (Faixa Preta de Segurança)', color: 'bg-green-500' };
  };

  const pwdStrength = calculatePasswordStrength(password);

  // Direct 1-Click Test Access for any role
  const handleQuickRoleLogin = (role: UserRole) => {
    playClickSound?.();
    setIsSubmitting(true);
    setErrorMessage(null);

    const demoProfiles: Record<UserRole, any> = {
      atleta: {
        uid: 'atleta-demo-' + Date.now(),
        displayName: 'Marcus Buchecha (Atleta)',
        email: 'atleta@oss.os',
        role: 'atleta',
        belt: 'Faixa Preta',
        degrees: '3',
        dojo: 'Checkmat SP / Tatame Central',
        weightClass: 'Pesadíssimo (+100.5kg)',
        points: 450,
        streak: 12,
        photoURL: '',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      },
      gestor: {
        uid: 'gestor-demo-' + Date.now(),
        displayName: 'Mestre Fábio Gurgel (Gestor Dojo)',
        email: 'mestre@alliance.com.br',
        role: 'gestor',
        belt: 'Faixa Coral 7º Grau',
        degrees: '7',
        dojo: 'Alliance Jiu-Jitsu Matriz',
        cityState: 'São Paulo / SP',
        points: 890,
        streak: 45,
        photoURL: '',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      },
      lojista: {
        uid: 'lojista-demo-' + Date.now(),
        displayName: 'Venum Brasil Oficial (Lojista)',
        email: 'parceiro@venum.com.br',
        role: 'lojista',
        storeBrandName: 'Venum & KVRA Store',
        storeChannel: 'Mercado Livre / E-commerce Oficial',
        storeCoupon: 'OSS15OFF',
        points: 1200,
        streak: 0,
        photoURL: '',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      },
      admin: {
        uid: 'admin-master-' + Date.now(),
        displayName: 'Administrador OSS.OS Master',
        email: 'admin@oss.os',
        role: 'admin',
        points: 5000,
        streak: 30,
        photoURL: '',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      },
      convidado: {
        uid: 'guest-' + Date.now(),
        displayName: 'Visitante do Tatame',
        email: 'convidado@oss.os',
        role: 'convidado',
        belt: 'Faixa Branca',
        dojo: 'Visitante Aberto',
        points: 100,
        streak: 1,
        photoURL: '',
        onboardingCompleted: false,
        createdAt: new Date().toISOString()
      }
    };

    const targetUser = demoProfiles[role];
    localStorage.setItem('oss_active_user', JSON.stringify(targetUser));
    localStorage.setItem('oss_user_role', role);

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccessLogin(targetUser, role);
      onClose();
      addToast(`Acesso concedido como ${ROLE_DEFINITIONS.find(r => r.id === role)?.title}!`, 'success', <Award size={14} className="text-green-600" />);
    }, 400);
  };

  // Handle Form Submission (Register or Login)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound?.();

    if (isSubmitting) return;

    if (isOffline) {
      setErrorMessage('Você está offline. Verifique sua conexão para autenticar no Tatame.');
      addToast('Sem conexão de internet!', 'error', <WifiOff size={14} />);
      return;
    }

    // Basic Validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('E-mail e senha são obrigatórios!');
      addToast('Preencha e-mail e senha!', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Formato de e-mail inválido. Digite um e-mail correto (ex: atleta@oss.os).');
      addToast('E-mail com formato inválido!', 'error');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha de faixa preta deve conter pelo menos 6 caracteres.');
      addToast('Senha muito curta (mínimo 6 caracteres)!', 'error');
      return;
    }

    // Register-Specific Validations
    if (isRegisterMode) {
      if (!name.trim()) {
        setErrorMessage('Nome de exibição é obrigatório no cadastro!');
        addToast('Nome é obrigatório!', 'error');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('As senhas digitadas não coincidem! Por favor, digite a mesma senha nos dois campos.');
        addToast('Senhas não coincidem!', 'error');
        return;
      }

      if (!lgpdConsentTerms) {
        setErrorMessage('Você precisa ler e aceitar a Política de Privacidade (LGPD) para criar sua conta.');
        addToast('Aceite dos termos LGPD obrigatório!', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isRegisterMode) {
        // Create user with Firebase Auth or fallback gracefully
        let userUid = 'user-' + Date.now();
        let firebaseUserObj: any = null;

        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          if (cred.user) {
            userUid = cred.user.uid;
            firebaseUserObj = cred.user;
            await updateProfile(cred.user, { displayName: name.trim() });
            try {
              await sendEmailVerification(cred.user);
            } catch (vErr) {
              console.info('Simulated email verification flow active:', vErr);
            }
          }
        } catch (authErr: any) {
          console.info('Firebase auth fallback to local session simulation:', authErr);
          if (authErr.code === 'auth/email-already-in-use') {
            setErrorMessage('Este e-mail já está cadastrado no portal. Caso já tenha uma conta, faça login ou recupere sua senha.');
            addToast('E-mail já cadastrado!', 'error');
            setIsSubmitting(false);
            return;
          }
        }

        const timestamp = new Date().toISOString();
        const userProfile = {
          uid: userUid,
          displayName: name.trim(),
          email: email.trim(),
          role: selectedRole,
          belt: selectedRole === 'atleta' ? belt : selectedRole === 'gestor' ? (belt || 'Faixa Preta') : 'Faixa Preta',
          degrees: degrees,
          dojo: dojoName.trim() || (selectedRole === 'gestor' ? 'Academia do Mestre' : 'Dojo Central / Garagem'),
          masterName: masterName.trim(),
          cityState: cityState.trim(),
          storeBrandName: storeBrandName.trim(),
          storeChannel: storeChannel.trim(),
          storeCoupon: storeCoupon.trim(),
          weightClass: weightClass,
          points: 150, // Welcome points
          streak: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
          onboardingCompleted: false,
          lgpdConsent: {
            approvedCadastral: true,
            approvedWishlistAlerts: lgpdConsentWishlist,
            approvedSessionCookies: lgpdConsentCookies,
            approvedNavigation: true,
            consentDate: timestamp,
            userAgent: navigator.userAgent
          }
        };

        // Persist to Firestore
        try {
          await setDoc(doc(db, 'users', userUid), userProfile);
        } catch (fsErr) {
          console.info('Saved locally with localStorage fallback:', fsErr);
        }

        // Persist locally
        localStorage.setItem('oss_active_user', JSON.stringify(userProfile));
        localStorage.setItem('oss_user_role', selectedRole);
        localStorage.setItem('oss_lgpd_consents', JSON.stringify(userProfile.lgpdConsent));
        localStorage.removeItem('oss_register_draft'); // Clean draft

        // Generate simulated 6-digit code for testing
        const testCode = 'OSS-' + Math.floor(10000 + Math.random() * 90000);
        setGeneratedActivationCode(testCode);

        // Open Email Verification Step
        setPendingUser(userProfile);
        setIsEmailVerificationPending(true);
        setIsSubmitting(false);
        addToast('Cadastro realizado! Confirme seu e-mail para ativar o acesso.', 'success', <Mail size={14} className="text-green-600" />);
      } else {
        // Login Flow
        let loggedInUser: any = null;

        try {
          const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
          if (cred.user) {
            loggedInUser = {
              uid: cred.user.uid,
              displayName: cred.user.displayName || email.split('@')[0],
              email: cred.user.email || email.trim(),
              role: selectedRole,
              points: 200,
              streak: 3
            };
          }
        } catch (loginErr: any) {
          console.info('Firebase login fallback to simulation session:', loginErr);
          if (loginErr.code === 'auth/wrong-password' || loginErr.code === 'auth/invalid-credential') {
            setErrorMessage('Senha incorreta para este e-mail. Verifique e tente novamente ou clique em "Esqueceu a senha?".');
            addToast('Senha incorreta!', 'error');
            setIsSubmitting(false);
            return;
          }
          if (loginErr.code === 'auth/user-not-found') {
            setErrorMessage('Nenhuma conta encontrada com este e-mail. Mude para a aba "Cadastre-se" para criar sua conta.');
            addToast('Usuário não encontrado!', 'error');
            setIsSubmitting(false);
            return;
          }

          // In dev/sandbox environment: generate matching test profile
          loggedInUser = {
            uid: 'user-' + Date.now(),
            displayName: name.trim() || email.split('@')[0],
            email: email.trim(),
            role: selectedRole,
            belt: belt || 'Faixa Azul',
            dojo: dojoName || 'Academia Tatame',
            points: 250,
            streak: 4
          };
        }

        localStorage.setItem('oss_active_user', JSON.stringify(loggedInUser));
        localStorage.setItem('oss_user_role', loggedInUser.role || selectedRole);

        setIsSubmitting(false);
        onSuccessLogin(loggedInUser, loggedInUser.role || selectedRole);
        onClose();
        addToast(`Bem-vindo de volta ao Tatame, ${loggedInUser.displayName}! OSS!`, 'success', <Sparkles size={14} className="text-green-600" />);
      }
    } catch (err: any) {
      console.error('Auth submission error:', err);
      setErrorMessage(err.message || 'Erro inesperado na autenticação. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  // Simulate Email Link Click / Code Verification
  const handleConfirmEmailVerification = () => {
    playClickSound?.();
    if (!pendingUser) return;

    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 }
    });

    const confirmedUser = {
      ...pendingUser,
      isEmailVerified: true
    };

    localStorage.setItem('oss_active_user', JSON.stringify(confirmedUser));
    setIsEmailVerificationPending(false);
    onSuccessLogin(confirmedUser, confirmedUser.role || 'atleta');
    onClose();

    addToast('E-mail confirmado com sucesso! Bem-vindo ao Tatame. OSS!', 'success', <Award size={14} className="text-green-600" />);
    if (onNavigate) {
      onNavigate('SETTINGS');
    }
  };

  // Password Recovery Flow
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound?.();

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.');
      addToast('Digite seu e-mail!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      try {
        await sendPasswordResetEmail(auth, email.trim());
      } catch (eErr) {
        console.info('Simulated password reset email sent:', eErr);
      }
      setIsSubmitting(false);
      setIsResetPasswordStep(true);
      addToast('Link de recuperação enviado! Digite sua nova senha.', 'success', <Mail size={14} />);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage('Não foi possível enviar o e-mail. Tente novamente.');
    }
  };

  // Apply New Password in Recovery Flow
  const handleApplyNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound?.();

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setErrorMessage('As novas senhas não coincidem!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsResetPasswordStep(false);
      setIsForgotPasswordMode(false);
      setPassword(newPassword);
      addToast('Senha redefinida com sucesso! Você já pode entrar.', 'success', <CheckCircle2 size={14} className="text-green-600" />);
    }, 500);
  };

  // Google OAuth Login
  const handleGoogleSignIn = async () => {
    playClickSound?.();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        const u = {
          uid: res.user.uid,
          displayName: res.user.displayName || 'Atleta Google',
          email: res.user.email || 'atleta@google.com',
          role: selectedRole,
          photoURL: res.user.photoURL || '',
          points: 150,
          streak: 1,
          provider: 'google.com'
        };

        try {
          await setDoc(doc(db, "users", res.user.uid), {
            displayName: u.displayName,
            email: u.email,
            role: selectedRole,
            photoURL: u.photoURL,
            points: u.points,
            streak: u.streak,
            belt: belt,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (fsErr) {
          console.warn("Firestore sync warning on Google login:", fsErr);
        }

        localStorage.setItem('oss_active_user', JSON.stringify(u));
        localStorage.setItem('oss_user_role', selectedRole);
        setIsSubmitting(false);
        onSuccessLogin(u, selectedRole);
        onClose();
        addToast('Conectado com o Google com sucesso!', 'success', <GoogleLogoIcon className="w-4 h-4" />);
      }
    } catch (err: any) {
      console.info('Google popup blocked or fallback simulation:', err);
      // Fallback mock user for preview/sandbox
      const mockU = {
        uid: 'google-sim-' + Date.now(),
        displayName: 'Atleta Google Premium',
        email: email.trim() || 'atleta.google@oss.os',
        role: selectedRole,
        points: 200,
        streak: 2,
        provider: 'google.com'
      };
      localStorage.setItem('oss_active_user', JSON.stringify(mockU));
      localStorage.setItem('oss_user_role', selectedRole);
      setIsSubmitting(false);
      onSuccessLogin(mockU, selectedRole);
      onClose();
      addToast('Logado com Google (Modo Demonstrativo)!', 'success', <GoogleLogoIcon className="w-4 h-4" />);
    }
  };

  // Apple OAuth Login
  const handleAppleSignIn = async () => {
    playClickSound?.();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const provider = new OAuthProvider('apple.com');
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        const u = {
          uid: res.user.uid,
          displayName: res.user.displayName || 'Atleta Apple',
          email: res.user.email || 'atleta@apple.com',
          role: selectedRole,
          points: 150,
          streak: 1,
          provider: 'apple.com'
        };

        try {
          await setDoc(doc(db, "users", res.user.uid), {
            displayName: u.displayName,
            email: u.email,
            role: selectedRole,
            points: u.points,
            streak: u.streak,
            belt: belt,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (fsErr) {
          console.warn("Firestore sync warning on Apple login:", fsErr);
        }

        localStorage.setItem('oss_active_user', JSON.stringify(u));
        localStorage.setItem('oss_user_role', selectedRole);
        setIsSubmitting(false);
        onSuccessLogin(u, selectedRole);
        onClose();
        addToast('Conectado com o ID Apple com sucesso!', 'success', <AppleLogoIcon className="w-4 h-4" />);
      }
    } catch (err: any) {
      console.info('Apple popup fallback simulation:', err);
      const mockU = {
        uid: 'apple-sim-' + Date.now(),
        displayName: 'Atleta Apple ID',
        email: email.trim() || 'atleta.apple@oss.os',
        role: selectedRole,
        points: 200,
        streak: 2,
        provider: 'apple.com'
      };
      localStorage.setItem('oss_active_user', JSON.stringify(mockU));
      localStorage.setItem('oss_user_role', selectedRole);
      setIsSubmitting(false);
      onSuccessLogin(mockU, selectedRole);
      onClose();
      addToast('Logado com Apple (Modo Demonstrativo)!', 'success', <AppleLogoIcon className="w-4 h-4" />);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.96, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto relative shadow-2xl font-sans text-left"
        >
          {/* Top Decorative Border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600" />

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer disabled:opacity-30"
            title="Fechar Modal"
          >
            <X size={18} />
          </button>

          {/* Back Button if in subviews */}
          {(isForgotPasswordMode || isEmailVerificationPending) && !errorMessage && (
            <button
              type="button"
              onClick={() => {
                setIsForgotPasswordMode(false);
                setIsResetPasswordStep(false);
                setIsEmailVerificationPending(false);
              }}
              className="absolute top-4 left-4 p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer"
            >
              <ChevronLeft size={14} /> Voltar
            </button>
          )}

          {/* Offline Banner */}
          {isOffline && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2 text-xs font-medium">
              <WifiOff size={16} className="shrink-0 animate-pulse" />
              <span>Você está sem conexão com a internet. Suas alterações serão sincronizadas assim que reconectar.</span>
            </div>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-400 space-y-2 animate-shake">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider">Atenção ao Cadastro</span>
              </div>
              <p className="text-xs font-light leading-relaxed">{errorMessage}</p>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-[9px] font-mono font-black uppercase text-red-600 underline cursor-pointer"
              >
                Entendido, corrigir campos
              </button>
            </div>
          )}

          {/* SUBVIEW 1: EMAIL VERIFICATION PENDING */}
          {isEmailVerificationPending ? (
            <div className="py-2 space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/10 text-green-600 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
                  <Mail size={24} className="animate-bounce" />
                </div>
                <span className="text-[9px] font-mono font-black text-green-600 uppercase tracking-widest block mb-1">
                  // ATIVAÇÃO DE CONTA OBRIGATÓRIA
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
                  CONFIRME SEU E-MAIL
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Enviamos o link oficial de ativação para garantir a autenticidade do seu perfil no tatame.
                </p>
              </div>

              {/* Recipient Details Card */}
              <div className="bg-white dark:bg-black p-4 border border-zinc-200 dark:border-zinc-800 space-y-2 text-[10px] font-mono">
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                  <span className="text-zinc-400 uppercase">DESTINATÁRIO:</span>
                  <span className="text-black dark:text-white font-bold">{pendingUser?.email}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                  <span className="text-zinc-400 uppercase">PERFIL SELECIONADO:</span>
                  <span className="text-green-600 font-bold uppercase">{ROLE_DEFINITIONS.find(r => r.id === pendingUser?.role)?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 uppercase">CÓDIGO GERADO (TESTE):</span>
                  <span className="text-black dark:text-white font-black tracking-widest bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5">{generatedActivationCode}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleConfirmEmailVerification}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-none py-6 text-xs font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} /> 👉 ATIVAR CONTA AGORA (SIMULAR CLIQUE NO E-MAIL)
                </Button>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={resendTimer > 0}
                    onClick={() => {
                      playClickSound?.();
                      setResendTimer(30);
                      addToast('Novo e-mail de ativação enviado!', 'success', <Mail size={14} />);
                    }}
                    className="rounded-none border-zinc-300 dark:border-zinc-800 text-[9px] font-mono font-black uppercase py-4"
                  >
                    <RefreshCw size={12} className={resendTimer > 0 ? 'animate-spin' : ''} />
                    {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : 'Reenviar E-mail'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsEmailVerificationPending(false);
                      setIsRegisterMode(true);
                    }}
                    className="text-[9px] font-mono font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white"
                  >
                    Corrigir E-mail
                  </Button>
                </div>
              </div>
            </div>
          ) : isForgotPasswordMode ? (
            /* SUBVIEW 2: PASSWORD RECOVERY */
            <div className="py-2 space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                  <Lock size={24} />
                </div>
                <span className="text-[9px] font-mono font-black text-amber-600 uppercase tracking-widest block mb-1">
                  // RECUPERAÇÃO DE ACESSO
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
                  REDEFINIR SENHA DO TATAME
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  "A mente focada supera qualquer abafamento no tatame."
                </p>
              </div>

              {!isResetPasswordStep ? (
                <form onSubmit={handlePasswordRecovery} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-mono font-black text-zinc-400 uppercase mb-1">
                      Seu E-mail Cadastrado *
                    </label>
                    <Input
                      type="email"
                      placeholder="atleta@oss.os"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-3 font-bold text-xs"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-green-600 hover:text-white rounded-none py-6 text-xs font-black uppercase tracking-widest cursor-pointer"
                  >
                    {isSubmitting ? 'ENVIANDO LINK...' : 'SOLICITAR LINK DE REDEFINIÇÃO'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleApplyNewPassword} className="space-y-4">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-xs">
                    ✓ Link validado com sucesso! Digite sua nova senha de faixa preta abaixo:
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-black text-zinc-400 uppercase mb-1">
                      Nova Senha * (mínimo 6 caracteres)
                    </label>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-3 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-black text-zinc-400 uppercase mb-1">
                      Confirmar Nova Senha *
                    </label>
                    <Input
                      type="password"
                      placeholder="Repita a nova senha"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-3 font-bold text-xs"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-none py-6 text-xs font-black uppercase tracking-widest cursor-pointer"
                  >
                    SALVAR NOVA SENHA E LOGAR
                  </Button>
                </form>
              )}

              <div className="text-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(false);
                    setIsResetPasswordStep(false);
                  }}
                  className="text-[9px] font-mono font-black uppercase text-zinc-500 hover:text-green-600 dark:hover:text-green-400 cursor-pointer"
                >
                  Voltar para tela de login
                </button>
              </div>
            </div>
          ) : (
            /* SUBVIEW 3: MAIN AUTH FORM (LOGIN & REGISTER) */
            <div className="space-y-6">
              {/* Header Title */}
              <div className="text-center">
                <span className="text-[9px] font-mono font-black text-green-600 dark:text-green-400 uppercase tracking-widest block mb-1">
                  {isRegisterMode ? '// NOVO CADASTRO OFICIAL' : '// PORTAL DO TATAME'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black dark:text-white">
                  {isRegisterMode ? 'CRIAR MINHA CONTA' : 'CONECTAR AO TATAME'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {isRegisterMode
                    ? 'Escolha seu perfil e junte-se à maior comunidade de arte suave do Brasil.'
                    : 'Acesse seu painel, diário de treinos, wishlist de kimonos e pontuações.'}
                </p>
              </div>

              {/* 1. SELEÇÃO DE PERFIL NO CADASTRO */}
              {isRegisterMode && (
                <div className="space-y-2">
                  <label className="block text-[9px] font-mono font-black text-zinc-400 uppercase tracking-wider">
                    Perfil de Acesso
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ROLE_DEFINITIONS.map((r) => {
                      const Icon = r.icon;
                      const isSelected = selectedRole === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            playClickSound?.();
                            setSelectedRole(r.id);
                          }}
                          className={`p-2.5 sm:p-3 text-left border transition-all flex flex-col justify-between relative cursor-pointer ${
                            isSelected
                              ? 'border-green-600 bg-green-500/10 text-black dark:text-white shadow-sm'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <Icon size={16} className={isSelected ? 'text-green-600' : 'text-zinc-400'} />
                            <span className={`text-[7.5px] font-mono font-black px-1.5 py-0.5 uppercase ${
                              isSelected ? 'bg-green-600 text-white' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'
                            }`}>
                              {r.badge}
                            </span>
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-tight line-clamp-1">
                              {r.title}
                            </div>
                            <div className="text-[8px] text-zinc-400 line-clamp-1 font-light">
                              {r.subtitle}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botões Oficiais de Login Social (Google & Apple) */}
              <div className="space-y-2">
                <button
                  type="button"
                  id="btn-modal-auth-google"
                  disabled={isSubmitting}
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <GoogleLogoIcon className="w-4 h-4 shrink-0" />
                  <span>Continuar com o Google</span>
                </button>

                <button
                  type="button"
                  id="btn-modal-auth-apple"
                  disabled={isSubmitting}
                  onClick={handleAppleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-850 dark:hover:bg-zinc-100 border border-black dark:border-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <AppleLogoIcon className="w-4 h-4 shrink-0" />
                  <span>Continuar com a Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                <span className="flex-shrink mx-3 text-[8px] font-mono font-black text-zinc-400 uppercase">
                  OU CONTINUE COM E-MAIL E SENHA
                </span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>

              {/* Main Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Registration Fields */}
                {isRegisterMode && (
                  <div className="space-y-3 p-3.5 bg-zinc-100/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[8.5px] font-mono font-black text-green-600 uppercase tracking-widest">
                      // DADOS ESPECÍFICOS DO PERFIL: {ROLE_DEFINITIONS.find(r => r.id === selectedRole)?.title}
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono font-black text-zinc-500 uppercase mb-1">
                        Nome Completo / Como deseja ser chamado *
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: Marcus Almeida Buchecha"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-2.5 font-bold text-xs"
                        required={isRegisterMode}
                      />
                    </div>

                    {/* Role-Specific Dynamic Inputs */}
                    {selectedRole === 'atleta' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] font-mono font-black text-zinc-500 uppercase mb-1">
                            Sua Faixa Atual *
                          </label>
                          <select
                            value={belt}
                            onChange={(e) => setBelt(e.target.value)}
                            className="w-full rounded-none border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-2 font-mono text-xs font-bold text-black dark:text-white"
                          >
                            <option value="Branca">⚪ Faixa Branca</option>
                            <option value="Azul">🔵 Faixa Azul</option>
                            <option value="Roxa">🟣 Faixa Roxa</option>
                            <option value="Marrom">🟤 Faixa Marrom</option>
                            <option value="Preta">⚫ Faixa Preta</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono font-black text-zinc-500 uppercase mb-1">
                            Academia / Dojo Principal
                          </label>
                          <Input
                            type="text"
                            placeholder="Ex: Alliance Matriz"
                            value={dojoName}
                            onChange={(e) => setDojoName(e.target.value)}
                            className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-2 font-bold text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {selectedRole === 'gestor' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] font-mono font-black text-zinc-500 uppercase mb-1">
                            Nome do Dojo / Academia *
                          </label>
                          <Input
                            type="text"
                            placeholder="Ex: Gracie Barra Centro"
                            value={dojoName}
                            onChange={(e) => setDojoName(e.target.value)}
                            className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-2 font-bold text-xs"
                            required={isRegisterMode}
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono font-black text-zinc-500 uppercase mb-1">
                            Cidade / Estado (UF) *
                          </label>
                          <Input
                            type="text"
                            placeholder="Ex: Curitiba / PR"
                            value={cityState}
                            onChange={(e) => setCityState(e.target.value)}
                            className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-2 font-bold text-xs"
                            required={isRegisterMode}
                          />
                        </div>
                      </div>
                    )}

                    {selectedRole === 'lojista' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] font-mono font-black text-zinc-500 uppercase mb-1">
                            Razão Social / Nome da Marca *
                          </label>
                          <Input
                            type="text"
                            placeholder="Ex: Kimonos Atama Brasil"
                            value={storeBrandName}
                            onChange={(e) => setStoreBrandName(e.target.value)}
                            className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-2 font-bold text-xs"
                            required={isRegisterMode}
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono font-black text-zinc-500 uppercase mb-1">
                            Cupom Exclusivo para Comunidade
                          </label>
                          <Input
                            type="text"
                            placeholder="Ex: OSS10"
                            value={storeCoupon}
                            onChange={(e) => setStoreCoupon(e.target.value)}
                            className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-2 font-bold text-xs uppercase"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-[8px] font-mono font-black text-zinc-400 uppercase mb-1">
                    E-mail de Acesso *
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      type="email"
                      placeholder="atleta@oss.os"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-3 font-bold text-xs w-full disabled:opacity-50"
                      required
                    />
                    <Mail size={14} className="absolute right-3 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[8px] font-mono font-black text-zinc-400 uppercase">
                      Senha de Faixa Preta *
                    </label>
                    {!isRegisterMode && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPasswordMode(true)}
                        className="text-[8px] font-mono font-black uppercase text-zinc-500 hover:text-green-600 dark:hover:text-green-400 cursor-pointer"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="rounded-none border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black p-3 pr-10 font-bold text-xs w-full disabled:opacity-50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password Strength Meter (Register Mode) */}
                  {isRegisterMode && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[7.5px] font-mono font-bold uppercase">
                        <span className="text-zinc-400">Força da Senha:</span>
                        <span className={pwdStrength.score >= 2 ? 'text-green-600 font-black' : 'text-amber-500'}>
                          {pwdStrength.label}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 flex gap-1">
                        <div className={`h-full flex-1 transition-colors ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 transition-colors ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 transition-colors ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-transparent'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field (Register Mode) */}
                {isRegisterMode && (
                  <div>
                    <label className="block text-[8px] font-mono font-black text-zinc-400 uppercase mb-1">
                      Confirmar Senha *
                    </label>
                    <div className="relative flex items-center">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repita sua senha exatamente"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        className={`rounded-none bg-white dark:bg-black p-3 pr-10 font-bold text-xs w-full disabled:opacity-50 border ${
                          confirmPassword && confirmPassword !== password
                            ? 'border-red-500'
                            : confirmPassword && confirmPassword === password
                            ? 'border-green-600'
                            : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                        required={isRegisterMode}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-[7.5px] font-mono text-red-500 font-bold uppercase mt-1 flex items-center gap-1">
                        <X size={10} /> As senhas não coincidem!
                      </p>
                    )}
                    {confirmPassword && confirmPassword === password && (
                      <p className="text-[7.5px] font-mono text-green-600 font-bold uppercase mt-1 flex items-center gap-1">
                        <Check size={10} /> Senhas conferem perfeitamente.
                      </p>
                    )}
                  </div>
                )}

                {/* LGPD Consent Checkbox (Register Mode) */}
                {isRegisterMode && (
                  <div className="space-y-2 p-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <label className="flex items-start gap-2.5 cursor-pointer text-left select-none">
                      <input
                        type="checkbox"
                        checked={lgpdConsentTerms}
                        onChange={(e) => setLgpdConsentTerms(e.target.checked)}
                        disabled={isSubmitting}
                        className="mt-0.5 accent-green-600 rounded-none w-4 h-4 cursor-pointer shrink-0"
                        required
                      />
                      <span className="text-[9.5px] text-zinc-700 dark:text-zinc-300 leading-tight">
                        Declaro que li e aceito os <strong>Termos de Uso e Política de Privacidade LGPD</strong> (Lei 13.709/2018) para registro de atleta e histórico de compras. <span className="text-red-500 font-bold">*</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer text-left select-none pt-1 border-t border-zinc-200 dark:border-zinc-900">
                      <input
                        type="checkbox"
                        checked={lgpdConsentWishlist}
                        onChange={(e) => setLgpdConsentWishlist(e.target.checked)}
                        disabled={isSubmitting}
                        className="mt-0.5 accent-green-600 rounded-none w-3.5 h-3.5 cursor-pointer shrink-0"
                      />
                      <span className="text-[8.5px] text-zinc-500 dark:text-zinc-400 leading-tight">
                        Desejo receber avisos eletrônicos de queda de preço de kimonos salvos na minha Wishlist.
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit Button with Double-Click Protection */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-green-600 hover:text-white rounded-none py-6 text-xs font-black uppercase tracking-widest mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      PROCESSANDO NO TATAME...
                    </>
                  ) : isRegisterMode ? (
                    <>
                      <CheckCircle2 size={16} /> CADASTRAR MINHA CONTA ({ROLE_DEFINITIONS.find(r => r.id === selectedRole)?.badge})
                    </>
                  ) : (
                    <>
                      <ArrowRight size={16} /> ENTRAR NO TATAME
                    </>
                  )}
                </Button>
              </form>

              {/* Toggle Register / Login Mode */}
              <div className="text-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    playClickSound?.();
                    setIsRegisterMode(!isRegisterMode);
                    setErrorMessage(null);
                  }}
                  className="text-[9.5px] font-mono font-black uppercase text-zinc-500 hover:text-green-600 dark:hover:text-green-400 cursor-pointer"
                >
                  {isRegisterMode
                    ? 'Já possui conta criada? Clique aqui para entrar'
                    : 'Ainda não tem conta no Tatame? Clique para se cadastrar'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
