# Indiachan

> A modern, serverless imageboard built with Next.js 15 - Complete jschan replication with enhanced features

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://neoindiachan.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

- 🎨 **Exact jschan UI** - Pixel-perfect replication with 33 themes
- 🚀 **Modern Stack** - Next.js 15, React 19, TypeScript
- 🔒 **Full Moderation** - 13 moderation actions, staff management, reports, bans
- 📰 **News System** - Global announcements and updates
- 📄 **Custom Pages** - Create custom board pages
- 👥 **User System** - Registration, login, 2FA support
- 🎯 **Board Management** - 40+ configurable settings per board
- 📱 **Responsive** - Mobile-friendly design
- ⚡ **Serverless** - Deploy to Vercel with zero config

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB database
- Redis instance (for sessions)

### Installation

```bash
# Clone the repository
git clone https://github.com/theabbie/Indiachan.git
cd indiachan

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
# (See Environment Variables section below)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your imageboard.

## 🔧 Environment Variables

Create a `.env.local` file with the following:

```env
# Database (Required)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/indiachan
MONGODB_DB=indiachan

# Redis (Required for sessions)
REDIS_URL=redis://localhost:6379

# Security (Required - generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-secret-here
CSRF_SECRET=your-secret-here
COOKIE_SECRET=your-secret-here
CRON_SECRET=your-secret-here

# Site Configuration
NEXT_PUBLIC_SITE_NAME=Indiachan
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/your-invite

# reCAPTCHA (Optional but recommended)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key
```

### Generate Secrets

```bash
openssl rand -base64 32  # Run this 4 times for each secret
```

## 📦 Database Setup

### MongoDB Indexes

Run these in your MongoDB shell:

```javascript
use indiachan

// Posts indexes
db.posts.createIndex({ board: 1, postId: 1 })
db.posts.createIndex({ board: 1, thread: 1 })
db.posts.createIndex({ 'reports.0': 1 })

// Bans indexes
db.bans.createIndex({ 'ip.cloak': 1, board: 1 })
db.bans.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })

// Modlogs index
db.modlogs.createIndex({ board: 1, date: -1 })

// Accounts indexes
db.accounts.createIndex({ ownedBoards: 1 })
db.accounts.createIndex({ staffBoards: 1 })
```

### Create Admin Account

```javascript
db.accounts.insertOne({
  _id: "admin",
  original: "admin",
  passwordHash: "$2b$12$...", // Use bcrypt to hash "your-password"
  permissions: Binary(Buffer.from([255, 255, 255, 255])),
  ownedBoards: [],
  staffBoards: [],
  twofactor: null,
  web3: false,
  lastActiveDate: new Date(),
  createdDate: new Date()
})
```

Or use bcryptjs:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 12));"
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/theabbie/Indiachan)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**After deployment:**
1. Add environment variables in Vercel Dashboard → Settings → Environment Variables
2. Create a Redis database in Vercel → Storage → KV
3. Redeploy to apply environment variables

### Deploy to VPS

```bash
# Build the application
npm run build

# Start with PM2
npm i -g pm2
pm2 start npm --name "indiachan" -- start
pm2 save
pm2 startup
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t indiachan .
docker run -p 3000:3000 --env-file .env.local indiachan
```

## 🎯 Usage

### Creating Your First Board

1. Login with admin credentials at `/login.html`
2. Go to `/create.html`
3. Fill in board details:
   - **URI**: Short identifier (e.g., `g`, `tech`, `pol`)
   - **Name**: Display name (e.g., "Technology")
   - **Description**: Brief description
4. Click "Create"

### Board Management

Access board management at `/{board}/manage/index.html`

**Available tools:**
- **Recent Posts** - View and moderate recent activity
- **Reports** - Handle user reports
- **Bans** - Manage banned users
- **Logs** - View moderation history
- **Settings** - Configure board (40+ options)
- **Staff** - Add/remove moderators
- **Custom Pages** - Create custom board pages

### Moderation Actions

- Delete posts
- Ban users (with duration and reason)
- Sticky/Lock/Cycle threads
- Spoiler files
- Move threads between boards
- Report dismissal
- And more..

## 🎨 Themes

Indiachan includes 33 themes from jschan:

- Yotsuba / Yotsuba-B
- Tomorrow / Midnight
- Photon / Dark Photon
- And 27 more!

Users can switch themes via the Settings menu.

## 📁 Project Structure

```
indiachan/
├── app/                    # Next.js app directory
│   ├── [board]/           # Dynamic board routes
│   ├── api/               # API routes
│   ├── account/           # User account pages
│   ├── globalmanage/      # Global admin pages
│   └── styles/            # Global styles
├── components/            # React components
├── lib/                   # Utility functions
│   ├── db/               # Database models
│   ├── auth.ts           # Authentication
│   ├── captcha.ts        # reCAPTCHA
│   └── session.ts        # Session management
├── public/               # Static assets
│   ├── css/themes/       # Theme CSS files
│   └── img/              # Icons and images
└── types/                # TypeScript types
```

## 🔒 Security

- ✅ CSRF protection on all forms
- ✅ Rate limiting on API endpoints
- ✅ reCAPTCHA v3 integration
- ✅ Secure session management
- ✅ IP cloaking for privacy
- ✅ 2FA support
- ✅ XSS protection
- ✅ SQL injection prevention (NoSQL)

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/changepassword` - Change password

### Boards
- `POST /api/boards/create` - Create new board
- `POST /api/boards/[board]/post` - Create post/thread
- `POST /api/boards/[board]/actions` - Moderation actions
- `POST /api/boards/[board]/settings` - Update board settings

### Management
- `POST /api/boards/[board]/staff/add` - Add staff member
- `POST /api/boards/[board]/bans/edit` - Manage bans
- `POST /api/globalmanage/news/add` - Add news post

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [jschan](https://gitgud.io/fatchan/jschan/) - Original imageboard software
- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Hosting platform

## 📞 Support

- **Discord**: [Join our server](https://discord.gg/y3SxSK5XJC)
- **Issues**: [GitHub Issues](https://github.com/theabbie/Indiachan/issues)
- **Live Demo**: [neoindiachan.vercel.app](https://neoindiachan.vercel.app)

## 🗺️ Roadmap

- [ ] WebSocket support for live updates
- [ ] File upload to Cloudflare R2
- [ ] Advanced search functionality
- [ ] Mobile app (React Native)
- [ ] Federation support
- [ ] API documentation

---

**Made with ❤️ for the imageboard community**
