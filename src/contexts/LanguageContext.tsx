"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ES-LA" | "EN-US";

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  welcome: {
    "ES-LA": "¡Inicia sesión en tu cuenta de MVPcode!",
    "EN-US": "Login to your MVPcode account!",
  },
  login_prompt: {
    "ES-LA": "O usa tu correo registrado debajo",
    "EN-US": "Or use your registered email and password below",
  },
  login_google: {
    "ES-LA": "Acceder con Google",
    "EN-US": "Sign in with Google",
  },
  login_email: {
    "ES-LA": "Correo electrónico",
    "EN-US": "Email Address",
  },
  login_password: {
    "ES-LA": "Contraseña",
    "EN-US": "Password",
  },
  login_button: {
    "ES-LA": "Iniciar sesión",
    "EN-US": "Login",
  },
  login_forgot: {
    "ES-LA": "¿Olvidaste tu contraseña?",
    "EN-US": "Forgot your password?",
  },
  login_create: {
    "ES-LA": "Crear una cuenta",
    "EN-US": "Create an account",
  },
  login_role_select: {
    "ES-LA": "Selecciona tu rol para entrar",
    "EN-US": "Select your role to enter",
  },
  role_client: {
    "ES-LA": "Solicitante",
    "EN-US": "Client",
  },
  role_developer: {
    "ES-LA": "Desarrollador",
    "EN-US": "Developer",
  },
  home: {
    "ES-LA": "Inicio",
    "EN-US": "Home",
  },
  explore: {
    "ES-LA": "Explorar",
    "EN-US": "Explore",
  },
  notifications: {
    "ES-LA": "Notificaciones",
    "EN-US": "Notifications",
  },
  my_projects: {
    "ES-LA": "Mis Proyectos",
    "EN-US": "My Projects",
  },
  applications: {
    "ES-LA": "Postulaciones",
    "EN-US": "Applications",
  },
  profile: {
    "ES-LA": "Perfil",
    "EN-US": "Profile",
  },
  logout: {
    "ES-LA": "Cerrar Sesión",
    "EN-US": "Logout",
  },
  post_placeholder: {
    "ES-LA": "¿Qué software necesitas desarrollar?",
    "EN-US": "What software do you need to develop?",
  },
  budget: {
    "ES-LA": "Presupuesto",
    "EN-US": "Budget",
  },
  duration: {
    "ES-LA": "Duración",
    "EN-US": "Duration",
  },
  publish: {
    "ES-LA": "Publicar Proyecto",
    "EN-US": "Publish Project",
  },
  apply: {
    "ES-LA": "Postular",
    "EN-US": "Apply",
  },
  for_you: {
    "ES-LA": "Para ti",
    "EN-US": "For you",
  },
  following: {
    "ES-LA": "Siguiendo",
    "EN-US": "Following",
  },
  explore_empty: {
    "ES-LA": "Próximamente: Descubre nuevos proyectos y talentos.",
    "EN-US": "Coming soon: Discover new projects and talents.",
  },
  notifications_empty: {
    "ES-LA": "No tienes notificaciones por el momento.",
    "EN-US": "You have no notifications at the moment.",
  },
  applications_empty: {
    "ES-LA": "Aún no te has postulado a ningún proyecto.",
    "EN-US": "You haven't applied to any projects yet.",
  },
  no_projects: {
    "ES-LA": "No hay proyectos disponibles por ahora.",
    "EN-US": "No projects available for now.",
  },
  edit_profile: {
    "ES-LA": "Editar perfil",
    "EN-US": "Edit profile",
  },
  save: {
    "ES-LA": "Guardar",
    "EN-US": "Save",
  },
  cancel: {
    "ES-LA": "Cancelar",
    "EN-US": "Cancel",
  },
  name: {
    "ES-LA": "Nombre",
    "EN-US": "Name",
  },
  bio: {
    "ES-LA": "Biografía",
    "EN-US": "Bio",
  },
  certificates: {
    "ES-LA": "Certificados",
    "EN-US": "Certificates",
  },
  role: {
    "ES-LA": "Rol",
    "EN-US": "Role",
  },
  joined: {
    "ES-LA": "Se unió en",
    "EN-US": "Joined on",
  },
  reviews: {
    "ES-LA": "reseñas",
    "EN-US": "reviews",
  },
  location: {
    "ES-LA": "Perú",
    "EN-US": "Peru",
  },
  trends: {
    "ES-LA": "Tendencias en Desarrollo",
    "EN-US": "Development Trends",
  },
  who_to_hire: {
    "ES-LA": "¿Quién contratar?",
    "EN-US": "Who to hire?",
  },
  login_needed_sidebar: {
    "ES-LA": "Inicia sesión para ver recomendaciones personalizadas.",
    "EN-US": "Sign in to see personalized recommendations.",
  },
  project_type: {
    "ES-LA": "Tipo de Proyecto",
    "EN-US": "Project Type",
  },
  unitary: {
    "ES-LA": "Unitario",
    "EN-US": "Unitary",
  },
  group: {
    "ES-LA": "Grupal",
    "EN-US": "Group",
  },
  publication_duration: {
    "ES-LA": "Duración de la publicación",
    "EN-US": "Publication duration",
  },
  payment_method: {
    "ES-LA": "Método de pago",
    "EN-US": "Payment method",
  },
  days: {
    "ES-LA": "días",
    "EN-US": "days"
  },
  select_payment: {
    "ES-LA": "Selecciona método de pago",
    "EN-US": "Select payment method",
  },
  cancel_reason: {
    "ES-LA": "Razón de cancelación",
    "EN-US": "Cancellation reason",
  },
  finalize: {
    "ES-LA": "Finalizar Proyecto",
    "EN-US": "Finalize Project",
  },
  past_projects: {
    "ES-LA": "Proyectos Pasados",
    "EN-US": "Past Projects",
  },
  cancelled_projects: {
    "ES-LA": "Proyectos Cancelados",
    "EN-US": "Cancelled Projects",
  },
  applicants: {
    "ES-LA": "Postulantes",
    "EN-US": "Applicants",
  },
  earnings: {
    "ES-LA": "Ganancias",
    "EN-US": "Earnings",
  },
  project_details: {
    "ES-LA": "Detalles del Proyecto",
    "EN-US": "Project Details",
  },
  category: {
    "ES-LA": "Categoría",
    "EN-US": "Category",
  },
  technologies: {
    "ES-LA": "Tecnologías/Entorno",
    "EN-US": "Technologies/Environment",
  },
  make_post: {
    "ES-LA": "Hacer una publicación",
    "EN-US": "Make a post",
  },
  apply_reason: {
    "ES-LA": "¿Por qué eres el candidato ideal?",
    "EN-US": "Why are you the ideal candidate?",
  },
  web_dev: {
    "ES-LA": "Desarrollo Web",
    "EN-US": "Web Development",
  },
  mobile_dev: {
    "ES-LA": "App Móvil",
    "EN-US": "Mobile App",
  },
  games: {
    "ES-LA": "Videojuegos",
    "EN-US": "Video Games",
  },
  desktop_dev: {
    "ES-LA": "Software de Escritorio",
    "EN-US": "Desktop Software",
  },
  other: {
    "ES-LA": "Otro",
    "EN-US": "Other",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ES-LA");

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
