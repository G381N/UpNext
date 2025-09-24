import {
    Activity,
    Briefcase,
    CheckSquare,
    Code,
    CreditCard,
    DollarSign,
    FileText,
    Gift,
    GraduationCap,
    Heart,
    Home,
    MessageCircle,
    ShoppingBag,
    ShoppingCart,
    Star,
    Tag,
    Users,
    type LucideIcon,
  } from 'lucide-react';
  
  export const iconLibrary: { [key: string]: LucideIcon } = {
    Activity,
    Briefcase,
    CheckSquare,
    Code,
    CreditCard,
    DollarSign,
    FileText,
    Gift,
    GraduationCap,
    Heart,
    Home,
    MessageCircle,
    ShoppingBag,
    ShoppingCart,
    Star,
    Tag,
    Users,
  };
  
  export const iconNames = Object.keys(iconLibrary);
  
  export const getIcon = (name: string): LucideIcon => {
    return iconLibrary[name] || FileText;
  };
  