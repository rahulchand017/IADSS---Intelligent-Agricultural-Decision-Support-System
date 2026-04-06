"use client"

import {
  Leaf,
  FlaskConical,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const modules = [
  {
    id: "disease",
    title: "Plant Disease Detection",
    description: "Upload leaf images to identify diseases with AI-powered analysis",
    icon: Leaf,
    stats: "3 scans today",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    id: "soil",
    title: "Soil Analysis",
    description: "Get crop recommendations and fertilizer advice based on soil data",
    icon: FlaskConical,
    stats: "Last test: 2 days ago",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    id: "price",
    title: "Crop Price Predictor",
    description: "View market forecasts and get buy/sell recommendations",
    icon: TrendingUp,
    stats: "5 crops tracked",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "chat",
    title: "AI Chatbot",
    description: "Ask questions about farming practices, diseases, and more",
    icon: MessageCircle,
    stats: "Always available",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
]

const recentActivity = [
  {
    id: 1,
    type: "disease",
    title: "Tomato Leaf Scan",
    result: "Early Blight Detected",
    confidence: "94%",
    time: "2 hours ago",
    status: "warning" as const,
  },
  {
    id: 2,
    type: "soil",
    title: "Field A - Soil Test",
    result: "Health Score: Good (72/100)",
    confidence: null,
    time: "1 day ago",
    status: "success" as const,
  },
  {
    id: 3,
    type: "price",
    title: "Rice Price Check",
    result: "Recommendation: Sell Now",
    confidence: null,
    time: "2 days ago",
    status: "success" as const,
  },
  {
    id: 4,
    type: "disease",
    title: "Wheat Leaf Scan",
    result: "No Disease Found",
    confidence: "98%",
    time: "3 days ago",
    status: "success" as const,
  },
  {
    id: 5,
    type: "soil",
    title: "Field B - Soil Test",
    result: "Health Score: Poor (35/100)",
    confidence: null,
    time: "5 days ago",
    status: "warning" as const,
  },
]

interface DashboardProps {
  onModuleChange: (module: string) => void
}

export function Dashboard({ onModuleChange }: DashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Welcome back, Kumar
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is an overview of your farm analytics and recent activity.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-1/10">
              <Activity className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Scans This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
              <FlaskConical className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-xs text-muted-foreground">Soil Tests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">8</p>
              <p className="text-xs text-muted-foreground">Healthy Crops</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">2</p>
              <p className="text-xs text-muted-foreground">Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Cards */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Modules
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <Card
                key={mod.id}
                className="group cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => onModuleChange(mod.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg ${mod.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${mod.color}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="text-base text-foreground">
                    {mod.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {mod.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {mod.stats}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Recent Activity
        </h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-4 py-3 lg:px-6"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      item.status === "success"
                        ? "bg-success/10"
                        : "bg-warning/10"
                    }`}
                  >
                    {item.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.result}
                    </p>
                  </div>
                  {item.confidence && (
                    <Badge
                      variant="secondary"
                      className="hidden shrink-0 sm:inline-flex"
                    >
                      {item.confidence}
                    </Badge>
                  )}
                  <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="hidden sm:inline">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
