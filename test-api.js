const https = require('https');

const url = 'https://muicvfhufelyvnqsffcc.supabase.co/rest/v1/';

console.log(`Testing API connection to ${url}...`);

https.get(url, (res) => {
  console.log(`✅ SUCCESS: Received status code ${res.statusCode}`);
  console.log('This means your computer can see the Supabase project.');
}).on('error', (err) => {
  console.log(`❌ FAILED: ${err.message}`);
  if (err.code === 'ENOTFOUND') {
    console.log('The domain name cannot be found. Please double-check your project ID.');
  }
});
