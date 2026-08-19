# 🛡️ ByteSphere File Vault

ByteSphere is a secure file storage web application. It lets you upload files, lock them with bank-grade encryption (AES-256), scan them with AI for security risks, and share them safely using self-destructing links.

---

## 👥 Project Team & Contributors

* **Frontend Lead (Laiba Khalid https://github.com/laibakhakid):** Built the website user interface using React and Tailwind CSS. Made the dashboard, 3D graphics, upload screens, and mobile design.
* **Backend & AI Engineer (Kinza Khalid https://github.com/Kinzakhalid593):** Built the server using Node.js and Express. Connected the Google Gemini AI scanner, handled file uploads, and created the backup database system.
* **Security & Encryption Analyst (Shazeen Amjad https://github.com/shazeenamjad45-beep):** Created the AES-256-GCM file encryption system, built the self-destructing share links, and created the activity logs.

---

## 🛠️ Technologies Used

* **Frontend:** React 18, Vite, Tailwind CSS, TypeScript
* **Backend:** Node.js, Express, TypeScript
* **Database:** MongoDB (with automatic built-in memory backup)
* **Encryption:** AES-256-GCM
* **AI:** Google Gemini AI (with offline rule-based scanner)

---

## 🚀 How It Works

1. **Upload & Encrypt:** When you upload a file, ByteSphere locks it instantly with AES-256 encryption before saving to disk.
2. **AI Security Scan:** Scans files to catch passwords, credit cards, or private data and gives a safety score (0 to 100).
3. **Safe Sharing:** Generate secure download links with expiration timers (1 hour, 24 hours) or 1-time self-destruct.
4. **Activity Logs:** View audit history of all uploads, downloads, and shares with timestamps.

---

## 💻 How to Run the Project

### 1. Open Terminal in the Project Folder
Open VS Code, open your project folder, and press `Ctrl + ~` to open the terminal.

### 2. Install Dependencies
```bash
npm install
```

### 3. Create `.env` File
Create a `.env` file in the main folder and add:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/filevault
JWT_SECRET=super_secret_key_1234567890_bytesphere
JWT_REFRESH_SECRET=super_refresh_key_1234567890_bytesphere
ENCRYPTION_MASTER_KEY=f8a42e5d6c7b8a90123456789abcdef0123456789abcdef0123456789abcdef0
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./uploads/encrypted
GEMINI_API_KEY=
```

### 4. Start the App
```bash
npm run dev
```

### 5. Open in Browser
Go to **`http://localhost:5173`** in your browser.

---

## 🛑 How to Stop
Press `Ctrl + C` in the terminal and type `y`.
```
