# Lawyers Management System

A comprehensive, production-ready case management system for law firms. This application helps lawyers manage their cases, clients, hearings, and documents in a single, secure platform.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 📁 **Case Management** - Full CRUD operations for legal cases
- 👥 **Client Management** - Track client information and case associations
- 📅 **Calendar & Hearings** - Schedule and manage court hearings
- 📄 **Document Management** - Upload and organize case documents
- 🎯 **Role-Based Access Control** - Admin, Lawyer, and Paralegal roles
- 🔍 **Advanced Search** - Search across cases, clients, and documents
- 📊 **Dashboard Analytics** - Overview of cases, hearings, and success rates
- 🌐 **Bilingual Support** - English and Urdu interface elements
- 🔒 **Security Features** - Rate limiting, CORS, security headers
- 🐳 **Docker Support** - Containerized deployment ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or later
- PostgreSQL 14 or later
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/0mer16/lawyers-mgmt.git
   cd lawyers-mgmt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `JWT_SECRET` - Generate with `openssl rand -base64 32`

4. **Setup database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed  # Optional: adds demo data
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

### Demo Credentials

After seeding:
- **Admin**: `admin@example.com` / `admin123`
- **Lawyer**: `lawyer@example.com` / `lawyer123`

⚠️ **Change these passwords immediately in production!**

## 📦 Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT with jose
- **Validation**: Zod
- **Forms**: React Hook Form
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 🏗️ Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Protected dashboard pages
│   ├── api/            # API routes
│   └── ...
├── components/         # Reusable UI components
├── lib/               # Utility functions
│   ├── auth.ts        # Authentication helpers
│   ├── jwt.ts         # JWT token management
│   ├── prisma.ts      # Database client
│   ├── api-validation.ts  # API validation schemas
│   └── rate-limit.ts  # Rate limiting
├── prisma/            # Database schema & migrations
├── public/            # Static assets
└── types/             # TypeScript type definitions
```

## 🔒 Security Features

### Implemented

- ✅ JWT authentication with proper signing
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Input validation with Zod
- ✅ SQL injection protection via Prisma
- ✅ File upload validation
- ✅ Database cascading deletes

### Best Practices

- Use strong, unique secrets for JWT_SECRET and NEXTAUTH_SECRET
- Enable HTTPS in production
- Regular database backups
- Keep dependencies updated
- Monitor rate limit logs
- Use environment-specific configurations

## 🚢 Production Deployment

See [PRODUCTION-GUIDE.md](./PRODUCTION-GUIDE.md) for comprehensive deployment instructions.

### Quick Deploy Options

**Vercel (Recommended)**
```bash
vercel --prod
```

**Docker**
```bash
docker-compose up -d
```

**Manual**
```bash
npm run build
npm start
```

## 📊 Database Schema

The system uses PostgreSQL with the following main entities:

- **User** - System users with roles (Admin/Lawyer/Paralegal)
- **Client** - Client information and contact details
- **Case** - Legal cases with full details
- **Hearing** - Court hearing schedule and outcomes
- **Document** - File attachments for cases/clients
- **Note** - Case notes and updates

All relationships include cascade deletes for data integrity.

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database with demo data
```

### Database Commands

```bash
npx prisma studio             # Visual database editor
npx prisma generate          # Generate Prisma Client
npx prisma db push           # Push schema to database
npx prisma migrate dev       # Create new migration
npx prisma migrate deploy    # Apply migrations (production)
```

## 📝 API Documentation

### Authentication

- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### Cases

- `GET /api/cases` - List all cases
- `POST /api/cases` - Create new case
- `GET /api/cases/[id]` - Get case details
- `PUT /api/cases/[id]` - Update case
- `DELETE /api/cases/[id]` - Delete case

### Clients

- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- Similar CRUD patterns for other resources

## 🛠️ Configuration

### Environment Variables

See `.env.example` for all available options.

### Rate Limits

Default limits (configurable in `lib/rate-limit.ts`):
- Auth endpoints: 5 requests / 15 minutes
- API endpoints: 100 requests / 15 minutes
- File uploads: 10 requests / 15 minutes

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql "postgresql://username:password@localhost:5432/dbname"

# Check if Prisma can connect
npx prisma db pull
```

### Authentication Issues
- Clear browser cookies and try again
- Verify JWT_SECRET is set in .env
- Check that tokens haven't expired (default: 7 days)

### File Upload Issues
- Ensure `/public/uploads` directory exists
- Check file size is under 5MB
- Verify file type is allowed
- Check directory permissions

### Build Errors
```bash
# Clear caches and rebuild
rm -rf .next node_modules
npm install
npx prisma generate
npm run build
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check the [PRODUCTION-GUIDE.md](./PRODUCTION-GUIDE.md)

---

**Built with ❤️ for legal professionals**