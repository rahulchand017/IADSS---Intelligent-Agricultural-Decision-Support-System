"use client"

import React from "react"

import { useState } from "react"
import {
  LayoutDashboard,
  Leaf,
  FlaskConical,
  TrendingUp,
  MessageCircle,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  Sprout,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "disease", label: "Disease Detection", icon: Leaf },
  { id: "soil", label: "Soil Analysis", icon: FlaskConical },
  { id: "price", label: "Price Predictor", icon: TrendingUp },
  { id: "chat", label: "AI Chatbot", icon: MessageCircle },
]

interface AppShellProps {
  activeModule: string
  onModuleChange: (module: string) => void
  children: React.ReactNode
}

export function AppShell({
  activeModule,
  onModuleChange,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const SidebarNav = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeModule === item.id
        return (
          <button
            key={item.id}
            onClick={() => {
              onModuleChange(item.id)
              onItemClick?.()
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent">
            <Sprout className="h-5 w-5 text-sidebar-accent-foreground" />
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-tight text-sidebar-foreground">
              IADSS
            </p>
            <p className="text-[11px] text-sidebar-foreground/60">
              AgriTech Dashboard
            </p>
          </div>
        </div>
        <Separator className="bg-sidebar-border" />
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>
        <Separator className="bg-sidebar-border" />
        <div className="p-4">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
                FK
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-sidebar-foreground">
                Farmer Kumar
              </p>
              <p className="text-[11px] text-sidebar-foreground/50">
                Andhra Pradesh
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
              >
                <SheetHeader className="px-6 pt-6 pb-4">
                  <SheetTitle className="flex items-center gap-2.5 text-sidebar-foreground">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent">
                      <Sprout className="h-5 w-5 text-sidebar-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold tracking-tight">
                        IADSS
                      </p>
                      <p className="text-[11px] font-normal text-sidebar-foreground/60">
                        AgriTech Dashboard
                      </p>
                    </div>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation menu for IADSS dashboard modules
                  </SheetDescription>
                </SheetHeader>
                <Separator className="bg-sidebar-border" />
                <div className="py-4">
                  <SidebarNav onItemClick={() => setSidebarOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <div className="lg:hidden flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              <span className="font-display text-sm font-bold text-foreground">
                IADSS
              </span>
            </div>
            <h1 className="hidden text-lg font-semibold text-foreground lg:block">
              {navItems.find((n) => n.id === activeModule)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Avatar className="h-8 w-8 lg:hidden">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                FK
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">{children}</div>
        </main>
      </div>

      {/* Profile Settings Sidebar */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent className="bg-card">
          <SheetHeader>
            <SheetTitle className="text-foreground">
              Profile Settings
            </SheetTitle>
            <SheetDescription className="sr-only">
              View and manage your profile information
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                  FK
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  Farmer Kumar
                </p>
                <p className="text-sm text-muted-foreground">
                  farmer.kumar@email.com
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Region</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Andhra Pradesh
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Primary Crop</span>
                </div>
                <span className="text-sm text-muted-foreground">Rice</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Soil Tests Done
                  </span>
                </div>
                <span className="text-sm font-medium text-primary">12</span>
              </div>
            </div>
            <Separator />
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
