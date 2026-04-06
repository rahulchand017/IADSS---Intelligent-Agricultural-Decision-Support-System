"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Dashboard } from "@/components/modules/dashboard"
import { DiseaseDetection } from "@/components/modules/disease-detection"
import { SoilAnalysis } from "@/components/modules/soil-analysis"
import { PricePredictor } from "@/components/modules/price-predictor"
import { Chatbot } from "@/components/modules/chatbot"

export default function Page() {
  const [activeModule, setActiveModule] = useState("dashboard")
  const [chatInitialMessage, setChatInitialMessage] = useState<string>("")

  const handleChatAbout = (disease: string) => {
    setChatInitialMessage(
      `Tell me more about ${disease} and how to manage it.`
    )
    setActiveModule("chat")
  }

  return (
    <AppShell activeModule={activeModule} onModuleChange={setActiveModule}>
      {activeModule === "dashboard" && (
        <Dashboard onModuleChange={setActiveModule} />
      )}
      {activeModule === "disease" && (
        <DiseaseDetection onChatAbout={handleChatAbout} />
      )}
      {activeModule === "soil" && <SoilAnalysis />}
      {activeModule === "price" && <PricePredictor />}
      {activeModule === "chat" && (
        <Chatbot
          key={chatInitialMessage}
          initialMessage={chatInitialMessage}
        />
      )}
    </AppShell>
  )
}
