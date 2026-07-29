export const INITIAL_MOCK_USER = {
  id: 'usr_8921',
  fullName: 'Karthik Raja S',
  email: 'karthik.tec2026@gmail.com',
  mobile: '9876543210',
  token: 'mock-jwt-token-tec-1517-xyz',
};

export const INITIAL_MOCK_APPLICATION = {
  applicationId: 'TEC-2026-8942',
  status: 'Under Review', // 'Submitted' | 'Under Review' | 'Approved' | 'Rejected'
  submittedAt: '2026-07-28T14:30:00Z',
  feePaid: false,
  amount: 500,
  personalDetails: {
    fullName: 'Karthik Raja S',
    dob: '2005-04-14',
    gender: 'Male',
    nationality: 'Indian',
    religion: 'Hinduism',
    community: 'BC',
    caste: 'Mudaliar',
    aadharNo: '789012345678',
  },
  contactDetails: {
    address: '14, Temple Street, Kanchipuram',
    city: 'Kanchipuram',
    district: 'Kancheepuram',
    state: 'Tamil Nadu',
    pincode: '631501',
    mobile: '9876543210',
    email: 'karthik.tec2026@gmail.com',
    parentName: 'Sundaram S',
    parentMobile: '9443322110',
  },
  academicDetails: {
    tenthBoard: 'State Board (Tamil Nadu)',
    tenthSchool: 'St. Mary Higher Secondary School',
    tenthYear: '2022',
    tenthPercentage: 89.5,
    twelfthBoard: 'State Board (Tamil Nadu)',
    twelfthSchool: 'St. Mary Higher Secondary School',
    twelfthYear: '2024',
    twelfthPercentage: 92.4,
    physicsMarks: 94,
    chemistryMarks: 90,
    mathsMarks: 96,
    cutoffScore: 188.0, // Maths + (Physics/2) + (Chemistry/2) = 96 + 47 + 45 = 188.0
  },
  programSelection: {
    degreeLevel: 'UG',
    preference1: 'Computer Science & Engineering',
    preference2: 'B.Tech AI & Data Science',
    preference3: 'Information Technology',
  },
  entranceDetails: {
    counsellingCode: '1517',
    tneaAppNo: 'TNEA2026-98124',
    entranceRank: '14205',
  },
  documents: {
    doc10th: { name: '10th_Marksheet_Karthik.pdf', uploadedAt: '2026-07-28' },
    doc12th: { name: '12th_Marksheet_Karthik.pdf', uploadedAt: '2026-07-28' },
    docTransferCert: { name: 'TC_Karthik.pdf', uploadedAt: '2026-07-28' },
    docCommunityCert: { name: 'Community_Cert.pdf', uploadedAt: '2026-07-28' },
    docAadhar: { name: 'Aadhar_Karthik.pdf', uploadedAt: '2026-07-28' },
    docPhoto: { name: 'Passport_Photo.jpg', uploadedAt: '2026-07-28' },
  }
};
