"use client"

import React from "react"

import { useState, useCallback } from "react"
import {
  Upload,
  ImageIcon,
  X,
  AlertCircle,
  ShieldCheck,
  Pill,
  MessageCircle,
  Loader2,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

interface DiseaseResult {
  disease: string
  confidence: number
  symptoms: string[]
  treatment: string[]
  preventive: string[]
}

const mockResults: Record<string, DiseaseResult> = {
  default: {
    disease: "Early Blight (Alternaria solani)",
    confidence: 94.2,
    symptoms: [
      "Dark brown concentric rings on lower leaves",
      "Yellow halos around lesions",
      "Leaf drop starting from the bottom of the plant",
      "Small dark spots on stems",
    ],
    treatment: [
      "Apply chlorothalonil or mancozeb fungicide every 7-10 days",
      "Remove and destroy affected leaves immediately",
      "Apply copper-based fungicide as organic alternative",
    ],
    preventive: [
      "Practice 3-year crop rotation with non-solanaceous crops",
      "Ensure adequate spacing for air circulation",
      "Water at the base, avoid wetting foliage",
      "Apply mulch to prevent soil splash onto leaves",
    ],
  },
}

interface DiseaseDetectionProps {
  onChatAbout: (disease: string) => void
}

export function DiseaseDetection({ onChatAbout }: DiseaseDetectionProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<DiseaseResult | null>(null)

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile]
  )

  const handleAnalyze = () => {
    if (!file) return
    setAnalyzing(true)
    setResult(null)
    // Simulate AI analysis
    setTimeout(() => {
      setResult(mockResults.default)
      setAnalyzing(false)
    }, 3000)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Plant Disease Detection
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a leaf image to identify diseases using our AI-powered YOLO v9
          model.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Upload Leaf Image
            </CardTitle>
            <CardDescription>
              Drag and drop or click to upload a JPEG or PNG image
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <label
                htmlFor="leaf-upload"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">
                  Drop your leaf image here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse (JPEG, PNG)
                </p>
                <input
                  id="leaf-upload"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFile(e.target.files[0])
                  }}
                />
              </label>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview || ""}
                    alt="Uploaded leaf"
                    className="h-56 w-full object-cover"
                  />
                  <button
                    onClick={clearFile}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing with YOLO v9...
                    </>
                  ) : (
                    "Analyze Image"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex flex-col gap-4">
          {analyzing && (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-1 h-4 w-60" />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          )}

          {result && !analyzing && (
            <>
              {/* Disease Label & Confidence */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <CardTitle className="text-base text-foreground">
                        Disease Identified
                      </CardTitle>
                    </div>
                    <Badge className="bg-warning/10 text-warning-foreground border-warning/20">
                      {result.confidence}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-foreground">
                    {result.disease}
                  </p>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Confidence</span>
                      <span>{result.confidence}%</span>
                    </div>
                    <Progress value={result.confidence} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Symptoms */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-chart-3" />
                    <CardTitle className="text-base text-foreground">
                      Symptoms
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2">
                    {result.symptoms.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-3" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Treatment & Prevention */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base text-foreground">
                      Treatment & Prevention
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Treatment
                    </p>
                    <ul className="flex flex-col gap-2">
                      {result.treatment.map((t, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Preventive Measures
                    </p>
                    <ul className="flex flex-col gap-2">
                      {result.preventive.map((p, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Chat CTA */}
              <Button
                onClick={() => onChatAbout(result.disease)}
                variant="outline"
                className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" />
                Ask AI Chatbot about {result.disease.split("(")[0].trim()}
              </Button>
            </>
          )}

          {!result && !analyzing && (
            <Card className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                No results yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload and analyze a leaf image to see results here
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
