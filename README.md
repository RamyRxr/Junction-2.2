# Junction 2.2.0 - Modern Donation Management System

![Version](https://img.shields.io/badge/version-2.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-14%2B-brightgreen)

> A full-stack **offline-first** donation management system for Qurbani (sacrifice) operations. Register donors, assign agents, track donations in real-time, compress and upload media evidence, and automatically sync everything to Supabase and Telegram—all while working seamlessly offline.

---

## 🚨 IMPORTANT: Credentials & Configuration Files

**⚠️ BEFORE CLONING:** This repository contains placeholder credentials. You MUST create your own configuration files with your own credentials. Never commit actual API keys or passwords to version control.

---

## 🎯 Features

✅ **Donor Management**
- Register sheep and cow donors with complete details
- Track donor status (pending, processing, completed)
- Support for cow shares (1/7 splits)

✅ **Agent Assignment**
- Distribute donors among field agents
- Real-time agent dashboards
- Track individual agent progress

✅ **Donation Tracking**
- Real-time statistics and analytics
- Interactive dashboards with charts
- Status tracking for each donation

✅ **Media Upload & Compression**
- Client-side image compression (50-70% reduction)
- Client-side video compression (60-70% reduction) using FFmpeg WASM
- Automatic thumbnail generation
- Support for multiple file formats

✅ **Offline-First Architecture**
- Work completely offline without internet
- All data stored locally (IndexedDB/LocalStorage)
- Automatic sync when back online
- Zero data loss guarantee

✅ **Cloud Integration**
- Supabase PostgreSQL database
- Supabase Cloud Storage for media
- Automatic file uploads with retry logic

✅ **Telegram Notifications**
- Send uploaded media to donors via Telegram
- Automatic notification queue
- Works even if offline (sends when online)

✅ **Modern UI/UX**
- Beautiful responsive design with Tailwind CSS
- Real-time charts and analytics with Recharts
- Smooth animations and transitions

---

## 🏗️ System Architecture

```
junction-2.2.0/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React Context (Donors, Offline)
│   │   ├── services/      # API & Supabase services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── supabase.js    # ⚙️ UPDATE THIS FILE - Supabase config
│   │   └── App.js
│   ├── .env               # ⚙️ CREATE THIS FILE - Frontend config
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── config/
│   │   ├── db.js          # ⚙️ UPDATE THIS FILE - Database config
│   │   ├── supabase.js    # ⚙️ UPDATE THIS FILE - Supabase config
│   │   └── test-db.js
│   ├── controllers/        # Request handlers
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── db/
│   │   ├── schema.sql     # Database schema
│   │   └── setup-db.js    # ⚙️ UPDATE THIS FILE - Setup script
│   ├── prisma/            # Prisma ORM config
│   ├── .env               # ⚙️ CREATE THIS FILE - Backend config
│   ├── index.js           # ⚙️ UPDATE THIS FILE - Database connection
│   └── package.json
│
└── README.md              # This file
```

**Tech Stack:**
- **Frontend:** React 19, React Router v6, Tailwind CSS, Recharts, Axios
- **Backend:** Node.js, Express 5, PostgreSQL, Prisma ORM
- **Storage:** Supabase (PostgreSQL + Cloud Storage)
- **Media:** FFmpeg WASM, Canvas API
- **Offline:** IndexedDB, LocalStorage
- **Messaging:** Telegram Bot API

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 14+ ([Download](https://nodejs.org/))
- **npm** 6+ (comes with Node.js)
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/))
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** (free at [supabase.com](https://supabase.com))
- **Telegram Bot Token** (optional, for notifications)

---

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
git clone https://github.com/RamyRxr/Junction-2.2.git
cd junction-2.2
```

### Step 2: Set Up Backend

#### 2.1 Install Dependencies

```bash
cd server
npm install
```

#### 2.2 Create PostgreSQL Database

```bash
# Create a new database
createdb junction

# Or use pgAdmin/DBeaver GUI
```

#### 2.3 Update Database Configuration Files

**File 1: `server/index.js`** (Lines 22-27)

Find this section:
```javascript
const pool = new Pool({
    user: process.env.DB_USER || 'YOUR_POSTGRES_USER',  // ⚠️ CHANGE THIS
    host: process.env.DB_HOST || 'localhost',  
    database: process.env.DB_NAME || 'YOUR_DATABASE_NAME',  // ⚠️ CHANGE THIS
    password: process.env.DB_PASSWORD || 'YOUR_DATABASE_PASSWORD',  // ⚠️ CHANGE THIS
    port: process.env.DB_PORT || 5432,  //THIS MUST BE THE SAME 
});
```


**File 2: `server/config/db.js`** (All lines)

Replace the entire file with your credentials:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'YOUR_POSTGRES_USER',  // ⚠️ CHANGE THIS
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'YOUR_DATABASE_NAME',  // ⚠️ CHANGE THIS
    password: process.env.DB_PASSWORD || 'YOUR_POSTGRES_PASSWORD',  // ⚠️ CHANGE THIS
    port: process.env.DB_PORT || 5432,  // THIS MUST BE THE SAME
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error', err.stack);
    } else {
        console.log('Database connected successfully');
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
```

**File 3: `server/db/setup-db.js`** (Lines 7-11)

Replace the connection configuration:
```javascript
const pool = new Pool({
    user: 'YOUR_POSTGRES_USER',  // ⚠️ CHANGE THIS
    host: 'localhost',
    database: 'YOUR_DATABASE_NAME',  // ⚠️ CHANGE THIS
    password: 'YOUR_POSTGRES_PASSWORD',  // ⚠️ CHANGE THIS
    port: 5432,  // THIS MUST BE THE SAME
});
```

#### 2.4 Create `.env` File in Server Directory

Create `server/.env` with your own credentials:

```env
# Database Configuration (Required)
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=junction

# Server
PORT=5000
NODE_ENV=development

# Supabase Configuration (Required - see setup instructions below)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Telegram (Optional - for notifications)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHANNEL_ID=your_channel_id_here
```

#### 2.5 Initialize Database Schema

```bash
# Option 1: Using setup script
node db/setup-db.js

# Option 2: Using Prisma
npx prisma generate
npx prisma db push

# Option 3: Manual SQL
psql -U your_postgres_user -d junction -f db/schema.sql
```

#### 2.6 Start Backend

```bash
npm start
# Server running on http://localhost:5000
```

---

### Step 3: Set Up Frontend

#### 3.1 Install Dependencies

```bash
cd ../client
npm install
```

#### 3.2 Update Supabase Configuration File

**File: `client/src/supabase.js`**

Replace the entire file with your Supabase credentials:

```javascript
import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase Dashboard > Settings > API
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key-here';

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

#### 3.3 Create `.env` File in Client Directory

Create `client/.env` with your Supabase credentials:

```env
# Supabase Configuration (Required - see setup instructions below)
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 3.4 Start Frontend

```bash
npm start
# Frontend running on http://localhost:3000
```

---

## 🔧 Supabase Setup (Complete Guide)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Fill in project details:
   - **Project Name:** junction
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose the closest to you
4. Wait for the project to initialize (2-3 minutes)

### 2. Get Your Credentials

In your Supabase Dashboard:

1. Go to **Settings** → **API**
2. You'll see:
   - **Project URL** → Copy to `REACT_APP_SUPABASE_URL` and `SUPABASE_URL`
   - **Anon Public Key** → Copy to `REACT_APP_SUPABASE_ANON_KEY` and `SUPABASE_KEY`
   - **Service Role Key** → Copy to `SUPABASE_SERVICE_KEY` (server only)

### 3. Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **"New Bucket"**
3. Name it: `media`
4. Make it **Public** (so files are accessible)
5. Click **"Create Bucket"**

### 4. Create Tables

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New Query"**
3. Paste the contents of `server/db/schema.sql`
4. Click **"Run"**

Or use Prisma:

```bash
cd server
npx prisma db push
```

### 5. Set Row-Level Security (RLS) Policies

In Supabase Storage **"Policies"** for `media` bucket:

**For Public Access (Everyone can read):**

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');
```

**For Authenticated Upload:**

```sql
CREATE POLICY "Authenticated Users Can Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
```

---

## 🤖 Telegram Integration (Optional)

### Get Your Bot Token

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow the prompts to create a bot
4. Copy the **API Token** (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Add to Configuration

**Update `server/.env`:**
```env
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHANNEL_ID=your_channel_id_here
```

### Set Bot Webhook (Optional)

```bash
curl -X POST https://api.telegram.org/bot{YOUR_TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://your-domain.com/api/telegram/webhook\"}"
```

---

## 📁 Configuration Files to Update

### Summary of Files That Need Your Credentials

| File | Location | What to Change | Example |
|------|----------|----------------|---------|
| `.env` | `client/` | Supabase credentials | Create new file |
| `.env` | `server/` | DB + Supabase + Telegram | Create new file |
| `supabase.js` | `client/src/` | Supabase URL & Key | Update default values |
| `db.js` | `server/config/` | PostgreSQL credentials | Update all fields |
| `supabase.js` | `server/config/` | Supabase credentials | Update all fields |
| `index.js` | `server/` | Database connection pool | Lines 22-27 |
| `setup-db.js` | `server/db/` | Database credentials | Lines 7-11 |

### Quick Reference: What Each File Does

**`client/.env`** (Frontend environment)
- Supabase URL for the React app
- Supabase anonymous key for client-side API calls

**`server/.env`** (Backend environment)
- PostgreSQL connection details
- Supabase credentials for file uploads
- Telegram bot token and channel ID
- Server port configuration

**`client/src/supabase.js`** (Frontend Supabase client)
- Initializes Supabase connection
- Uses environment variables
- Falls back to hardcoded values (UPDATE THESE)

**`server/config/db.js`** (Backend database connection)
- Creates PostgreSQL connection pool
- Uses environment variables
- Has default values (UPDATE THESE)

**`server/config/supabase.js`** (Backend Supabase client)
- Initializes admin Supabase client
- Uses service role key for uploads
- Requires SUPABASE_SERVICE_KEY

**`server/index.js`** (Backend main server)
- Creates database pool with credentials
- Uses environment variables
- Has fallback values (UPDATE THESE)

**`server/db/setup-db.js`** (Database setup script)
- Connects to PostgreSQL to run schema.sql
- Uses hardcoded credentials (UPDATE THESE)

---

## 📦 All Required Dependencies

### Frontend Dependencies

```bash
npm install react@19.1.0 react-dom@19.1.0 react-router-dom@6.20.0
npm install tailwindcss@3.4.17 postcss@8.5.6 autoprefixer@10.4.21
npm install @supabase/supabase-js@2.52.0 axios@1.10.0
npm install recharts@3.1.0 chart.js@4.5.0 react-chartjs-2@5.3.0
npm install @ffmpeg/ffmpeg@0.11.0 @ffmpeg/core@0.11.0
npm install @craco/craco@7.1.0 file-loader@6.2.0
npm install @tanstack/react-query@5.0.0 @heroicons/react@2.2.0
```

Or just use:
```bash
cd client
npm install
```

### Backend Dependencies

```bash
npm install express@5.1.0 pg@8.16.3 cors@2.8.5
npm install @supabase/supabase-js@2.52.0 axios@1.12.2
npm install dotenv@17.2.0 jsonwebtoken@9.0.2 bcrypt@6.0.0
npm install morgan@1.10.1 multer@2.0.2 uuid@11.1.0
npm install @prisma/client@6.12.0 prisma@6.12.0
```

Or just use:
```bash
cd server
npm install
```

### Dependencies Reference Table

| Package | Version | Purpose | Frontend | Backend |
|---------|---------|---------|----------|---------|
| react | ^19.1.0 | UI Library | ✅ | ❌ |
| react-dom | ^19.1.0 | React DOM | ✅ | ❌ |
| react-router-dom | ^6.20.0 | Routing | ✅ | ❌ |
| tailwindcss | ^3.4.17 | CSS Framework | ✅ | ❌ |
| @supabase/supabase-js | ^2.52.0 | Supabase SDK | ✅ | ✅ |
| axios | ^1.10.0+ | HTTP Client | ✅ | ✅ |
| recharts | ^3.1.0 | Charts | ✅ | ❌ |
| @ffmpeg/ffmpeg | ^0.11.0 | Video Compression | ✅ | ❌ |
| express | ^5.1.0 | Web Server | ❌ | ✅ |
| pg | ^8.16.3 | PostgreSQL Client | ❌ | ✅ |
| cors | ^2.8.5 | CORS | ❌ | ✅ |
| dotenv | ^17.2.0 | Env Variables | ❌ | ✅ |
| @prisma/client | ^6.12.0 | ORM | ❌ | ✅ |
| prisma | ^6.12.0 | Prisma CLI | ❌ | ✅ |

---

## 🎮 Usage Guide

### 1. **Create Donor Account**

- Navigate to "Register New Donor"
- Fill in donor details (name, phone, type, price)
- For cows: each donor represents 1/7 share
- Submit to save

### 2. **Assign Donors to Agents**

- Go to "Donor List"
- Click **"Split Donors Between Agents"**
- Select agents and donors to assign
- Click **"Assign"** to save

### 3. **Agent Dashboard**

- Each agent sees their assigned donors
- For each donor, upload media (images/videos)
- Media is compressed automatically
- If offline, uploads are queued

### 4. **Upload Media & Mark as Done**

- Click on a donor
- Select images and videos
- Watch compression progress
- Click **"Mark as Done"** when ready
- Media uploads to Supabase (or queues if offline)
- Donor status changes to "Completed"

### 5. **View Analytics**

- Go to "Dashboard"
- See real-time statistics
- View completion rates and agent performance
- Export data if needed

---

## 🔌 Offline Features

### How It Works

1. **When Online:** All data syncs immediately to Supabase
2. **When Offline:** 
   - All actions stored locally (IndexedDB)
   - Media stored as base64 in local storage
   - UI shows "Offline Mode" indicator
3. **When Back Online:** 
   - Automatic sync starts
   - All queued uploads upload to Supabase
   - Notifications sent via Telegram
   - UI returns to normal

### IndexedDB Stores

```javascript
- mediaFiles      // Stores base64 media data
- pendingUploads  // Stores upload queue metadata
```

### Clear Local Cache

**Warning:** This will delete all pending uploads!

**In Browser DevTools:**

```javascript
// Open DevTools > Application > IndexedDB
// Right-click "junctionOfflineDB" > Delete
// Refresh page
```

Or programmatically:

```javascript
const db = await openDB('junctionOfflineDB');
db.clear('mediaFiles');
db.clear('pendingUploads');
```

---

## 🎨 Media Compression Details

### Image Compression

- **Quality:** 60% of original
- **Max Width:** 1200px
- **File Size Reduction:** 50-70%
- **Format:** JPEG/PNG preserved
- **Client-Side:** No server processing

### Video Compression

- **Codec:** H.264 video + AAC audio
- **Resolution:** Max 720p (1280x720)
- **Audio Bitrate:** 128 kbps
- **File Size Reduction:** 60-70%
- **Format:** MP4
- **Engine:** FFmpeg WASM (runs in browser)

### How It Works

1. User selects video
2. Thumbnail generated immediately
3. FFmpeg WASM loads and initializes
4. Video transcoded with optimal bitrate
5. Compressed video replaces original
6. Progress shown to user

---

## 🐛 Troubleshooting

### "Cannot find module or Port already in use"

**Solution:**
```bash
# Make sure you're in the right directory
cd server  # for backend
cd client  # for frontend

# Install all dependencies
npm install
```

### "Database connection refused"

**Cause:** PostgreSQL not running or wrong credentials

**Solution:**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check .env credentials match your database
# DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

# Test connection
psql -U your_postgres_user -h localhost -d junction

# Make sure database exists
createdb junction
```

### "Supabase upload fails with 400 error"

**Cause:** Invalid Supabase credentials or missing bucket

**Solution:**
```bash
1. Check REACT_APP_SUPABASE_URL in client/.env
   - Should be: https://your-project-id.supabase.co
   - Check your project ID is correct

2. Check REACT_APP_SUPABASE_ANON_KEY is correct
   - Go to Supabase Dashboard > Settings > API
   - Copy the full "Anon public key"

3. Verify storage bucket exists
   - Go to Supabase Dashboard > Storage
   - Create bucket named "media"
   - Make it public
```

### "SharedArrayBuffer is not defined" (Video compression issue)

**Cause:** FFmpeg WASM requires SharedArrayBuffer (only on HTTPS or localhost)

**Solution:**
- Use localhost for development
- Deploy on HTTPS for production
- Check server has COOP/COEP headers

### "Video compression is very slow"

**Cause:** Video compression is CPU-intensive

**Solution:**
- FFmpeg WASM needs time for large videos (30+ seconds is normal)
- Recommend users compress videos beforehand
- Set maximum file size limit (e.g., 50MB)

### "Offline uploads not syncing"

**Cause:** Browser storage disabled or IndexedDB full

**Solution:**
```bash
1. Clear browser cache and cookies
2. Check IndexedDB in DevTools > Application
3. Verify "Allow cookies and site data" is enabled
4. Check device has internet connection
5. Check browser console for errors
```

### "Telegram notifications not sending"

**Cause:** Bot token incorrect or bot not in channel

**Solution:**
```bash
1. Verify TELEGRAM_BOT_TOKEN in server/.env is correct
   - Should look like: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

2. Make bot an admin in the channel
   - Go to Telegram channel > Add members > Search bot

3. Check channel ID is correct
   - Private channels use negative numbers: -100123456789

4. Test with curl:
   curl -X POST https://api.telegram.org/bot{TOKEN}/sendMessage \
     -H "Content-Type: application/json" \
     -d "{\"chat_id\":\"-100123456789\",\"text\":\"Test\"}"
```

### ".env file not loading"

**Cause:** Incorrect path or file name

**Solution:**
```bash
# Make sure file is named exactly ".env" (with dot)
# Not ".env.example" or ".env.local"

# Frontend: client/.env
# Backend: server/.env

# Restart the server after creating/updating .env
npm start
```

---

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

### Manual Testing Checklist

- [ ] Register new donor (online)
- [ ] Register new donor (offline)
- [ ] Upload images (online)
- [ ] Upload video (online)
- [ ] Go offline and try to upload
- [ ] Verify uploads queued locally
- [ ] Come back online
- [ ] Verify auto-sync starts
- [ ] Verify media in Supabase
- [ ] Verify Telegram notification sent
- [ ] Clear cache and verify offline mode still works

---

## 📁 Project Structure

```
junction-2.2.0/
├── client/
│   ├── public/                    # Static files
│   ├── src/
│   │   ├── components/
│   │   │   ├── donors/           # Donor components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   ├── media/            # Media upload component
│   │   │   ├── layout/           # Layout components
│   │   │   └── stats/            # Statistics components
│   │   ├── pages/                # Page components
│   │   ├── contexts/             # Context providers
│   │   │   ├── DonorContext.js   # Donor state management
│   │   │   └── OfflineContext.js # Offline sync management
│   │   ├── services/             # API services
│   │   │   ├── apiService.js     # Backend API calls
│   │   │   ├── indexedDBService.js # IndexedDB helper
│   │   │   ├── supabaseClient.js # Supabase config
│   │   │   └── telegramService.js
│   │   ├── hooks/                # Custom React hooks
│   │   ├── utils/                # Utility functions
│   │   │   ├── mediaCompression.js
│   │   │   └── offline-storage.js
│   │   ├── supabase.js           # ⚙️ Supabase client config
│   │   ├── App.js
│   │   └── index.js
│   ├── .env                       # ⚙️ Create this - Frontend config
│   ├── craco.config.js           # Create React App config
│   ├── tailwind.config.js        # Tailwind CSS config
│   └── package.json
│
├── server/                        # Node.js Backend
│   ├── config/
│   │   ├── db.js                 # ⚙️ Update - Database config
│   │   ├── supabase.js           # ⚙️ Update - Supabase config
│   │   └── test-db.js
│   ├── controllers/              # Request handlers
│   │   ├── donorController.js
│   │   ├── donationController.js
│   │   ├── agentController.js
│   │   └── mediaController.js
│   ├── routes/                   # API routes
│   │   ├── donorRoutes.js
│   │   ├── donationRoutes.js
│   │   ├── agentRoutes.js
│   │   ├── mediaRoutes.js
│   │   └── telegramRoutes.js
│   ├── models/                   # Database models
│   │   ├── donorModel.js
│   │   ├── donationModel.js
│   │   └── agentModel.js
│   ├── db/
│   │   ├── schema.sql            # Database schema
│   │   └── setup-db.js           # ⚙️ Update - Setup script
│   ├── prisma/
│   │   └── schema.prisma         # Prisma ORM schema
│   ├── uploads/                  # Temporary file uploads
│   ├── .env                       # ⚙️ Create this - Backend config
│   ├── index.js                  # ⚙️ Update - Server entry point
│   ├── server.js                 # Express app setup
│   └── package.json
│
├── .gitignore                    # Git ignore file (includes .env)
├── README.md                     # This file
└── LICENSE                       # MIT License
```

---

## 🔐 Security Best Practices

1. **Environment Variables:**
   - Create `.env` files locally (NEVER commit them)
   - Add `.env` to `.gitignore`
   - Never hardcode credentials in source files
   - Use different credentials for dev/prod

2. **Database:**
   - Use strong passwords (min 12 characters, mix of types)
   - Enable SSL connections in production
   - Restrict database IP access
   - Don't use default passwords

3. **Supabase:**
   - Use anon key for frontend (read-only)
   - Use service role key only on backend (never in frontend)
   - Enable Row-Level Security (RLS) policies
   - Rotate keys regularly

4. **API:**
   - Add CORS headers (limit origins)
   - Validate all inputs server-side
   - Rate limit requests
   - Use HTTPS in production

5. **File Uploads:**
   - Validate file types and extensions
   - Scan files for malware
   - Set maximum file sizes
   - Restrict upload paths

6. **Telegram Bot:**
   - Don't share bot token
   - Rotate token if compromised
   - Only send non-sensitive data

---

## 🚢 Deployment

### Deploying to Production

#### Frontend (Vercel/Netlify)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Add environment variables:
   - `REACT_APP_SUPABASE_URL=your-prod-url`
   - `REACT_APP_SUPABASE_ANON_KEY=your-prod-key`
4. Deploy automatically on push

#### Backend (Heroku/Railway/Render)

1. Create account on hosting platform
2. Create new app/project
3. Set environment variables:
   - `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`
   - `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`
4. Connect GitHub repository
5. Deploy on push

---

## 📚 API Documentation

### Donor Endpoints

```
GET    /api/donors              # Get all donors
POST   /api/donors              # Create new donor
GET    /api/donors/:id          # Get specific donor
PUT    /api/donors/:id          # Update donor
DELETE /api/donors/:id          # Delete donor
```

### Agent Endpoints

```
GET    /api/agents              # Get all agents
POST   /api/agents              # Create agent
PUT    /api/agents/:id/assign   # Assign donors
```

### Media Endpoints

```
POST   /api/media/upload        # Upload media
GET    /api/media/:donorId      # Get donor's media
DELETE /api/media/:mediaId      # Delete media
```

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 👨‍💻 Author

**Ramy** - [GitHub](https://github.com/RamyRxr)

---

## 🙏 Credits & Acknowledgments

- [Supabase](https://supabase.com) - Open-source Firebase alternative
- [FFmpeg WASM](https://github.com/ffmpegwasm/ffmpeg.wasm) - Video processing
- [React](https://react.dev) - UI library
- [Express.js](https://expressjs.com) - Backend framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Recharts](https://recharts.org) - Charts library
- [PostgreSQL](https://www.postgresql.org) - Database

---

## 📞 Support & Contributing

Have questions or want to contribute? 

1. Open an issue on GitHub
2. Submit a pull request
3. Contact the author

---

## ⚠️ Important Security Reminder

**Before pushing to GitHub:**

1. Remove all hardcoded credentials
2. Update all `.env.example` files
3. Ensure `.gitignore` includes `.env`
4. Run: `git rm --cached .env` (if accidentally committed)
5. Verify no credentials in git history

---

**Junction 2.2.0** — Modern, offline-first donation management for Qurbani operations with seamless media and messaging integration. 🎯