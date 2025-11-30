/**
 * WhatsApp Server menggunakan @open-wa/wa-automate
 * 
 * Cara menjalankan lokal:
 * 1. cd server
 * 2. npm install
 * 3. npm start
 * 4. Scan QR Code yang muncul
 * 
 * Deploy ke Railway:
 * 1. Push folder server ke GitHub
 * 2. Connect ke Railway
 * 3. Deploy otomatis
 */

const { create } = require('@open-wa/wa-automate');
const express = require('express');
const cors = require('cors');

const app = express();

// CORS - Allow all origins for API access
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let waClient = null;
let isReady = false;
let qrCode = null;

// Inisialisasi WhatsApp Client
async function startWhatsApp() {
  try {
    console.log('🚀 Starting WhatsApp client...');
    
    // Detect if running on Railway/production
    const isProduction = process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';
    
    const config = {
      sessionId: 'koperasi-wa',
      multiDevice: true,
      authTimeout: 60,
      blockCrashLogs: true,
      disableSpins: true,
      headless: true,
      hostNotificationLang: 'id',
      logConsole: false,
      popup: false,
      qrTimeout: 0,
      
      // QR Code handler
      qrCallback: (qr) => {
        qrCode = qr;
        console.log('📱 QR Code ready! Scan dengan WhatsApp Anda.');
        console.log(`   Buka /qr endpoint untuk lihat QR di browser`);
      },
      
      // Session saved
      sessionDataPath: './wa-session',
    };

    // Add Chromium path for Railway/production
    if (isProduction) {
      config.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser';
      config.args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ];
    }
    
    waClient = await create(config);

    // Event handlers
    waClient.onStateChanged((state) => {
      console.log('📊 State changed:', state);
      if (state === 'CONNECTED') {
        isReady = true;
        qrCode = null;
        console.log('✅ WhatsApp connected!');
      }
    });

    waClient.onAnyMessage((message) => {
      console.log('📨 Message from:', message.from);
    });

    isReady = true;
    console.log('✅ WhatsApp client ready!');
    
  } catch (error) {
    console.error('❌ Error starting WhatsApp:', error);
  }
}

// ============ API ENDPOINTS ============

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    ready: isReady,
    hasQR: !!qrCode,
    message: isReady ? 'WhatsApp connected' : 'Waiting for QR scan'
  });
});

// Get QR Code
app.get('/qr', (req, res) => {
  if (qrCode) {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Scan QR WhatsApp</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh;
              background: linear-gradient(135deg, #25D366, #128C7E);
              margin: 0;
              color: white;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
            }
            h1 { color: #128C7E; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 20px; }
            img { max-width: 300px; border-radius: 10px; }
            .refresh { 
              margin-top: 20px; 
              padding: 12px 24px; 
              background: #25D366; 
              color: white; 
              border: none; 
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
            }
          </style>
          <meta http-equiv="refresh" content="30">
        </head>
        <body>
          <div class="card">
            <h1>📱 Scan QR Code</h1>
            <p>Buka WhatsApp > Menu > Linked Devices > Link a Device</p>
            <img src="${qrCode}" alt="QR Code"/>
            <br/>
            <button class="refresh" onclick="location.reload()">🔄 Refresh</button>
          </div>
        </body>
      </html>
    `);
  } else if (isReady) {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>WhatsApp Connected</title></head>
        <body style="font-family: Arial; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #25D366;">
          <div style="background: white; padding: 40px; border-radius: 20px; text-align: center;">
            <h1>✅ WhatsApp Terhubung!</h1>
            <p>Anda dapat mengirim pesan sekarang.</p>
          </div>
        </body>
      </html>
    `);
  } else {
    res.send('Waiting for QR code...');
  }
});

// Send message to single number
app.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!isReady || !waClient) {
      return res.status(503).json({ 
        success: false, 
        error: 'WhatsApp not ready. Please scan QR code first.' 
      });
    }
    
    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone and message are required' 
      });
    }
    
    // Format phone number: 08xxx -> 628xxx@c.us
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone;
    }
    formattedPhone = formattedPhone + '@c.us';
    
    // Send message
    const result = await waClient.sendText(formattedPhone, message);
    
    console.log(`✉️ Message sent to ${phone}`);
    res.json({ success: true, messageId: result });
    
  } catch (error) {
    console.error('❌ Send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message to multiple numbers
app.post('/send-bulk', async (req, res) => {
  try {
    const { contacts, message } = req.body;
    
    if (!isReady || !waClient) {
      return res.status(503).json({ 
        success: false, 
        error: 'WhatsApp not ready' 
      });
    }
    
    if (!contacts || !Array.isArray(contacts) || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contacts array and message are required' 
      });
    }
    
    const results = [];
    
    for (const contact of contacts) {
      try {
        let formattedPhone = contact.phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '62' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('62')) {
          formattedPhone = '62' + formattedPhone;
        }
        formattedPhone = formattedPhone + '@c.us';
        
        // Personalize message if name provided
        let personalizedMessage = message;
        if (contact.name) {
          personalizedMessage = message.replace('{name}', contact.name);
        }
        
        await waClient.sendText(formattedPhone, personalizedMessage);
        results.push({ phone: contact.phone, success: true });
        
        // Delay to avoid spam detection (2-5 seconds random)
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        
      } catch (err) {
        results.push({ phone: contact.phone, success: false, error: err.message });
      }
    }
    
    console.log(`✉️ Bulk send completed: ${results.filter(r => r.success).length}/${contacts.length} success`);
    res.json({ success: true, results });
    
  } catch (error) {
    console.error('❌ Bulk send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if number exists on WhatsApp
app.post('/check-number', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!isReady || !waClient) {
      return res.status(503).json({ success: false, error: 'WhatsApp not ready' });
    }
    
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    }
    formattedPhone = formattedPhone + '@c.us';
    
    const exists = await waClient.isRegisteredUser(formattedPhone);
    res.json({ success: true, exists, phone });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║          WhatsApp Server for Koperasi             ║
╠═══════════════════════════════════════════════════╣
║  Server running on port: ${PORT}                      ║
║  Environment: ${process.env.NODE_ENV || 'development'}                     ║
╠═══════════════════════════════════════════════════╣
║  Endpoints:                                       ║
║  GET  /status       - Check connection status     ║
║  GET  /qr           - Get QR code page            ║
║  POST /send         - Send single message         ║
║  POST /send-bulk    - Send bulk messages          ║
║  POST /check-number - Check if number on WA       ║
╚═══════════════════════════════════════════════════╝
  `);
  
  // Start WhatsApp client
  startWhatsApp();
});

