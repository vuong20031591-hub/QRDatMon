/**
 * API Test Script for Web Admin
 * Tests backend API endpoints with authentication
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make API requests
async function apiRequest(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

// Test function
function test(name, fn) {
  return async () => {
    try {
      await fn();
      results.passed++;
      results.tests.push({ name, status: 'PASSED' });
      console.log(`✅ PASSED: ${name}`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: 'FAILED', error: error.message });
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}`);
    }
  };
}

// Assert functions
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertStatus(response, expectedStatus) {
  if (response.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.status}. Response: ${JSON.stringify(response.data)}`);
  }
}

// Store tokens for authenticated tests
let accessToken = null;
let testUserId = null;

// ============================================
// TEST CASES
// ============================================

const tests = [
  // 1. Health Check
  test('Health Check - API is running', async () => {
    const response = await apiRequest('GET', '/health');
    assertStatus(response, 200);
    assertEqual(response.data.success, true, 'Health check should return success');
  }),

  // 2. Admin Login with email/password
  test('Auth - Admin Login (email/password)', async () => {
    const response = await apiRequest('POST', '/auth/login', {
      email: 'admin@qrdatmon.com',
      password: '123456'
    });
    assertStatus(response, 200);
    assertEqual(response.data.success, true, 'Admin login should succeed');
    
    // Store token for subsequent tests - handle nested data structure
    accessToken = response.data.accessToken || response.data.data?.accessToken;
    testUserId = response.data.user?.id || response.data.data?.user?.id;
    
    if (!accessToken) {
      throw new Error('No access token received');
    }
    
    // Verify staff role
    const staff = response.data.staff || response.data.data?.staff || response.data.data?.user?.staff;
    if (staff) {
      assertEqual(staff.role, 'admin', 'User should have admin role');
    }
  }),

  // 3. Get Current User
  test('Auth - Get Current User (with token)', async () => {
    if (!accessToken) {
      throw new Error('No access token available - run guest login first');
    }
    
    const response = await apiRequest('GET', '/auth/me', null, accessToken);
    assertStatus(response, 200);
    assertEqual(response.data.success, true, 'Get me should succeed');
  }),

  // 4. Get Menu (Public)
  test('Menu - Get Menu Items (public)', async () => {
    const response = await apiRequest('GET', '/menu');
    assertStatus(response, 200);
    assertEqual(response.data.success, true, 'Get menu should succeed');
  }),

  // 5. Get Categories (Public)
  test('Categories - Get Categories (public)', async () => {
    const response = await apiRequest('GET', '/categories');
    assertStatus(response, 200);
    assertEqual(response.data.success, true, 'Get categories should succeed');
  }),

  // 6. Get Promotions (Public)
  test('Promotions - Get Active Promotions (public)', async () => {
    const response = await apiRequest('GET', '/promotions');
    assertStatus(response, 200);
    assertEqual(response.data.success, true, 'Get promotions should succeed');
  }),

  // 7. Unauthorized Access Test
  test('Auth - Unauthorized access to protected route', async () => {
    const response = await apiRequest('GET', '/orders');
    // Should return 401 without token
    assertStatus(response, 401);
  }),

  // 8. Get Orders (with auth)
  test('Orders - Get Orders (with token)', async () => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    const response = await apiRequest('GET', '/orders/my-session', null, accessToken);
    // Guest users may get 200 or 403 depending on implementation
    if (response.status !== 200 && response.status !== 403) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  }),

  // 9. API Version Check
  test('Health - Get API Version', async () => {
    const response = await apiRequest('GET', '/health/version');
    assertStatus(response, 200);
    assertEqual(response.data.success, true, 'Version check should succeed');
  }),
];

// ============================================
// RUN TESTS
// ============================================

async function runTests() {
  console.log('='.repeat(50));
  console.log('🧪 QRDatMon Web Admin API Tests');
  console.log(`📍 API URL: ${API_BASE_URL}`);
  console.log('='.repeat(50));
  console.log('');

  for (const testFn of tests) {
    await testFn();
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total:  ${results.passed + results.failed}`);
  console.log('');

  if (results.failed > 0) {
    console.log('Failed tests:');
    results.tests
      .filter(t => t.status === 'FAILED')
      .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
