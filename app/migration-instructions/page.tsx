import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function MigrationInstructions() {
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-emerald-600 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-2">Database Migration Instructions</h1>
        <p className="text-muted-foreground">Follow these steps to update your database schema</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What happened?</CardTitle>
          <CardDescription>Understanding the database error</CardDescription>
        </CardHeader>
        <CardContent className="prose">
          <p>
            The application's database schema has been updated with new features, but your database
            hasn't been updated yet. This causes errors when the application tries to access tables or
            columns that don't exist in your current database.
          </p>
          <p>
            The changes include:
          </p>
          <ul>
            <li>Added <code>caseType</code> field to the Case model</li>
            <li>Added a <code>Note</code> model for case notes</li>
            <li>Updated relationships between models</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Option 1: Using the PowerShell Script (Windows)</CardTitle>
          <CardDescription>Recommended for Windows users</CardDescription>
        </CardHeader>
        <CardContent className="prose">
          <ol>
            <li>Right-click on PowerShell and select "Run as Administrator"</li>
            <li>Navigate to your project directory</li>
            <li>
              Run the following command to temporarily allow script execution:
              <pre><code>Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass</code></pre>
            </li>
            <li>
              Run the migration script:
              <pre><code>.\apply-migrations.ps1</code></pre>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Option 2: Using Node.js Script</CardTitle>
          <CardDescription>Works on any platform</CardDescription>
        </CardHeader>
        <CardContent className="prose">
          <ol>
            <li>Open a terminal or command prompt</li>
            <li>Navigate to your project directory</li>
            <li>
              Run:
              <pre><code>node prisma/migrations/apply-pending-migrations.js</code></pre>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Option 3: Manual Migration</CardTitle>
          <CardDescription>If the scripts don't work</CardDescription>
        </CardHeader>
        <CardContent className="prose">
          <ol>
            <li>
              Generate the migration files:
              <pre><code>npx prisma migrate dev --name add-case-type-and-notes --create-only</code></pre>
            </li>
            <li>
              Apply the migrations:
              <pre><code>npx prisma migrate dev</code></pre>
            </li>
            <li>
              Update the Prisma client:
              <pre><code>npx prisma generate</code></pre>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>After Migration</CardTitle>
          <CardDescription>Complete the process</CardDescription>
        </CardHeader>
        <CardContent className="prose">
          <p>
            Once the migration is complete, restart your application with:
            <pre><code>npm run dev</code></pre>
          </p>
          <p>
            <strong>Troubleshooting:</strong>
          </p>
          <ul>
            <li>Ensure your database server is running</li>
            <li>Check that your DATABASE_URL in the .env file is correct</li>
            <li>Make sure you have the necessary database permissions</li>
            <li>
              For a clean start (warning: this deletes all data), you can run:
              <pre><code>npx prisma migrate reset</code></pre>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 