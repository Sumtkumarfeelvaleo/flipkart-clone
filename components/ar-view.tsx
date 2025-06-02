"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, RotateCcw, ZoomIn, ZoomOut, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface ARViewProps {
  isOpen: boolean
  onClose: () => void
  productImage: string
  productName: string
}

export function ARView({ isOpen, onClose, productImage, productName }: ARViewProps) {
  const [isARActive, setIsARActive] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && isARActive) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, isARActive])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Access Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        // Add product overlay
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const productWidth = canvas.width * 0.3 * scale
          const productHeight = (img.height / img.width) * productWidth
          const x = (canvas.width - productWidth) / 2
          const y = (canvas.height - productHeight) / 2

          ctx.save()
          ctx.translate(x + productWidth / 2, y + productHeight / 2)
          ctx.rotate((rotation * Math.PI) / 180)
          ctx.drawImage(img, -productWidth / 2, -productHeight / 2, productWidth, productHeight)
          ctx.restore()

          // Download the image
          const link = document.createElement("a")
          link.download = `ar-${productName}.png`
          link.href = canvas.toDataURL()
          link.click()
        }
        img.src = productImage
      }
    }
  }

  const resetTransform = () => {
    setScale(1)
    setRotation(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>AR View - {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isARActive ? (
            <Card>
              <CardHeader>
                <CardTitle>Augmented Reality View</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                  <Camera className="w-16 h-16 text-white" />
                </div>
                <p className="text-gray-600">Experience {productName} in your space using augmented reality</p>
                <Button onClick={() => setIsARActive(true)} size="lg">
                  <Camera className="w-5 h-5 mr-2" />
                  Start AR Experience
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-96 object-cover" />

                {/* Product Overlay */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                  }}
                >
                  <img
                    src={productImage || "/placeholder.svg"}
                    alt={productName}
                    className="w-32 h-32 object-contain opacity-80"
                  />
                </div>

                {/* AR Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setScale(Math.min(2, scale + 0.1))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setRotation((rotation + 45) % 360)}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={resetTransform}>
                    Reset
                  </Button>
                  <Button variant="secondary" size="sm" onClick={capturePhoto}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Close Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={() => setIsARActive(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Instructions */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">AR Instructions:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Point your camera at a flat surface</li>
                  <li>• Use zoom controls to resize the product</li>
                  <li>• Rotate the product to see different angles</li>
                  <li>• Capture a photo to save your AR experience</li>
                </ul>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
