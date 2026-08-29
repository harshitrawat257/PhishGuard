import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser, getMe } from '../services/api';

const AuthContext = createContext();

export const authTranslations = {
  en: {
    welcomeBack: "Welcome back",
    loginSubtitle: "Log in to continue using PhishGuard AI.",
    createAccountTitle: "Create your account",
    signupSubtitle: "Create an account to save your security scans and analysis history.",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    createPasswordPlaceholder: "Create a password",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    loginBtn: "Log In",
    loggingInBtn: "Logging in...",
    createAccountBtn: "Create Account",
    creatingAccountBtn: "Creating Account...",
    guestBtn: "Continue as Guest",
    noAccountPrompt: "Don't have an account?",
    alreadyAccountPrompt: "Already have an account?",
    invalidEmailError: "Enter a valid email address.",
    passwordRequiredError: "Password is required.",
    passwordsMatchError: "Passwords do not match.",
    passwordMinError: "Password must be at least 8 characters.",
    nameRequiredError: "Full name is required.",
    loginFailError: "Incorrect email or password.",
    networkError: "Unable to connect right now. Please try again.",
    benefitsHeading: "Detect. Explain. Protect.",
    benefitsCopy: "Analyze suspicious links, messages, QR codes, and phishing indicators before taking action.",
    benefit1: "✓ Explainable Risk Scores",
    benefit2: "✓ URL & Message Analysis",
    benefit3: "✓ Privacy-Focused Security Checks",
  },
  hi: {
    welcomeBack: "वापसी पर स्वागत है",
    loginSubtitle: "PhishGuard AI का उपयोग जारी रखने के लिए लॉग इन करें।",
    createAccountTitle: "नया अकाउंट बनाएं",
    signupSubtitle: "अपने सुरक्षा स्कैन और विश्लेषण इतिहास को सहेजने के लिए एक अकाउंट बनाएं।",
    fullNameLabel: "पूरा नाम",
    fullNamePlaceholder: "आपका नाम",
    emailLabel: "ईमेल",
    emailPlaceholder: "you@example.com",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    createPasswordPlaceholder: "पासवर्ड बनाएं",
    confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
    confirmPasswordPlaceholder: "पासवर्ड दोबारा दर्ज करें",
    loginBtn: "लॉग इन करें",
    loggingInBtn: "लॉग इन हो रहा है...",
    createAccountBtn: "अकाउंट बनाएं",
    creatingAccountBtn: "अकाउंट बन रहा है...",
    guestBtn: "अतिथि के रूप में जारी रखें",
    noAccountPrompt: "अकाउंट नहीं है?",
    alreadyAccountPrompt: "पहले से ही एक अकाउंट है?",
    invalidEmailError: "एक मान्य ईमेल पता दर्ज करें।",
    passwordRequiredError: "पासवर्ड आवश्यक है।",
    passwordsMatchError: "पासवर्ड मेल नहीं खाते।",
    passwordMinError: "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।",
    nameRequiredError: "पूरा नाम आवश्यक है।",
    loginFailError: "गलत ईमेल या पासवर्ड।",
    networkError: "अभी कनेक्ट करने में असमर्थ। कृपया पुनः प्रयास करें।",
    benefitsHeading: "जांचें. समझें. सुरक्षित रहें.",
    benefitsCopy: "कार्रवाई करने से पहले संदिग्ध लिंक, संदेश, क्यूआर कोड और फ़िशिंग संकेतकों का विश्लेषण करें।",
    benefit1: "✓ पारदर्शी जोखिम स्कोर",
    benefit2: "✓ यूआरएल और मैसेज स्कैनिंग",
    benefit3: "✓ गोपनीयता-केंद्रित सुरक्षा जांच",
  },
  hinglish: {
    welcomeBack: "Welcome back",
    loginSubtitle: "PhishGuard AI use karne ke liye login karein.",
    createAccountTitle: "Naya Account Banayein",
    signupSubtitle: "Apne security scans aur history save karne ke liye account banayein.",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Aapka name",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Password enter karein",
    createPasswordPlaceholder: "Password banayein",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Password confirm karein",
    loginBtn: "Login Karein",
    loggingInBtn: "Logging in...",
    createAccountBtn: "Account Banayein",
    creatingAccountBtn: "Account ban raha hai...",
    guestBtn: "Guest ke roop mein continue karein",
    noAccountPrompt: "Account nahi hai?",
    alreadyAccountPrompt: "Pahle se account hai?",
    invalidEmailError: "Valid email address enter karein.",
    passwordRequiredError: "Password required hai.",
    passwordsMatchError: "Passwords match nahi kar rahe.",
    passwordMinError: "Password kam se kam 8 characters ka hona chahiye.",
    nameRequiredError: "Full name required hai.",
    loginFailError: "Incorrect email ya password.",
    networkError: "Abhi connect nahi ho pa raha. Try again karein.",
    benefitsHeading: "Detect. Explain. Protect.",
    benefitsCopy: "Action lene se pehle suspicious links, messages, aur QR codes detect karein.",
    benefit1: "✓ Clear Explainable Risk Scores",
    benefit2: "✓ URL & Message Analysis",
    benefit3: "✓ Privacy-Focused Security Checks",
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('phishguard_token') || null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('phishguard_guest') === 'true');
  const [lang, setLangState] = useState(() => localStorage.getItem('phishguard_lang') || 'en');
  const [loading, setLoading] = useState(true);

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('phishguard_lang', newLang);
  };

  const setGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem('phishguard_guest', 'true');
  };

  const clearGuestMode = () => {
    setIsGuest(false);
    localStorage.removeItem('phishguard_guest');
  };

  // Restore user session on startup
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getMe();
        setUser(userData);
        clearGuestMode();
        if (userData.preferred_language) {
          setLang(userData.preferred_language);
        }
      } catch (err) {
        console.error('Session expired or invalid token');
        localStorage.removeItem('phishguard_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    localStorage.setItem('phishguard_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    clearGuestMode();
    if (res.user.preferred_language) {
      setLang(res.user.preferred_language);
    }
    return res;
  };

  const signup = async (name, email, password, preferred_language = lang) => {
    const res = await signupUser(name, email, password, preferred_language);
    localStorage.setItem('phishguard_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    clearGuestMode();
    if (res.user.preferred_language) {
      setLang(res.user.preferred_language);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('phishguard_token');
    clearGuestMode();
    setToken(null);
    setUser(null);
  };

  const t = authTranslations[lang] || authTranslations.en;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isGuest,
        setGuestMode,
        clearGuestMode,
        loading,
        lang,
        setLang,
        t,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
