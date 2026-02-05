"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { checkAuthStatus, saveGeminiKey, getGeminiKeyStatus } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Palette,
  Shield,
  CreditCard,
  Key,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(true)
  const [userEmail, setUserEmail] = useState("")

  // AI Settings State
  const [geminiKey, setGeminiKey] = useState("")
  const [isKeySet, setIsKeySet] = useState(false)
  const [defaultAvailable, setDefaultAvailable] = useState(false)
  const [isSavingKey, setIsSavingKey] = useState(false)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user
      const status = await checkAuthStatus()
      if (status.authenticated && status.user_email) {
        setUserEmail(status.user_email)
      }

      // Fetch key status
      try {
        const keyStatus = await getGeminiKeyStatus()
        setIsKeySet(keyStatus.is_set)
        setDefaultAvailable(keyStatus.default_available)
      } catch (e) {
        console.error("Failed to fetch key status", e)
      }
    }
    fetchData()
  }, [])

  const handleSaveKey = async () => {
    if (!geminiKey.trim()) return

    setIsSavingKey(true)
    try {
      await saveGeminiKey(geminiKey)
      setIsKeySet(true)
      setGeminiKey("") // Clear input after save
      alert("API Key saved successfully!")
    } catch (error) {
      console.error("Failed to save key", error)
      alert("Failed to save API Key")
    } finally {
      setIsSavingKey(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[80%] rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[40%] -right-[20%] h-[80%] w-[80%] rounded-full bg-gradient-to-tl from-accent/20 via-primary/10 to-transparent blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-r-2 border-primary/20 bg-sidebar/60 backdrop-blur-xl transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"
            }`}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b-2 border-primary/15">
            {!sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-xl font-bold text-sidebar-foreground">
                  Form<span className="text-primary">AI</span>
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              href="/dashboard"
              collapsed={sidebarCollapsed}
            />
            <NavItem icon={FileText} label="My Forms" href="/my-forms" collapsed={sidebarCollapsed} />
            <NavItem
              icon={Settings}
              label="Settings"
              href="/settings"
              active
              collapsed={sidebarCollapsed}
            />
          </nav>

          <div className="border-t-2 border-primary/15 p-3">
            <NavItem icon={LogOut} label="Sign Out" href="/" collapsed={sidebarCollapsed} />
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b-2 border-primary/20 bg-sidebar/60 backdrop-blur-xl px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              Form<span className="text-primary">AI</span>
            </span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar/95 backdrop-blur-xl border-l-2 border-primary/20">
              <nav className="flex flex-col gap-4 mt-8">
                <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
                <NavItem icon={FileText} label="My Forms" href="/my-forms" />
                <NavItem icon={Settings} label="Settings" href="/settings" active />
                <div className="mt-auto pt-4 border-t-2 border-primary/15">
                  <NavItem icon={LogOut} label="Sign Out" href="/" />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl mx-auto px-4 py-8 lg:py-12 lg:pt-8 pt-24">
            {/* Header */}
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Settings</h1>
              <p className="text-muted-foreground text-pretty">
                Manage your account preferences and application settings
              </p>
            </div>

            <div className="space-y-6">
              {/* Profile Settings */}
              <Card className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Update your personal information and profile details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-card-foreground">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="First Name"
                        disabled
                        className="h-11 bg-input/80 backdrop-blur-sm border-2 border-primary/20 text-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-card-foreground">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Last Name"
                        disabled
                        className="h-11 bg-input/80 backdrop-blur-sm border-2 border-primary/20 text-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-card-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      disabled
                      className="h-11 bg-input/80 backdrop-blur-sm border-2 border-primary/20 text-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-card-foreground">
                      Company
                    </Label>
                    <Input
                      id="company"
                      placeholder="Company"
                      disabled
                      className="h-11 bg-input/80 backdrop-blur-sm border-2 border-primary/20 text-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-[1.02] transition-all duration-200">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              {/* AI Configuration */}
              <Card className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-50">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    AI Configuration
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure your Gemini AI settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-4 mb-4">
                    <p className="text-sm text-foreground font-medium mb-1">Current Status:</p>
                    <div className="flex flex-col gap-2">
                      {isKeySet ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Custom API Key Active</span>
                        </div>
                      ) : defaultAvailable ? (
                        <div className="flex items-center gap-2 text-yellow-500">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Using System Default Key (Limited)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">No API Key Configured</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-card-foreground">
                      Gemini API Key
                    </Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showKey ? "text" : "password"}
                        placeholder={isKeySet ? "••••••••••••••••" : "Enter your Gemini API Key"}
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        className="h-11 pr-10 bg-input/80 backdrop-blur-sm border-2 border-primary/20 text-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your key is encrypted and stored securely. It overrides the system default.
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveKey}
                    disabled={isSavingKey || !geminiKey}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-[1.02] transition-all duration-200"
                  >
                    {isSavingKey ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save API Key"}
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-card-foreground font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your forms
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications" className="text-card-foreground font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails" className="text-card-foreground font-medium">
                        Marketing Emails
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features and updates
                      </p>
                    </div>
                    <Switch
                      id="marketing-emails"
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Appearance Settings */}
              <Card className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Appearance
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Customize the look and feel of your interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-card-foreground">
                      Theme
                    </Label>
                    <Select defaultValue="dark">
                      <SelectTrigger
                        id="theme"
                        className="h-11 bg-input/80 backdrop-blur-sm border-2 border-primary/20"
                      >
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-2 border-primary/20">
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-card-foreground">
                      Language
                    </Label>
                    <Select defaultValue="en">
                      <SelectTrigger
                        id="language"
                        className="h-11 bg-input/80 backdrop-blur-sm border-2 border-primary/20"
                      >
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-2 border-primary/20">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage your security and authentication settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Password</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-11 bg-input/80 backdrop-blur-sm border-2 border-primary/20 hover:bg-card/80 hover:border-primary/30"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Two-Factor Authentication</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-11 bg-input/80 backdrop-blur-sm border-2 border-primary/20 hover:bg-card/80 hover:border-primary/30"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Settings */}
              <Card className="border-2 border-accent/25 bg-card/40 backdrop-blur-xl shadow-lg shadow-accent/10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage your subscription and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border-2 border-accent/20 bg-accent/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-card-foreground">Free Plan</span>
                      <span className="text-2xl font-bold text-accent">$0/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create unlimited forms with AI
                    </p>
                    <Button
                      variant="outline"
                      className="w-full bg-input/80 backdrop-blur-sm border-2 border-accent/30 hover:bg-accent/10"
                    >
                      Manage Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

interface NavItemProps {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
  collapsed?: boolean
}

function NavItem({ icon: Icon, label, href, active, collapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 border transition-all duration-200 hover:scale-[1.02] ${active
        ? "bg-sidebar-accent text-sidebar-accent-foreground border-primary/30 shadow-sm shadow-primary/5"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-transparent hover:border-primary/20"
        }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 hover:rotate-12" />
      {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
  )
}
