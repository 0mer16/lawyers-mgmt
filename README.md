# Pakistan Legal Manager - Lawyers Management System

A comprehensive case management system for law firms in Pakistan. This application helps lawyers manage their cases, clients, hearings, and documents in a single platform.

## Features

- **User Authentication**: Secure login system with role-based access control
- **Dashboard**: Overview of active cases, pending hearings, clients, and success rate
- **Case Management**: Track case details, hearings, outcomes, and related documents
- **Client Management**: Maintain client information and case history
- **Calendar**: Schedule and manage hearings, meetings, and deadlines
- **Document Management**: Store and organize legal documents by case or client

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, shadcn/ui components
- **Backend**: Next.js API Routes with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lawyers-management-system.git
   cd lawyers-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```
   # Create a .env file in the root directory with the following variables
   DATABASE_URL="postgresql://postgres:password@localhost:5432/lawyers_management_system"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Set up the database:
   ```bash
   npx prisma db push
   ```

5. Seed the database with initial data:
   ```bash
   npx prisma db seed
   ```

6. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Admin User**: admin@example.com / admin123
- **Lawyer User**: lawyer@example.com / lawyer123

## License

This project is licensed under the MIT License.

## Setup and Running

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up your database according to the schema in `prisma/schema.prisma`
4. Run migrations with `npx prisma migrate dev`
5. Start the development server with `npm run dev`

### For Windows Users

If you encounter a PowerShell execution policy error when running npm commands (like the one below), use the following command to bypass the restriction for the current process:

```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Run this command in PowerShell to temporarily allow script execution for the current session only:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then try running your npm command again:

```powershell
npm run dev
```

Note: This only changes the execution policy for the current PowerShell session. If you open a new terminal window, you'll need to run the command again.

## Troubleshooting

### Case Update Issues

If you encounter issues updating case information:
1. Make sure you're properly authenticated
2. Check that all required fields are filled in
3. Ensure client IDs are properly formatted

### Document Upload Issues

If you have trouble uploading documents:
1. Make sure the file size is less than 5MB
2. Ensure the file type is supported (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)
3. Check that the uploads directory (`public/uploads`) exists and has proper write permissions
4. For Windows users, make sure PowerShell execution policy allows running the scripts 