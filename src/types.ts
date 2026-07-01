/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Division {
  id: string;
  title: string;
  indonesianTitle: string;
  description: string;
  indonesianDescription: string;
  icon: string; // lucide icon name
  specHighlight: string;
  intensityScore: number; // For technical meter
  glowColor: string; // e.g., 'rgba(0, 255, 136, 0.4)'
  maxStaff?: number;
  hasSubCategory?: boolean;
  subCategories?: string[];
  hasLevels?: boolean;
  levels?: string[];
  hasLecturer?: boolean;
}

export interface RobotMachine {
  id: string;
  name: string;
  category: string;
  specifications: Record<string, string>;
  achievements: string[];
  imageUrl: string;
  year: string;
  batteryLife: string;
  weight: string;
  maxSpeed: string;
  processingPower: string;
}

export interface TimelineEvent {
  phase: string;
  title: string;
  date: string;
  description: string;
  details: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  aspectClassName: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoSvg: string;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  whatsapp: string;
  institution?: string;
  idCardName?: string;
  idCardUrl?: string;
  twibbonName?: string;
  twibbonUrl?: string;
  congenitalDisease?: string;
}

export interface Registration {
  id: string;
  divisionId: string;
  teamName: string;
  leader: {
    name: string;
    email: string;
    whatsapp: string;
    institution: string;
    address?: string;
    congenitalDisease?: string;
    idCardName?: string;
    idCardUrl?: string;
    twibbonName?: string;
    twibbonUrl?: string;
  };
  members: Member[];
  paymentMethod: string;
  paymentStatus: string;
  refCode: string;
  amount: string;
  subCategory?: string;
  level?: string;
  lecturerName?: string;
  lecturerEmail?: string;
  lecturerWhatsapp?: string;
  lecturerIdCardName?: string;
  lecturerIdCardUrl?: string;
  lecturerTwibbonName?: string;
  lecturerTwibbonUrl?: string;
  lecturerCongenitalDisease?: string;
  paymentProofName?: string;
  paymentProofUrl?: string;
}

// Centralized List of Administrator Emails
// You can add more admin emails to this array below to grant them full access
export const ADMIN_EMAILS = [
  'alfarizimuhammadraffa@gmail.com',
  'admin@unj.ac.id',
  'ericadmin@unj.ac.id'
];


