# 🛡️ Secure File Vault — Enterprise Encrypted Storage Engine

A production-ready, highly secure **File Vault** web application built with enterprise security standards, **AES-256-GCM streaming envelope encryption/decryption**, JWT authentication with token rotation, role-based access control, AWS S3 / local encrypted storage fallback, immutable audit logging, file versioning, expiring share links, and AI document classification & summarization.

---

## 🌟 Key Features & Architecture Highlights

- **🔒 Authenticated Streaming Encryption (AES-256-GCM)**: Uses AES-256-GCM with a 12-byte random IV and 16-byte authentication tag per file. Guarantees both data confidentiality and cryptographic tamper detection (integrity protection).
- **🔑 Envelope Encryption**: Each file receives a unique 256-bit Data Encryption Key (DEK). DEKs are encrypted using a 256-bit Master Key (`ENCRYPTION_MASTER_KEY` env var) before storing in the database.
- **⚡ RAM-Efficient Node.js Streams**: Files are encrypted and decrypted using Node.js Streams (`crypto.createCipheriv` / `createDecipheriv`). Bytes stream directly through the cipher pipeline to disk/storage without loading massive files into RAM.
- **🛡️ Authentication & Token Rotation**: Short-lived JWT Access Tokens (15-min expiration) + Refresh Tokens (7-day expiration with token rotation). Passwords hashed using `bcrypt` with 12 salt rounds.
- **🚀 Zero-Config Out-of-the-Box Launch**:
  - **Database Fallback**: Connects to local MongoDB (`mongodb://localhost:27017/filevault`). If MongoDB is not running, it automatically spins up an in-memory Mongo server (`mongodb-memory-server`) so the app runs without external setup.
  - **Storage Fallback**: Defaults to encrypted disk storage (`/server/uploads/encrypted/`) when AWS S3 environment variables are omitted.
  - **AI Fallback**: Uses Google Gemini API (`gemini-1.5-flash`) when `GEMINI_API_KEY` is provided, or a built-in heuristic analytical engine when offline.
- **🔗 Expiring & One-Time Secure Share Links**: Configurable TTL (1h, 24h, 7d), self-destructing one-time downloads, and optional passcode protection.
- **📋 Immutable Audit Ledger**: Every touchpoint (`FILE_UPLOAD`, `FILE_DECRYPTED`, `SHARE_CREATED`, `SHARE_ACCESS_SUCCESS`, `ACCESS_DENIED`, `LOGIN_FAILED`) records IP address, user agent, action timestamp, and hash checksums.
- **📜 File Revision History**: Version control system allowing users to upload revisions while preserving previous version history.

---

## 📁 Repository Structure

```
Full Stack Project 1/
├── server/
│   ├── src/
│   │   ├── config/ (db.ts, env.ts)
│   │   ├── controllers/ (authController.ts, fileController.ts, shareController.ts, auditController.ts, aiController.ts)
│   │   ├── middleware/ (authMiddleware.ts, rateLimiter.ts, validate.ts)
│   │   ├── models/ (User.ts, File.ts, FileVersion.ts, ShareLink.ts, AuditLog.ts)
│   │   ├── routes/ (authRoutes.ts, fileRoutes.ts, shareRoutes.ts, auditRoutes.ts, aiRoutes.ts)
│   │   ├── services/ (cryptoService.ts, storageService.ts, aiService.ts, auditService.ts)
│   │   ├── utils/ (jwt.ts, logger.ts)
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/ (Navbar, Sidebar, FileCard, FileUploadModal, ShareModal, VersionHistoryModal, AISummaryModal, SecurityBadge, QuotaBar)
│   │   ├── pages/ (Login, Register, Dashboard, SharedFileView, AuditLogsPage, SettingsPage)
│   │   ├── services/ (api.ts, authService.ts, fileService.ts, shareService.ts, auditService.ts, aiService.ts)
│   │   ├── context/ (AuthContext.tsx)
│   │   ├── types/ (index.ts)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

---

## 🚀 How to Run (Complete 2-Minute Quick Start Guide)

### Step 1: Install Server & Client Dependencies

Open terminal in the project root:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Step 2: Start Backend Server

In the `server/` directory:

```bash
npm run dev
```

> **Note**: The backend will attempt to connect to MongoDB. If MongoDB is not running locally, it will automatically initialize the in-memory MongoDB fallback server on port `5000`.

### Step 3: Start Frontend Dev Server

In a new terminal, navigate to the `client/` directory:

```bash
npm run dev
```

Vite will start the client dev server at: `http://localhost:5173`

### Step 4: Open App in Browser

1. Navigate to **`http://localhost:5173`**
2. Register a new user account (e.g. `alex@security.io` / `Password123!`).
3. Drag and drop any document or image to test AES-256-GCM streaming encryption, AI document summarization, expiring share links, and audit logs.

---

## 🎯 Technical Interview Defense Guide

When discussing this project during technical job interviews, use the following guide to demonstrate your deep understanding of security engineering:

### Q1: Why AES-256-GCM over AES-256-CBC?
> **Answer**: AES-CBC provides confidentiality, but it is vulnerable to bit-flipping and padding oracle attacks if not paired with a separate HMAC (Encrypt-then-MAC). **AES-256-GCM** is an **Authenticated Encryption with Associated Data (AEAD)** mode. It generates a 16-byte authentication tag alongside the ciphertext. During decryption, if even a single bit of the file is modified, decryption fails immediately before exposing tampered data.

### Q2: What is Envelope Encryption and why is it used?
> **Answer**: Encrypting all files with a single global Master Key is a major security flaw—if that key is compromised, every stored file is breached. In our system, **Envelope Encryption** generates a unique 256-bit Data Encryption Key (DEK) for every uploaded file. The DEK encrypts the file, and then the Master Key encrypts the DEK. This allows easy DEK rotation, granular access revocation, and limits breach blast radiuses.

### Q3: How do you handle large file uploads without exhausting server RAM?
> **Answer**: Loading entire multi-gigabyte files into Node.js `Buffer` objects causes high memory pressure and Garbage Collection pauses. We pipe client request streams directly into `crypto.createCipheriv` transform streams and stream the output directly to disk/S3 (`stream.pipe(cipher).pipe(storageStream)`). Memory usage stays virtually constant regardless of file size.

### Q4: How are expiring and one-time share links secured?
> **Answer**: Share links use cryptographically random 256-bit UUID tokens. When created, the database records an `expiresAt` timestamp and an `isOneTime` flag. Upon download request:
> 1. Token validity, expiration, and revocation status are checked.
> 2. Passcodes (if configured) are verified using `bcrypt.compare`.
> 3. If `isOneTime` is true, the share link document is atomically marked as revoked upon first successful stream decryption.

---

## 🛡️ License

Built with ❤️ for Security Engineering & Full Stack Demonstrations.
