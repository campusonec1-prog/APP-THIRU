// Centralized College & Portal Configuration
// Modify values in this single file to update college information across the entire website.

import heroCampusJpg from '../assets/hero-campus.jpg';
import emblemPng from '../assets/emblem.png';
import logoWebp from '../assets/logo.webp';

export const COLLEGE_CONFIG = {
  name: 'Thirumalai Engineering College',
  shortName: 'TEC',
  counsellingCode: '1517',
  codeLabel: 'CODE: 1517',
  tagline: 'The Right Place to Enrich Your Career…',
  established: '1999',
  yearsExcellence: '25+',
  coursesCount: '14+',
  academicYear: '2026-27',
  
  heroHeading: 'Thirumalai Engineering College',
  heroSubtitle: 'Step into a world of engineering and technological excellence at Thirumalai Engineering College, Kanchipuram. Empowering generations of tech leaders with quality education, modern infrastructure, and 100% placement support.',
  portalTitle: 'Applicant Portal',
  portalSubheading: 'Thirumalai Engineering College Online Application Portal 2026-27',
  loginSubheading: 'Thirumalai Engineering College, Kanchipuram (Code: 1517)',
  
  accreditation: [
    'Anna University Affiliated',
    'AICTE Approved',
    'ISO 9001:2008 Certified'
  ],

  location: {
    address: 'Kilambi, Kanchipuram - 631551',
    fullAddress: 'Krishnapuram Post, Kilambi, Kancheepuram',
    pincode: '631551',
    state: 'Tamil Nadu',
    country: 'India',
    mapQuery: 'Thirumalai+Engineering+College+Kanchipuram',
  },

  contact: {
    phones: ['+91 87546 81968', '+91 95974 88677'],
    email: 'tecau1517@gmail.com',
    website: 'https://thirumalaiengg.org',
  },

  socials: {
    facebook: 'https://facebook.com/thirumalaiengg',
    instagram: 'https://instagram.com/thirumalaiengg',
    linkedin: 'https://linkedin.com/school/thirumalaiengg',
    youtube: 'https://youtube.com/@thirumalaiengg',
  },

  images: {
    heroCampus: heroCampusJpg,
    emblem: emblemPng,
    logo: logoWebp,
  }
};

export default COLLEGE_CONFIG;
