import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Search, Settings, User, Shield, Bell, Globe } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-bold">Pakistan Legal Manager</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/cases" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Cases
            </Link>
            <Link href="/clients" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Clients
            </Link>
            <Link href="/calendar" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Calendar
            </Link>
            <Link href="/settings" className="text-sm font-medium text-foreground">
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <img src="/placeholder.svg?height=32&width=32" alt="User" className="h-8 w-8 rounded-full" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/40">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          </div>
          <div className="mt-6">
            <Tabs defaultValue="profile">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4">
                  <TabsList className="flex flex-col h-auto p-0 bg-transparent">
                    <TabsTrigger value="profile" className="justify-start px-4 py-2 data-[state=active]:bg-muted">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="account" className="justify-start px-4 py-2 data-[state=active]:bg-muted">
                      <Settings className="mr-2 h-4 w-4" />
                      Account
                    </TabsTrigger>
                    <TabsTrigger value="security" className="justify-start px-4 py-2 data-[state=active]:bg-muted">
                      <Shield className="mr-2 h-4 w-4" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="justify-start px-4 py-2 data-[state=active]:bg-muted">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="language" className="justify-start px-4 py-2 data-[state=active]:bg-muted">
                      <Globe className="mr-2 h-4 w-4" />
                      Language
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="md:w-3/4">
                  <TabsContent value="profile" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Manage your personal information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue="Fatima" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue="Javed" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" defaultValue="fatima.javed@example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" defaultValue="0300-1234567" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Textarea id="address" defaultValue="123 Jinnah Avenue, Islamabad, Pakistan" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  <TabsContent value="account" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Manage your account preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="firmName">Law Firm Name</Label>
                          <Input id="firmName" defaultValue="Javed & Associates" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">License Number</Label>
                          <Input id="licenseNumber" defaultValue="PBC-12345-IS" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="courtRegistration">Court Registration Number</Label>
                          <Input id="courtRegistration" defaultValue="LHC-789-2023" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="emailNotifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive email notifications for case updates
                            </p>
                          </div>
                          <Switch id="emailNotifications" defaultChecked />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  <TabsContent value="security" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Manage your security settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input id="currentPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Switch id="twoFactor" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">Update Password</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  <TabsContent value="notifications" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Manage your notification preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Case Updates</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications for case updates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Hearing Reminders</Label>
                            <p className="text-sm text-muted-foreground">Receive reminders for upcoming hearings</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Deadline Alerts</Label>
                            <p className="text-sm text-muted-foreground">Receive alerts for approaching deadlines</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Client Communications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications for client messages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">Save Preferences</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  <TabsContent value="language" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Language & Region</CardTitle>
                        <CardDescription>Manage your language and regional preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <select
                            id="language"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="en">English</option>
                            <option value="ur">Urdu</option>
                            <option value="en-ur">English & Urdu (Bilingual)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateFormat">Date Format</Label>
                          <select
                            id="dateFormat"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                            <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                            <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timeFormat">Time Format</Label>
                          <select
                            id="timeFormat"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="12">12-hour (AM/PM)</option>
                            <option value="24">24-hour</option>
                          </select>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">Save Preferences</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

