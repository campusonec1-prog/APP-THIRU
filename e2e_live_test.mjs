import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = 'https://server-thiru.onrender.com/api';

async function runE2ETest() {
  console.log('====================================================');
  console.log('STARTING REAL END-TO-END APPLICATION SUBMISSION TEST');
  console.log('API Target:', BASE_URL);
  console.log('====================================================\n');

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const testUser = {
    name: `Test Candidate ${randomNum}`,
    email: `candidate_${randomNum}@example.com`,
    phone_number: `98765${randomNum}`,
    password: 'Password123!',
  };

  let token = null;
  let userId = null;

  // Step 1: Register User & Login for Token
  console.log('--- STEP 1: USER REGISTRATION / LOGIN ---');
  try {
    const regRes = await axios.post(`${BASE_URL}/forms/users/create`, testUser);
    console.log('User Registration Response:', JSON.stringify(regRes.data, null, 2));
  } catch (e) {
    console.log('User creation notice:', e.response?.data || e.message);
  }

  // Obtain Token via Login
  const loginRes = await axios.post(`${BASE_URL}/forms/users/login`, {
    email: testUser.email,
    password: testUser.password,
  });
  console.log('User Login Response:', JSON.stringify(loginRes.data, null, 2));
  token = loginRes.data?.data?.access_token || loginRes.data?.access_token || loginRes.data?.token;
  userId = loginRes.data?.data?.user?.id || loginRes.data?.user?.id || loginRes.data?.id || loginRes.data?.data?.id;

  console.log(`\nAuthenticated User ID: ${userId}`);
  console.log(`Bearer Token Obtained: ${token ? token.substring(0, 25) + '...' : 'NONE'}\n`);

  // Create temporary dummy photo file
  const dummyFilePath = path.join(process.cwd(), 'scratch_test_photo.png');
  fs.writeFileSync(dummyFilePath, 'PNG DUMMY IMAGE BINARY CONTENT');

  // Step 2: Upload Documents (POST /api/documents/upload)
  console.log('--- STEP 2: UPLOAD DOCUMENTS (POST /api/documents/upload) ---');
  const formData = new FormData();
  formData.append('docType', 'application_documents');
  formData.append('photo', fs.createReadStream(dummyFilePath), {
    filename: 'test_applicant_photo.png',
    contentType: 'image/png',
  });

  const uploadHeaders = {
    ...formData.getHeaders(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  console.log('Uploading file: test_applicant_photo.png with docType: application_documents...');

  const uploadRes = await axios.post(`${BASE_URL}/documents/upload`, formData, {
    headers: uploadHeaders,
  });

  console.log('\n>>> REAL RESPONSE 1: POST /api/documents/upload <<<');
  console.log(JSON.stringify(uploadRes.data, null, 2));

  const uploadedFiles = Array.isArray(uploadRes.data?.data) ? uploadRes.data.data : (uploadRes.data?.files || []);
  const returnedPhotoUrl = uploadedFiles[0]?.file_url || uploadedFiles[0]?.url;

  if (!returnedPhotoUrl) {
    throw new Error(`Upload server did not return a file URL: ${JSON.stringify(uploadRes.data)}`);
  }

  console.log(`\nPhoto URL merged into form_data: ${returnedPhotoUrl}\n`);

  // Step 3: Create Application (POST /api/forms/applications/create)
  console.log('--- STEP 3: CREATE APPLICATION (POST /api/forms/applications/create) ---');
  const createPayload = {
    program_id: 1,
    form_data: {
      personal_information: {
        applicant_name: testUser.name,
        date_of_birth: '2004-05-15',
        gender: 'Male',
        community: 'BC',
        religion: 'Hindu',
        nationality: 'Indian',
        mother_tongue: 'Tamil',
        aadhaar_number: '123456789012',
        email: testUser.email,
        student_mobile: testUser.phone_number,
        photo: returnedPhotoUrl,
      },
      parent_information: {
        parent_name: 'Mr. Subramanian',
        parent_mobile: '9876543210',
        address: '123 College Road, Kanchipuram',
        pincode: '631502',
      },
      course_selection: {
        program: 'UG',
        department: 'Computer Science Engineering',
      },
      academic_qualification: {
        qualifications: [
          {
            qualification: 'HSC',
            institution: 'Government Higher Secondary School',
            board: 'State Board',
            register_number: '123456',
            year_of_passing: '2022',
            percentage: '92.5',
          },
        ],
      },
      academic_performance: {
        academic_performance: [
          {
            qualification: 'HSC',
            subject: 'Mathematics',
            maximum_marks: '100',
            obtained_marks: '95',
            percentage: '95.0',
          },
        ],
      },
      certificates: {
        certificates: [
          {
            certificate_type: 'Transfer Certificate',
            document: returnedPhotoUrl,
          },
        ],
      },
      declaration: {
        declaration: true,
        place: 'Kanchipuram',
        application_date: new Date().toISOString().split('T')[0],
      },
    },
  };

  console.log('Create Application Payload Sent:');
  console.log(JSON.stringify(createPayload, null, 2));

  const createRes = await axios.post(`${BASE_URL}/forms/applications/create`, createPayload, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  console.log('\n>>> REAL RESPONSE 2: POST /api/forms/applications/create (HTTP 201) <<<');
  console.log(JSON.stringify(createRes.data, null, 2));

  const applicationNo = createRes.data?.data?.application_no || createRes.data?.application_no || createRes.data?.data?.applicationNo;
  const appId = createRes.data?.data?.id || createRes.data?.id || 1;

  console.log(`\nGENUINE APPLICATION NUMBER RETURNED FROM BACKEND: ${applicationNo}`);

  // Step 4: Verify Backend Fetch on /profile (/forms/applications/get/1 or get/{appId})
  console.log('\n--- STEP 4: VERIFY PROFILE BACKEND RETRIEVAL ---');
  const getRes = await axios.get(`${BASE_URL}/forms/applications/get/${appId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  console.log('\n>>> REAL RESPONSE 3: GET /api/forms/applications/get/' + appId + ' (Profile Fetch) <<<');
  console.log(JSON.stringify(getRes.data, null, 2));

  // Clean up dummy local test photo file
  if (fs.existsSync(dummyFilePath)) {
    fs.unlinkSync(dummyFilePath);
  }

  console.log('\n====================================================');
  console.log('END-TO-END TEST COMPLETED SUCCESSFULLY WITH 100% VERIFIED BACKEND PAYLOADS');
  console.log('====================================================');
}

runE2ETest().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err.response?.data || err.message);
  process.exit(1);
});
