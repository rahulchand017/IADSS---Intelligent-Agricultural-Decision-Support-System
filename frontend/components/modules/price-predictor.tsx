"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Loader2, IndianRupee } from "lucide-react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const CROPS = [
  "Barley", "Coffee", "Cotton", "Groundnut", "Jute",
  "Maize", "Millets", "Mustard", "Onion", "Potato",
  "Pulses", "Rice", "Sesame", "Soybean", "Sugarcane",
  "Sunflower", "Tea", "Tobacco", "Tomato", "Wheat",
]

// generates a simple forecast curve around the predicted price
function buildForecast(basePrice: number, predictedPrice: number, days: number) {
  const data = []
  for (let i = 0; i <= days; i++) {
    const t = i / days
    const price = basePrice + (predictedPrice - basePrice) * t
    const noise = (Math.random() - 0.5) * basePrice * 0.01
    data.push({
      day  : i === 0 ? "Today" : `Day ${i}`,
      price: Math.round((price + noise) * 100) / 100,
    })
  }
  return data
}

interface ForecastResult {
  predicted_price : number
  change_percent  : number
  recommendation  : "sell" | "wait"
  season          : string
  day7            : ReturnType<typeof buildForecast>
  day14           : ReturnType<typeof buildForecast>
  day30           : ReturnType<typeof buildForecast>
}

export function PricePredictor() {
  const [crop, setCrop]               = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [analyzing, setAnalyzing]     = useState(false)
  const [forecast, setForecast]       = useState<ForecastResult | null>(null)
  const [error, setError]             = useState("")

  const handlePredict = async () => {
    if (!crop || !currentPrice) return
    setAnalyzing(true)
    setForecast(null)
    setError("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/price/predict`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          crop,
          current_price      : parseFloat(currentPrice),
          // sensible Indian averages as defaults — user can extend later
          temperature        : 28.0,
          rainfall           : 100.0,
          supply_volume      : 2500.0,
          demand_volume      : 2000.0,
          transport_cost     : 250.0,
          fertilizer_usage   : 150.0,
          pest_infestation   : 0.2,
          market_competition : 0.5,
        }),
      })

      if (!res.ok) throw new Error("Prediction failed")

      const data = await res.json()
      const base = parseFloat(currentPrice)

      setForecast({
        predicted_price: data.predicted_price,
        change_percent : data.change_percent,
        recommendation : data.recommendation,
        season         : data.season,
        day7           : buildForecast(base, data.predicted_price, 7),
        day14          : buildForecast(base, data.predicted_price, 14),
        day30          : buildForecast(base, data.predicted_price, 30),
      })
    } catch {
      setError("Could not connect to backend. Make sure the server is running.")
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Crop Price Predictor
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get AI-powered price forecasts and market recommendations for your crops.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Input card ── */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Market Input</CardTitle>
            <CardDescription>Select a crop and enter the current market price</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">Crop Type</Label>
              <Select value={crop} onValueChange={setCrop}>
                <SelectTrigger className="text-foreground">
                  <SelectValue placeholder="Select a crop" />
                </SelectTrigger>
                <SelectContent>
                  {CROPS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Current Market Price (₹/Quintal)
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Predicting...</>
              ) : "Get Price Forecast"}
            </Button>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* ── Results ── */}
        <div className="flex flex-col gap-4 lg:col-span-2">

          {analyzing && (
            <Card>
              <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
              <CardContent><Skeleton className="h-64 w-full" /></CardContent>
            </Card>
          )}

          {forecast && !analyzing && (
            <>
              {/* recommendation banner */}
              <Card className={`border-2 ${
                forecast.recommendation === "sell"
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5"
              }`}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    forecast.recommendation === "sell" ? "bg-success/10" : "bg-destructive/10"
                  }`}>
                    {forecast.recommendation === "sell"
                      ? <TrendingUp className="h-6 w-6 text-success" />
                      : <TrendingDown className="h-6 w-6 text-destructive" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-foreground">Market Alert</p>
                      <Badge className={
                        forecast.recommendation === "sell"
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }>
                        {forecast.recommendation === "sell" ? "Sell Now" : "Wait"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Predicted price: <span className="font-semibold text-foreground">
                        ₹{forecast.predicted_price.toLocaleString()}
                      </span>
                      {" · "}
                      <span className={`font-semibold ${
                        forecast.change_percent >= 0 ? "text-success" : "text-destructive"
                      }`}>
                        {forecast.change_percent >= 0 ? "+" : ""}{forecast.change_percent}%
                      </span>
                      {" · "}{forecast.season} season
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* forecast chart */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-foreground">
                    Price Forecast — {crop}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="7" className="w-full">
                    <TabsList className="mb-4 w-full">
                      <TabsTrigger value="7"  className="flex-1">7 Days</TabsTrigger>
                      <TabsTrigger value="14" className="flex-1">14 Days</TabsTrigger>
                      <TabsTrigger value="30" className="flex-1">30 Days</TabsTrigger>
                    </TabsList>
                    {(["7", "14", "30"] as const).map((period) => {
                      const data = period === "7" ? forecast.day7
                                 : period === "14" ? forecast.day14
                                 : forecast.day30
                      return (
                        <TabsContent key={period} value={period}>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={data}>
                                <defs>
                                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false}
                                  tick={{ fill: "hsl(var(--muted-foreground))" }} />
                                <YAxis fontSize={11} tickLine={false} axisLine={false}
                                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                                  tickFormatter={(v) => `₹${v}`} />
                                <Tooltip
                                  contentStyle={{
                                    background: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px", fontSize: 12,
                                    color: "hsl(var(--foreground))",
                                  }}
                                  formatter={(v: number) => [`₹${v}`, "Price"]}
                                />
                                <Area type="monotone" dataKey="price"
                                  stroke="hsl(var(--chart-1))" fill="url(#priceGrad)"
                                  strokeWidth={2} dot={false}
                                  activeDot={{ r: 4, fill: "hsl(var(--chart-1))" }}
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
              <p className="mt-4 text-sm font-medium text-foreground">No forecast yet</p>
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
