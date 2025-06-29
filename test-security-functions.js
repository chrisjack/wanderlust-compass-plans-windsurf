// Test script to verify Supabase functions work with new security measures
const SUPABASE_URL = 'https://diphacbvdhfzdqfkobkl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcGhhY2J2ZGhmemRxZmtvYmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NjQ5MzIsImV4cCI6MjA2MTA0MDkzMn0.23OcawUv1A5Vrt_wD0gnHUnSRD4FxoioROLc-WgZPU8';

// Test 1: Test wikivoyage-search with valid input
async function testWikiVoyageSearch() {
  console.log('🧪 Testing wikivoyage-search function...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/wikivoyage-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        query: 'Paris travel guide'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ wikivoyage-search: SUCCESS - Valid query accepted');
      console.log(`   Found ${data.results?.length || 0} results`);
    } else {
      console.log('❌ wikivoyage-search: FAILED -', data.error);
    }
  } catch (error) {
    console.log('❌ wikivoyage-search: ERROR -', error.message);
  }
}

// Test 2: Test wikivoyage-search with invalid input (should be rejected)
async function testWikiVoyageSearchInvalid() {
  console.log('🧪 Testing wikivoyage-search with invalid input...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/wikivoyage-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        query: '' // Empty query should be rejected
      })
    });

    const data = await response.json();
    
    if (!response.ok && data.error) {
      console.log('✅ wikivoyage-search invalid input: SUCCESS - Properly rejected');
      console.log(`   Error: ${data.error}`);
    } else {
      console.log('❌ wikivoyage-search invalid input: FAILED - Should have been rejected');
    }
  } catch (error) {
    console.log('❌ wikivoyage-search invalid input: ERROR -', error.message);
  }
}

// Test 3: Test parse-travel-document with valid input
async function testParseTravelDocument() {
  console.log('🧪 Testing parse-travel-document function...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/parse-travel-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        document: {
          content: 'Flight confirmation for UA123 from SFO to JFK on March 15, 2024',
          fileName: 'test_flight.pdf',
          mimeType: 'application/pdf'
        }
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ parse-travel-document: SUCCESS - Document processed');
      console.log(`   Document type: ${data.documentType}`);
    } else {
      console.log('❌ parse-travel-document: FAILED -', data.error);
    }
  } catch (error) {
    console.log('❌ parse-travel-document: ERROR -', error.message);
  }
}

// Test 4: Test parse-travel-document with oversized content (should be rejected)
async function testParseTravelDocumentOversized() {
  console.log('🧪 Testing parse-travel-document with oversized content...');
  
  try {
    const oversizedContent = 'A'.repeat(60000); // 60KB, over the 50KB limit
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/parse-travel-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        document: {
          content: oversizedContent,
          fileName: 'large_document.pdf',
          mimeType: 'application/pdf'
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok && data.error) {
      console.log('✅ parse-travel-document oversized: SUCCESS - Properly rejected');
      console.log(`   Error: ${data.error}`);
    } else {
      console.log('❌ parse-travel-document oversized: FAILED - Should have been rejected');
    }
  } catch (error) {
    console.log('❌ parse-travel-document oversized: ERROR -', error.message);
  }
}

// Test 5: Test CORS headers
async function testCORSHeaders() {
  console.log('🧪 Testing CORS headers...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/wikivoyage-search`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-site.com',
        'Content-Type': 'application/json',
      }
    });

    const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
    
    if (corsOrigin && corsOrigin !== '*') {
      console.log('✅ CORS: SUCCESS - Properly restricted');
      console.log(`   Allowed origin: ${corsOrigin}`);
    } else {
      console.log('❌ CORS: FAILED - Still allowing wildcard or missing origin');
    }
  } catch (error) {
    console.log('❌ CORS: ERROR -', error.message);
  }
}

// Test 6: Test authentication requirement
async function testAuthenticationRequirement() {
  console.log('🧪 Testing authentication requirement...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/parse-travel-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
      body: JSON.stringify({
        document: {
          content: 'Test content',
          fileName: 'test.pdf'
        }
      })
    });

    if (response.status === 401) {
      console.log('✅ Authentication: SUCCESS - Properly requires authentication');
    } else {
      console.log('❌ Authentication: FAILED - Should require authentication');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Authentication: ERROR -', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Supabase Security Function Tests\n');
  
  await testWikiVoyageSearch();
  console.log('');
  
  await testWikiVoyageSearchInvalid();
  console.log('');
  
  await testParseTravelDocument();
  console.log('');
  
  await testParseTravelDocumentOversized();
  console.log('');
  
  await testCORSHeaders();
  console.log('');
  
  await testAuthenticationRequirement();
  console.log('');
  
  console.log('🏁 Security function tests completed!');
}

// Run the tests
runAllTests().catch(console.error); 