"use client"

import { useState, useMemo } from "react"
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  IndianRupee,
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

const crops = [
  "Rice",
  "Wheat",
  "Cotton",
  "Sugarcane",
  "Maize",
  "Soybean",
  "Groundnut",
  "Tomato",
]

function generateForecast(basePrice: number, days: number) {
  const data = []
  let currentPrice = basePrice
  for (let i = 0; i <= days; i++) {
    const change = (Math.random() - 0.45) * (basePrice * 0.02)
    currentPrice = Math.max(currentPrice + change, basePrice * 0.85)
    data.push({
      day: i === 0 ? "Today" : `Day ${i}`,
      price: Math.round(currentPrice * 100) / 100,
      lower: Math.round((currentPrice - basePrice * 0.03) * 100) / 100,
      upper: Math.round((currentPrice + basePrice * 0.03) * 100) / 100,
    })
  }
  return data
}

export function PricePredictor() {
  const [crop, setCrop] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [forecast, setForecast] = useState<{
    day7: ReturnType<typeof generateForecast>
    day14: ReturnType<typeof generateForecast>
    day30: ReturnType<typeof generateForecast>
    recommendation: "sell" | "wait"
    predictedChange: number
  } | null>(null)

  const handlePredict = () => {
    if (!crop || !currentPrice) return
    setAnalyzing(true)
    setForecast(null)
    setTimeout(() => {
      const price = parseFloat(currentPrice)
      const d7 = generateForecast(price, 7)
      const d14 = generateForecast(price, 14)
      const d30 = generateForecast(price, 30)
      const finalPrice = d30[d30.length - 1].price
      const change = ((finalPrice - price) / price) * 100
      setForecast({
        day7: d7,
        day14: d14,
        day30: d30,
        recommendation: change > 2 ? "wait" : "sell",
        predictedChange: Math.round(change * 10) / 10,
      })
      setAnalyzing(false)
    }, 2000)
  }

  const chartConfig = {
    price: { color: "hsl(var(--chart-1))" },
    upper: { color: "hsl(var(--chart-1))" },
    lower: { color: "hsl(var(--chart-1))" },
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Crop Price Predictor
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get AI-powered price forecasts and market recommendations for your
          crops.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Market Input
            </CardTitle>
            <CardDescription>
              Select a crop and enter the current market price
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Crop Type
              </Label>
              <Select value={crop} onValueChange={setCrop}>
                <SelectTrigger className="text-foreground">
                  <SelectValue placeholder="Select a crop" />
                </SelectTrigger>
                <SelectContent>
                  {crops.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Current Market Price (per quintal)
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="e.g., 2200"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className="pl-9 text-foreground"
                />
              </div>
            </div>
            <Button
              onClick={handlePredict}
              disabled={!crop || !currentPrice || analyzing}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                "Get Price Forecast"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Forecast Charts */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {analyzing && (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          )}

          {forecast && !analyzing && (
            <>
              {/* Market Alert */}
              <Card
                className={`border-2 ${
                  forecast.recommendation === "sell"
                    ? "border-success/30 bg-success/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      forecast.recommendation === "sell"
                        ? "bg-success/10"
                        : "bg-destructive/10"
                    }`}
                  >
                    {forecast.recommendation === "sell" ? (
                      <TrendingUp className="h-6 w-6 text-success" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-foreground">
                        Market Alert
                      </p>
                      <Badge
                        className={`${
                          forecast.recommendation === "sell"
                            ? "bg-success text-success-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }`}
                      >
                        {forecast.recommendation === "sell"
                          ? "Sell Now"
                          : "Wait"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Predicted 30-day change:{" "}
                      <span
                        className={`font-semibold ${
                          forecast.predictedChange >= 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {forecast.predictedChange >= 0 ? "+" : ""}
                        {forecast.predictedChange}%
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-foreground">
                    Price Forecast for{" "}
                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="7" className="w-full">
                    <TabsList className="mb-4 w-full">
                      <TabsTrigger value="7" className="flex-1">
                        7 Days
                      </TabsTrigger>
                      <TabsTrigger value="14" className="flex-1">
                        14 Days
                      </TabsTrigger>
                      <TabsTrigger value="30" className="flex-1">
                        30 Days
                      </TabsTrigger>
                    </TabsList>
                    {(["7", "14", "30"] as const).map((period) => {
                      const data =
                        period === "7"
                          ? forecast.day7
                          : period === "14"
                          ? forecast.day14
                          : forecast.day30
                      return (
                        <TabsContent key={period} value={period}>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={data}>
                                <defs>
                                  <linearGradient
                                    id="priceGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="hsl(var(--chart-1))"
                                      stopOpacity={0.2}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="hsl(var(--chart-1))"
                                      stopOpacity={0}
                                    />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="hsl(var(--border))"
                                />
                                <XAxis
                                  dataKey="day"
                                  fontSize={11}
                                  tickLine={false}
                                  axisLine={false}
                                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                                />
                                <YAxis
                                  fontSize={11}
                                  tickLine={false}
                                  axisLine={false}
                                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                                  tickFormatter={(v) => `\u20B9${v}`}
                                />
                                <RechartsTooltip
                                  contentStyle={{
                                    background: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                    fontSize: 12,
                                    color: "hsl(var(--foreground))",
                                  }}
                                  formatter={(value: number) => [
                                    `\u20B9${value}`,
                                    "Price",
                                  ]}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="price"
                                  stroke="hsl(var(--chart-1))"
                                  fill="url(#priceGradient)"
                                  strokeWidth={2}
                                  dot={false}
                                  activeDot={{
                                    r: 4,
                                    fill: "hsl(var(--chart-1))",
                                  }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}

          {!forecast && !analyzing && (
            <Card className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <TrendingUp className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                No forecast yet
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Select a crop and enter a price to see the forecast
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
