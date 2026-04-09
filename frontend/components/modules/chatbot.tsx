"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  "How do I prevent early blight in tomatoes?",
  "What is the ideal pH for rice cultivation?",
  "When is the best time to sell wheat?",
  "How to improve soil nitrogen levels?",
]

interface ChatbotProps {
  initialMessage?: string
}

export function Chatbot({ initialMessage }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your agricultural AI assistant powered by Gemini. I can help with plant diseases, soil management, crop practices, and market insights. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState(initialMessage || "")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialSent = useRef(false)

  useEffect(() => {
    if (initialMessage && !initialSent.current) {
      initialSent.current = true
      handleSend(initialMessage)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async (text?: string) => {
    const message = text || input.trim()
    if (!message) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("http://localhost:8000/api/chat/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) throw new Error("Chat failed")

      const data = await res.json()

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I couldn't connect to the backend. Please make sure the server is running.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          AI Agricultural Assistant
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask anything about farming, diseases, soil, crops, or market trends.
        </p>
      </div>

      <Card className="flex h-[calc(100vh-220px)] min-h-[500px] flex-col">
        <CardHeader className="shrink-0 border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm text-foreground">AgriBot</CardTitle>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback
                      className={`text-xs ${
                        msg.role === "assistant"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent/20 text-accent-foreground"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Bot className="h-4 w-4" />

                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {(msg.content || "").split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>
                          }
                          return part
                        })}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1.5 rounded-2xl bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggested questions — only show at start */}
          {messages.length <= 1 && (
            <div className="shrink-0 border-t border-border px-4 py-3 lg:px-6">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Suggested questions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-border p-4 lg:px-6">
            <div className="mx-auto flex max-w-2xl items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="flex-1 rounded-full border-border bg-muted text-foreground placeholder:text-muted-foreground"
                disabled={isTyping}
              />
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}