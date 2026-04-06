"use client"

import { useState } from "react"
import {
  FlaskConical,
  Droplets,
  Thermometer,
  Wind,
  Loader2,
  Wheat,
  Sprout,
  Info,
  BeakerIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SoilForm {
  nitrogen: string
  phosphorus: string
  potassium: string
  ph: string
  temperature: string
  humidity: string
}

interface CropRecommendation {
  name: string
  suitability: number
  reason: string
}

interface SoilResult {
  healthScore: number
  healthLabel: string
  crops: CropRecommendation[]
  fertilizer: {
    type: string
    quantity: string
    schedule: string
  }
}

const initialForm: SoilForm = {
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  ph: "",
  temperature: "",
  humidity: "",
}

const mockResult: SoilResult = {
  healthScore: 72,
  healthLabel: "Good",
  crops: [
    {
      name: "Rice (Paddy)",
      suitability: 92,
      reason:
        "Optimal nitrogen and humidity levels. The pH is within the ideal range for paddy cultivation.",
    },
    {
      name: "Sugarcane",
      suitability: 85,
      reason:
        "Good potassium levels support strong stalk growth. Adequate temperature range for the crop.",
    },
    {
      name: "Cotton",
      suitability: 78,
      reason:
        "Phosphorus levels are favorable. Cotton is well-suited for the current temperature conditions.",
    },
  ],
  fertilizer: {
    type: "NPK 20-10-10 (Nitrogen-heavy)",
    quantity: "120 kg/hectare",
    schedule: "Apply in 2 split doses: 60 kg at sowing, 60 kg at 30 days after planting.",
  },
}

function getHealthColor(score: number) {
  if (score >= 80) return "text-success"
  if (score >= 60) return "text-chart-1"
  if (score >= 40) return "text-warning"
  return "text-destructive"
}

function getHealthBg(score: number) {
  if (score >= 80) return "bg-success/10"
  if (score >= 60) return "bg-chart-1/10"
  if (score >= 40) return "bg-warning/10"
  return "bg-destructive/10"
}

function getHealthLabel(score: number) {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Fair"
  return "Poor"
}

export function SoilAnalysis() {
  const [form, setForm] = useState<SoilForm>(initialForm)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<SoilResult | null>(null)

  const updateField = (field: keyof SoilForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = Object.values(form).every((v) => v.trim() !== "")

  const handleAnalyze = () => {
    if (!isFormValid) return
    setAnalyzing(true)
    setResult(null)
    setTimeout(() => {
      setResult(mockResult)
      setAnalyzing(false)
    }, 2500)
  }

  const fields = [
    {
      key: "nitrogen" as const,
      label: "Nitrogen (N)",
      unit: "mg/kg",
      icon: Sprout,
      placeholder: "e.g., 85",
    },
    {
      key: "phosphorus" as const,
      label: "Phosphorus (P)",
      unit: "mg/kg",
      icon: FlaskConical,
      placeholder: "e.g., 42",
    },
    {
      key: "potassium" as const,
      label: "Potassium (K)",
      unit: "mg/kg",
      icon: BeakerIcon,
      placeholder: "e.g., 55",
    },
    {
      key: "ph" as const,
      label: "pH Level",
      unit: "",
      icon: Droplets,
      placeholder: "e.g., 6.5",
    },
    {
      key: "temperature" as const,
      label: "Temperature",
      unit: "\u00B0C",
      icon: Thermometer,
      placeholder: "e.g., 28",
    },
    {
      key: "humidity" as const,
      label: "Humidity",
      unit: "%",
      icon: Wind,
      placeholder: "e.g., 72",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Soil Analysis & Recommendations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your soil test results to get crop recommendations and
          fertilizer advice.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Soil Parameters
            </CardTitle>
            <CardDescription>
              Enter the values from your soil test report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {fields.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <Label
                      htmlFor={f.key}
                      className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {f.label}
                      {f.unit && (
                        <span className="text-muted-foreground">
                          ({f.unit})
                        </span>
                      )}
                    </Label>
                    <Input
                      id={f.key}
                      type="number"
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      className="text-foreground"
                    />
                  </div>
                )
              })}
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!isFormValid || analyzing}
              className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Soil Data...
                </>
              ) : (
                "Get Recommendations"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          {analyzing && (
            <>
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            </>
          )}

          {result && !analyzing && (
            <TooltipProvider>
              {/* Health Score */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-foreground">
                    Soil Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div
                      className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full ${getHealthBg(
                        result.healthScore
                      )}`}
                    >
                      <span
                        className={`text-3xl font-bold ${getHealthColor(
                          result.healthScore
                        )}`}
                      >
                        {result.healthScore}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / 100
                      </span>
                    </div>
                    <div className="flex-1">
                      <Badge
                        className={`mb-2 ${getHealthBg(
                          result.healthScore
                        )} ${getHealthColor(result.healthScore)} border-0`}
                      >
                        {getHealthLabel(result.healthScore)}
                      </Badge>
                      <Progress value={result.healthScore} className="h-2.5" />
                      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                        <span>Poor</span>
                        <span>Fair</span>
                        <span>Good</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top 3 Crops */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Wheat className="h-5 w-5 text-accent" />
                    <CardTitle className="text-base text-foreground">
                      Top 3 Recommended Crops
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {result.crops.map((crop, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 rounded-lg border border-border p-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-sm font-bold text-accent">
                          #{i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {crop.name}
                            </p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 shrink-0 cursor-help text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-xs bg-popover text-popover-foreground"
                              >
                                <p className="text-xs">{crop.reason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Progress
                              value={crop.suitability}
                              className="h-1.5 flex-1"
                            />
                            <span className="text-xs font-medium text-muted-foreground">
                              {crop.suitability}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fertilizer Advice */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-chart-3" />
                    <CardTitle className="text-base text-foreground">
                      Fertilizer Advice
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Recommended Type
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {result.fertilizer.type}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Quantity
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {result.fertilizer.quantity}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Application Schedule
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {result.fertilizer.schedule}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipProvider>
          )}

          {!result && !analyzing && (
            <Card className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FlaskConical className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                No analysis yet
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Fill in your soil parameters and click
                &quot;Get Recommendations&quot;
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
