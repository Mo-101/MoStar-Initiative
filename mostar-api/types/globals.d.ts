interface Window {
  // Auth functions
  togglePassword: (id: string) => void;
  closeCharacterEyes: () => void;
  openCharacterEyes: () => void;
  showLogin: () => void;
  showRegister: () => void;
  register: () => void;
  login: () => void;
  logout: () => void;
  
  // AI service functions
  generateAI: () => void;
  getClimateData: () => void;
  purchaseCredits: (plan: string) => void;
}
