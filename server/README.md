# WhatsApp Server for Koperasi

Server WhatsApp menggunakan OpenWA untuk mengirim notifikasi ke nasabah.

## 🚀 Quick Start (Lokal)

```bash
cd server
npm install
npm start
```

Buka `http://localhost:3001/qr` untuk scan QR Code.

## 🚂 Deploy ke Railway

### Cara 1: Via GitHub
1. Push folder `server/` ke GitHub repository terpisah
2. Buka [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Pilih repository
5. Railway akan auto-detect dan deploy

### Cara 2: Via Railway CLI
```bash
cd server
railway login
railway init
railway up
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status` | Cek status koneksi WA |
| GET | `/qr` | Halaman QR Code |
| POST | `/send` | Kirim pesan single |
| POST | `/send-bulk` | Kirim pesan massal |
| POST | `/check-number` | Cek nomor ada di WA |

### Contoh Request

**Kirim Pesan Single:**
```bash
curl -X POST https://your-server.railway.app/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "08123456789", "message": "Hello!"}'
```

**Kirim Pesan Massal:**
```bash
curl -X POST https://your-server.railway.app/send-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      {"phone": "08123456789", "name": "Budi"},
      {"phone": "08234567890", "name": "Siti"}
    ],
    "message": "Halo {name}, ini pesan dari Koperasi!"
  }'
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port server | 3001 |
| `NODE_ENV` | Environment | development |
| `PUPPETEER_EXECUTABLE_PATH` | Path Chromium | auto-detect |

## 📝 Notes

- Session WA disimpan di folder `wa-session/`
- Jangan logout dari HP, session akan hilang
- Rate limit: 2-5 detik antar pesan untuk hindari banned
- Gunakan nomor WA khusus bisnis

## 🔧 Troubleshooting

**QR Code tidak muncul:**
- Pastikan Chromium terinstall
- Cek logs: `railway logs`

**Session hilang:**
- Scan ulang QR Code
- Pastikan folder `wa-session/` tidak di-gitignore di Railway

**Gagal kirim pesan:**
- Cek status: `/status`
- Pastikan nomor terdaftar di WA

