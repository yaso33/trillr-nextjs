
import https from 'https';

const APP_URL = process.env.APP_URL || 'https://yaso-app.onrender.com';

const ping = () => {
  console.log(`[${new Date().toISOString()}] Pinging ${APP_URL} to keep it alive...`);
  
  https.get(APP_URL, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      console.log(`✅ Ping successful! Status: ${res.statusCode}. App is awake.`);
    } else {
      console.warn(`⚠️ Ping resulted in status: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`❌ Error pinging the app: ${err.message}`);
  });
};

// Ping immediately and then every 14 minutes
ping();
setInterval(ping, 14 * 60 * 1000);

console.log('✅ Keep-alive service started. Pinging every 14 minutes.');
