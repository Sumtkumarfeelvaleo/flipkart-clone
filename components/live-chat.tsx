"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Send, X, Bot, User, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: string
  text: string
  sender: "user" | "bot" | "agent"
  timestamp: Date
  type?: "text" | "quick-reply" | "product" | "order"
}

interface LiveChatProps {
  isOpen: boolean
  onToggle: () => void
}

export function LiveChat({ isOpen, onToggle }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your virtual assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isConnectedToAgent, setIsConnectedToAgent] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickReplies = ["Track my order", "Return policy", "Payment issues", "Product inquiry", "Speak to agent"]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (
    text: string,
    sender: "user" | "bot" | "agent",
    type: "text" | "quick-reply" | "product" | "order" = "text",
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      type,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return

    addMessage(message, "user")
    setInputMessage("")
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false)
      handleBotResponse(message)
    }, 1000)
  }

  const handleBotResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("track") || lowerMessage.includes("order")) {
      addMessage("I can help you track your order. Please provide your order ID or email address.", "bot")
    } else if (lowerMessage.includes("return") || lowerMessage.includes("refund")) {
      addMessage(
        "Our return policy allows returns within 30 days of purchase. Would you like me to initiate a return for you?",
        "bot",
      )
    } else if (lowerMessage.includes("payment") || lowerMessage.includes("pay")) {
      addMessage(
        "I can help with payment issues. Are you having trouble with a recent payment or need help with payment methods?",
        "bot",
      )
    } else if (lowerMessage.includes("agent") || lowerMessage.includes("human")) {
      connectToAgent()
    } else if (lowerMessage.includes("product") || lowerMessage.includes("item")) {
      addMessage("I can help you find products. What are you looking for today?", "bot")
    } else {
      addMessage("I understand you need help. Let me connect you with our support team for better assistance.", "bot")
      setTimeout(() => {
        connectToAgent()
      }, 2000)
    }
  }

  const connectToAgent = () => {
    setIsConnectedToAgent(true)
    addMessage("Connecting you to a live agent...", "bot")
    setTimeout(() => {
      addMessage("Hi! I'm Sarah from customer support. How can I assist you today?", "agent")
    }, 2000)
  }

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply)
  }

  if (!isOpen) {
    return (
      <Button onClick={onToggle} className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50" size="lg">
        <MessageCircle className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 shadow-xl z-50 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                {isConnectedToAgent ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">
                {isConnectedToAgent ? "Sarah - Support Agent" : "Virtual Assistant"}
              </CardTitle>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-2 text-sm ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : message.sender === "agent"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.text}
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-2 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {!isConnectedToAgent && (
          <div className="p-2 border-t">
            <div className="flex flex-wrap gap-1">
              {quickReplies.map((reply) => (
                <Button
                  key={reply}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={() => handleSendMessage()} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contact Options */}
        {isConnectedToAgent && (
          <div className="p-2 border-t bg-gray-50">
            <div className="flex justify-center gap-4">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
              <Button variant="ghost" size="sm">
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
