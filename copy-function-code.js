import fs from 'fs';
import { exec } from 'child_process';

// Function to copy text to clipboard (macOS)
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    const process = exec('pbcopy', (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    process.stdin.write(text);
    process.stdin.end();
  });
}

// Function to read and copy function code
async function copyFunctionCode(functionName) {
  try {
    const filePath = `supabase/functions/${functionName}/index.ts`;
    const code = fs.readFileSync(filePath, 'utf8');
    
    await copyToClipboard(code);
    console.log(`✅ ${functionName} code copied to clipboard!`);
    console.log(`📋 Ready to paste into Supabase dashboard`);
    console.log(`📏 Code length: ${code.length} characters\n`);
    
    return code;
  } catch (error) {
    console.error(`❌ Error copying ${functionName}:`, error.message);
  }
}

// List of functions to copy
const functions = [
  'wikivoyage-search',
  'parse-travel-document', 
  'flight-monitor',
  'handle-travel-email',
  'email-webhook'
];

async function copyAllFunctions() {
  console.log('🚀 Copying Supabase function code to clipboard...\n');
  
  for (const func of functions) {
    console.log(`📋 Copying ${func}...`);
    await copyFunctionCode(func);
    
    // Wait a moment between copies
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 All functions copied!');
  console.log('\n📝 Next steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project: diphacbvdhfzdqfkobkl');
  console.log('3. Navigate to Edge Functions');
  console.log('4. Update each function with the copied code');
  console.log('5. Run the test script: node test-security-functions.js');
}

// Run the script
copyAllFunctions().catch(console.error); 