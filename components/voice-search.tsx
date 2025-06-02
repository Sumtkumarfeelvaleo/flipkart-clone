"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface VoiceSearchProps {
  onSearch: (query: string) => void
  isOpen: boolean
  onClose: () => void
}

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export function VoiceSearch({ onSearch, isOpen, onClose }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = false
      recognitionInstance.interimResults = true
      recognitionInstance.lang = "en-US"

      recognitionInstance.onstart = () => {
        setIsListening(true)
      }

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex
        const transcript = event.results[current][0].transcript
        setTranscript(transcript)

        if (event.results[current].isFinal) {
          onSearch(transcript)
          onClose()
          setTranscript("")
        }
      }

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        toast({
          title: "Voice Search Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        })
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [onSearch, onClose, toast])

  const startListening = () => {
    if (recognition) {
      recognition.start()
    } else {
      toast({
        title: "Voice Search Not Supported",
        description: "Your browser doesn't support voice search.",
        variant: "destructive",
      })
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
    }
    setIsListening(false)
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-80">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
                isListening ? "bg-red-100 animate-pulse" : "bg-blue-100"
              }`}
            >
              {isListening ? <Mic className="w-8 h-8 text-red-600" /> : <MicOff className="w-8 h-8 text-gray-600" />}
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">{isListening ? "Listening..." : "Voice Search"}</h3>

          {transcript && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm">{transcript}</p>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            {isListening ? "Speak now to search for products" : "Click the microphone to start voice search"}
          </p>

          <div className="flex gap-2 justify-center">
            {!isListening ? (
              <Button onClick={startListening} className="flex-1">
                <Mic className="w-4 h-4 mr-2" />
                Start Listening
              </Button>
            ) : (
              <Button onClick={stopListening} variant="destructive" className="flex-1">
                <MicOff className="w-4 h-4 mr-2" />
                Stop Listening
              </Button>
            )}

            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakText("Welcome to Flipkart. You can search for any product using voice commands.")}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Test Voice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
