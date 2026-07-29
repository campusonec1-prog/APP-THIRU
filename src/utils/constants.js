export const COLLEGE_INFO = {
  name: 'Thirumalai Engineering College',
  shortName: 'TEC',
  counsellingCode: '1517',
  tagline: 'The Right Place to Enrich Your Career…',
  established: '1999',
  accreditation: ['Anna University Affiliated', 'AICTE Approved', 'ISO 9001:2008 Certified'],
  location: {
    address: 'Krishnapuram Post, Kilambi, Kancheepuram',
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
  }
};

export const UG_PROGRAMS = [
  'Computer Science & Engineering',
  'Civil Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Electronics & Communication Engineering',
  'B.Tech AI & Data Science',
  'Agricultural Engineering',
  'Information Technology'
];

export const PG_PROGRAMS = [
  'MCA',
  'MBA',
  'M.E. Computer Science & Engineering',
  'M.E. Construction Engineering and Management',
  'M.E. Engineering Design',
  'VLSI Design'
];

export const ALL_PROGRAMS = [
  ...UG_PROGRAMS.map(name => ({ name, type: 'UG', duration: '4 Years' })),
  ...PG_PROGRAMS.map(name => ({ name, type: 'PG', duration: name.includes('M.E.') ? '2 Years' : (name === 'MCA' ? '2 Years' : '2 Years') }))
];

export const COMMUNITIES = ['OC', 'BC', 'BCM', 'MBC / DNC', 'SC', 'SCA', 'ST'];
export const RELIGIONS = ['Hinduism', 'Christianity', 'Islam', 'Sikhism', 'Buddhism', 'Jainism', 'Other'];
export const BOARDS = ['State Board (Tamil Nadu)', 'CBSE', 'ICSE', 'Other State Board'];
export const STATES = [
  'Tamil Nadu', 'Puducherry', 'Andhra Pradesh', 'Telangana', 'Karnataka', 
  'Kerala', 'Maharashtra', 'Delhi', 'Other'
];
