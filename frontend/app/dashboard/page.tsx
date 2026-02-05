"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { generateForm, getHistory, getStats, FormHistoryItem, UserStats } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Sparkles,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react"

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const [history, setHistory] = useState<FormHistoryItem[]>([])
  const [statsData, setStatsData] = useState<UserStats>({
    total_forms: 0,
    total_responses: 0,
    tokens_used: "0"
  })

  // Fetch history and stats on mount
  useEffect(() => {
    fetchHistory()
    fetchStats()
  }, [])

  const fetchHistory = async () => {
    try {
      const data = await getHistory()
      setHistory(data)
    } catch (error) {
      console.error("Failed to fetch history:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await getStats()
      setStatsData(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const result = await generateForm(prompt)
      // Open form in new tab
      window.open(result.form_url, '_blank')
      // Refresh history
      fetchHistory()
      fetchStats()
      setPrompt("")
    } catch (error) {
      console.error("Generation failed:", error)
      alert("Failed to generate form. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const stats = [
    { title: "Total Forms", value: statsData.total_forms.toString(), icon: FileText },
    { title: "Total Responses", value: statsData.total_responses.toString(), icon: BarChart3 },
    { title: "AI Tokens Used", value: statsData.tokens_used, icon: Sparkles },
  ]

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
              active
              collapsed={sidebarCollapsed}
            />
            <NavItem icon={FileText} label="My Forms" href="/my-forms" collapsed={sidebarCollapsed} />
            <NavItem icon={Settings} label="Settings" href="/settings" collapsed={sidebarCollapsed} />
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
                <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" active />
                <NavItem icon={FileText} label="My Forms" href="/my-forms" />
                <NavItem icon={Settings} label="Settings" href="/settings" />
                <div className="mt-auto pt-4 border-t-2 border-primary/15">
                  <NavItem icon={LogOut} label="Sign Out" href="/" />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 lg:py-12 lg:pt-8 pt-24">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card
                    key={stat.title}
                    className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all hover:bg-card/50 hover:scale-[1.02] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-card-foreground">
                        {stat.title}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-card-foreground">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        +12% from last month
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Magic Input Section */}
            <Card className="mb-8 border-2 border-accent/25 bg-card/40 backdrop-blur-xl shadow-xl shadow-accent/10 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <CardHeader>
                <CardTitle className="text-2xl text-card-foreground flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  Magic Input
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Describe your form and let AI generate it for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Example: Create a 10-question customer satisfaction survey for a coffee shop with rating scales, multiple choice, and open-ended questions..."
                  className="min-h-[120px] resize-none bg-input/80 backdrop-blur-sm border-2 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 focus:ring-2 transition-all duration-200 focus:scale-[1.01]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? "Generating with AI..." : "Generate with AI"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isGenerating && (
              <Card className="mb-8 border-2 border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    Generating your form...
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full bg-muted/50 animate-pulse" />
                  <Skeleton className="h-4 w-3/4 bg-muted/50 animate-pulse" style={{ animationDelay: '100ms' }} />
                  <Skeleton className="h-4 w-5/6 bg-muted/50 animate-pulse" style={{ animationDelay: '200ms' }} />
                </CardContent>
              </Card>
            )}

            {/* Recent Activity Table */}
            <Card className="border-2 border-primary/30 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <CardHeader>
                <CardTitle className="text-card-foreground text-2xl">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your recently created forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border-2 border-border/30 overflow-hidden shadow-inner">
                  <div
                    className="overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-muted/20">
                          <TableHead className="text-card-foreground font-semibold">
                            Form Title
                          </TableHead>
                          <TableHead className="text-card-foreground font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="text-card-foreground font-semibold">
                            Responses
                          </TableHead>
                          <TableHead className="text-card-foreground font-semibold">
                            Created
                          </TableHead>
                          <TableHead className="text-right text-card-foreground font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground h-32">
                              No forms created yet. Try the Magic Input above!
                            </TableCell>
                          </TableRow>
                        ) : (
                          history.map((form) => (
                            <TableRow
                              key={form._id}
                              className="border-border/50 hover:bg-muted/20 hover:scale-[1.01] transition-all duration-200"
                            >
                              <TableCell className="font-medium text-card-foreground">
                                {form.form_title}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="default"
                                  className="bg-primary/20 text-primary border-primary/30"
                                >
                                  Ready
                                </Badge>
                              </TableCell>
                              <TableCell className="text-card-foreground">
                                -
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDate(form.created_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(form.form_url, '_blank')}
                                  className="text-primary hover:text-primary/80 hover:bg-primary/10 hover:scale-110 transition-all duration-200"
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          )))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
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
