"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getHistory, FormHistoryItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function MyFormsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [forms, setForms] = useState<FormHistoryItem[]>([])

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const data = await getHistory(0, 100)
      setForms(data)
    } catch (error) {
      console.error("Failed to fetch forms:", error)
    }
  }

  const filteredForms = forms.filter((form) =>
    form.form_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return "Today"
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
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
            <NavItem
              icon={FileText}
              label="My Forms"
              href="/my-forms"
              active
              collapsed={sidebarCollapsed}
            />
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
                <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
                <NavItem icon={FileText} label="My Forms" href="/my-forms" active />
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
            {/* Header */}
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">My Forms</h1>
              <p className="text-muted-foreground text-pretty">
                Manage and organize all your AI-generated forms
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-in fade-in slide-in-from-top-6 duration-500 delay-100">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-input/80 backdrop-blur-sm border-2 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              <Link href="/dashboard">
                <Button className="h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Form
                </Button>
              </Link>
            </div>

            {/* Forms Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredForms.map((form, index) => (
                <Card
                  key={form._id}
                  className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all hover:scale-[1.02] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-card-foreground mb-1 text-balance">
                          {form.form_title}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground line-clamp-2 text-pretty">
                          {form.prompt}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-xl border-2 border-primary/20">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(form.form_url, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          {/* 
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                           */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="default"
                        className="bg-primary/20 text-primary border-primary/30"
                      >
                        Ready
                      </Badge>
                      <span className="text-sm text-muted-foreground">{formatDate(form.created_at)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t-2 border-border/20">
                      <div>
                        <p className="text-xs text-muted-foreground">Responses</p>
                        <p className="text-xl font-bold text-card-foreground">-</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="text-xl font-bold text-card-foreground">-</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredForms.length === 0 && (
              <Card className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl shadow-lg text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">No forms found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or create a new form
                  </p>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Form
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
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
