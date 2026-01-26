import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.agenda': 'Agenda',
    'nav.properties': 'Properties',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview',
    'dashboard.todayJobs': "Today's Jobs",
    'dashboard.noJobsToday': 'No jobs scheduled for today',
    'dashboard.upcomingJobs': 'Upcoming Jobs',
    'dashboard.greeting': 'Hello',
    'dashboard.startJob': 'Start',
    'dashboard.viewJob': 'View',
    'dashboard.goodMorning': 'Good Morning',
    'dashboard.goodAfternoon': 'Good Afternoon',
    'dashboard.goodEvening': 'Good Evening',
    'dashboard.active': 'Active',
    'dashboard.scheduled': 'Scheduled',
    'dashboard.done': 'Done',
    
    // Agenda
    'agenda.title': 'Agenda',
    'agenda.subtitle': 'Schedule',
    'agenda.today': 'Today',
    'agenda.month': 'Month',
    'agenda.week': 'Week',
    'agenda.day': 'Day',
    'agenda.addJob': 'Add Job',
    'agenda.noJobs': 'No jobs scheduled',
    
    // Properties
    'properties.title': 'Properties',
    'properties.subtitle': 'Manage Locations',
    'properties.addProperty': 'Add Property',
    'properties.noProperties': 'No properties found',
    'properties.bedrooms': 'Bedrooms',
    'properties.bathrooms': 'Bathrooms',
    'properties.searchPlaceholder': 'Search properties...',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Account',
    'settings.earnings': 'Earnings History',
    'settings.earningsDesc': 'View your income',
    'settings.team': 'Team',
    'settings.addMember': 'Add Member',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Manage alerts',
    'settings.privacy': 'Privacy & Security',
    'settings.privacyDesc': 'Account protection',
    'settings.help': 'Help & Support',
    'settings.helpDesc': 'Get assistance',
    'settings.language': 'Language',
    'settings.languageDesc': 'Choose your language',
    'settings.logout': 'Log Out',
    
    // Login
    'login.welcome': 'Welcome',
    'login.join': 'Join',
    'login.signIn': 'Sign in to continue',
    'login.createWorkspace': 'Create your workspace',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Sign In',
    'login.createAccount': 'Create Account',
    'login.loading': 'Loading...',
    'login.noAccount': "Don't have an account? Sign Up",
    'login.hasAccount': 'Already have an account? Sign In',
    
    // Execution
    'execution.beforePhotos': 'Before Photos',
    'execution.checklist': 'Checklist',
    'execution.inventory': 'Inventory Check',
    'execution.afterPhotos': 'After Photos',
    'execution.damages': 'Damage Report',
    'execution.summary': 'Summary',
    'execution.complete': 'Complete Job',
    'execution.cancel': 'Cancel',
    'execution.next': 'Next',
    'execution.back': 'Back',
    'execution.takePhoto': 'Take Photo',
    'execution.uploadPhoto': 'Upload Photo',
    
    // Job Status
    'status.scheduled': 'Scheduled',
    'status.inProgress': 'In Progress',
    'status.completed': 'Completed',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.back': 'Back',
    
    // Finance
    'finance.title': 'Earnings',
    'finance.subtitle': 'History',
    'finance.total': 'Total Earnings',
    'finance.thisMonth': 'This Month',
    'finance.jobs': 'Jobs',
    
    // Job Form
    'jobForm.title': 'New Job',
    'jobForm.property': 'Property',
    'jobForm.date': 'Date',
    'jobForm.time': 'Time',
    'jobForm.assignTo': 'Assign To',
    'jobForm.notes': 'Notes',
    
    // Job Modal
    'jobModal.title': 'Schedule New Job',
    'jobModal.description': 'Create a new cleaning job with property and time details.',
    'jobModal.create': 'Create Job',
    
    // Property Modal
    'propertyModal.title': 'Add New Property',
    'propertyModal.photo': 'Property Photo',
    'propertyModal.addPhoto': 'Add Photo',
    'propertyModal.basicInfo': 'Basic Information',
    'propertyModal.name': 'Property Name',
    'propertyModal.address': 'Address',
    'propertyModal.type': 'Type',
    'propertyModal.status': 'Status',
    'propertyModal.serviceType': 'Service Type',
    'propertyModal.propertyDetails': 'Property Details',
    'propertyModal.beds': 'Beds',
    'propertyModal.baths': 'Baths',
    'propertyModal.sqft': 'Sqft',
    'propertyModal.basePrice': 'Base Price',
    'propertyModal.accessInfo': 'Access Information',
    'propertyModal.accessCode': 'Access Code',
    'propertyModal.wifiPassword': 'WiFi Password',
    'propertyModal.suppliesLocation': 'Supplies Location',
    'propertyModal.notes': 'Notes',
    'propertyModal.specialInstructions': 'Special Instructions',
    'propertyModal.addProperty': 'Add Property',
    'propertyModal.addedTitle': 'Property Added',
    'propertyModal.addedDescription': '{name} has been added successfully.',
  },
  pt: {
    // Navigation
    'nav.dashboard': 'Painel',
    'nav.agenda': 'Agenda',
    'nav.properties': 'Propriedades',
    'nav.settings': 'Configurações',
    
    // Dashboard
    'dashboard.title': 'Painel',
    'dashboard.subtitle': 'Visão Geral',
    'dashboard.todayJobs': 'Trabalhos de Hoje',
    'dashboard.noJobsToday': 'Nenhum trabalho agendado para hoje',
    'dashboard.upcomingJobs': 'Próximos Trabalhos',
    'dashboard.greeting': 'Olá',
    'dashboard.startJob': 'Iniciar',
    'dashboard.viewJob': 'Ver',
    'dashboard.goodMorning': 'Bom Dia',
    'dashboard.goodAfternoon': 'Boa Tarde',
    'dashboard.goodEvening': 'Boa Noite',
    'dashboard.active': 'Ativos',
    'dashboard.scheduled': 'Agendados',
    'dashboard.done': 'Concluídos',
    
    // Agenda
    'agenda.title': 'Agenda',
    'agenda.subtitle': 'Cronograma',
    'agenda.today': 'Hoje',
    'agenda.month': 'Mês',
    'agenda.week': 'Semana',
    'agenda.day': 'Dia',
    'agenda.addJob': 'Adicionar Trabalho',
    'agenda.noJobs': 'Nenhum trabalho agendado',
    
    // Properties
    'properties.title': 'Propriedades',
    'properties.subtitle': 'Gerenciar Locais',
    'properties.addProperty': 'Adicionar Propriedade',
    'properties.noProperties': 'Nenhuma propriedade encontrada',
    'properties.bedrooms': 'Quartos',
    'properties.bathrooms': 'Banheiros',
    'properties.searchPlaceholder': 'Buscar propriedades...',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.subtitle': 'Conta',
    'settings.earnings': 'Histórico de Ganhos',
    'settings.earningsDesc': 'Veja sua renda',
    'settings.team': 'Equipe',
    'settings.addMember': 'Adicionar Membro',
    'settings.notifications': 'Notificações',
    'settings.notificationsDesc': 'Gerenciar alertas',
    'settings.privacy': 'Privacidade e Segurança',
    'settings.privacyDesc': 'Proteção da conta',
    'settings.help': 'Ajuda e Suporte',
    'settings.helpDesc': 'Obter assistência',
    'settings.language': 'Idioma',
    'settings.languageDesc': 'Escolha seu idioma',
    'settings.logout': 'Sair',
    
    // Login
    'login.welcome': 'Bem-vindo',
    'login.join': 'Cadastrar',
    'login.signIn': 'Entre para continuar',
    'login.createWorkspace': 'Crie seu espaço de trabalho',
    'login.email': 'E-mail',
    'login.password': 'Senha',
    'login.submit': 'Entrar',
    'login.createAccount': 'Criar Conta',
    'login.loading': 'Carregando...',
    'login.noAccount': 'Não tem uma conta? Cadastre-se',
    'login.hasAccount': 'Já tem uma conta? Entre',
    
    // Execution
    'execution.beforePhotos': 'Fotos Antes',
    'execution.checklist': 'Lista de Verificação',
    'execution.inventory': 'Verificar Inventário',
    'execution.afterPhotos': 'Fotos Depois',
    'execution.damages': 'Relatório de Danos',
    'execution.summary': 'Resumo',
    'execution.complete': 'Concluir Trabalho',
    'execution.cancel': 'Cancelar',
    'execution.next': 'Próximo',
    'execution.back': 'Voltar',
    'execution.takePhoto': 'Tirar Foto',
    'execution.uploadPhoto': 'Enviar Foto',
    
    // Job Status
    'status.scheduled': 'Agendado',
    'status.inProgress': 'Em Andamento',
    'status.completed': 'Concluído',
    
    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.add': 'Adicionar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.all': 'Todos',
    'common.back': 'Voltar',
    
    // Finance
    'finance.title': 'Ganhos',
    'finance.subtitle': 'Histórico',
    'finance.total': 'Ganhos Totais',
    'finance.thisMonth': 'Este Mês',
    'finance.jobs': 'Trabalhos',
    
    // Job Form
    'jobForm.title': 'Novo Trabalho',
    'jobForm.property': 'Propriedade',
    'jobForm.date': 'Data',
    'jobForm.time': 'Horário',
    'jobForm.assignTo': 'Atribuir A',
    'jobForm.notes': 'Observações',
    
    // Job Modal
    'jobModal.title': 'Agendar Novo Trabalho',
    'jobModal.description': 'Crie um novo trabalho de limpeza com detalhes da propriedade e horário.',
    'jobModal.create': 'Criar Trabalho',
    
    // Property Modal
    'propertyModal.title': 'Adicionar Nova Propriedade',
    'propertyModal.photo': 'Foto da Propriedade',
    'propertyModal.addPhoto': 'Adicionar Foto',
    'propertyModal.basicInfo': 'Informações Básicas',
    'propertyModal.name': 'Nome da Propriedade',
    'propertyModal.address': 'Endereço',
    'propertyModal.type': 'Tipo',
    'propertyModal.status': 'Status',
    'propertyModal.serviceType': 'Tipo de Serviço',
    'propertyModal.propertyDetails': 'Detalhes da Propriedade',
    'propertyModal.beds': 'Quartos',
    'propertyModal.baths': 'Banheiros',
    'propertyModal.sqft': 'M²',
    'propertyModal.basePrice': 'Preço Base',
    'propertyModal.accessInfo': 'Informações de Acesso',
    'propertyModal.accessCode': 'Código de Acesso',
    'propertyModal.wifiPassword': 'Senha WiFi',
    'propertyModal.suppliesLocation': 'Local dos Suprimentos',
    'propertyModal.notes': 'Notas',
    'propertyModal.specialInstructions': 'Instruções Especiais',
    'propertyModal.addProperty': 'Adicionar Propriedade',
    'propertyModal.addedTitle': 'Propriedade Adicionada',
    'propertyModal.addedDescription': '{name} foi adicionada com sucesso.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
