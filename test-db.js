const net = require('net');

const HOST = 'db.muicvfhufelyvnqsffcc.supabase.co';
const PORT = 5432;

console.log(`Testing connection to ${HOST}:${PORT}...`);

const socket = new net.Socket();

socket.setTimeout(5000); // 5 second timeout

socket.on('connect', () => {
  console.log('✅ SUCCESS: Connected to Supabase!');
  socket.destroy();
});

socket.on('timeout', () => {
  console.log('❌ FAILED: Connection timed out. Something is blocking the connection.');
  socket.destroy();
});

socket.on('error', (err) => {
  console.log(`❌ FAILED: ${err.message}`);
});

socket.connect(PORT, HOST);
