"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Camera } from "lucide-react"
import QRCode from "qrcode.react"
import Link from "next/link"

export default function EventPage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : null
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<any[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (id) {
      fetchEvent()
      fetchPhotos()
    }
  }, [id])

  const fetchEvent = async () => {
    try {
      if (!id) throw new Error("ID do evento não fornecido")

      const { data, error } = await supabase.from("events").select("*").eq("id", id).single()

      if (error) {
        console.error("Erro ao buscar evento:", error)
        throw error
      }

      if (!data) {
        throw new Error("Evento não encontrado")
      }

      setEvent(data)
    } catch (error: any) {
      console.error("Erro completo:", error)
      toast({
        title: "Erro ao carregar evento",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPhotos = async () => {
    try {
      if (!id) return

      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("event_id", id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar fotos",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      setStream(mediaStream)
      setIsCameraOpen(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error: any) {
      toast({
        title: "Erro ao acessar a câmera",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCameraOpen(false)
  }

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) return

        try {
          // Generate a unique filename
          const filename = `${id}/${Date.now()}.jpg`

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage.from("event-photos").upload(filename, blob)

          if (error) throw error

          // Save photo reference in database
          const { error: dbError } = await supabase.from("photos").insert([
            {
              event_id: id,
              storage_path: filename,
              taken_by: "guest",
            },
          ])

          if (dbError) throw dbError

          toast({
            title: "Foto capturada com sucesso!",
            description: "Sua foto foi adicionada à galeria do evento.",
          })

          // Refresh photos
          fetchPhotos()
        } catch (error: any) {
          toast({
            title: "Erro ao salvar foto",
            description: error.message,
            variant: "destructive",
          })
        }
      },
      "image/jpeg",
      0.8,
    )
  }

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!event || !id) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Evento não encontrado</CardTitle>
            <CardDescription>O evento que você está procurando não existe ou foi removido.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Voltar para a página inicial</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const qrCodeUrl = typeof window !== "undefined" ? `${window.location.origin}/event/${id}` : ""

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col items-center justify-center text-center mb-8">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        {event.description && <p className="text-muted-foreground mt-2">{event.description}</p>}
      </header>

      {isCameraOpen ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-black">
            <video ref={videoRef} autoPlay playsInline className="w-full" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-4 mt-4">
            <Button onClick={takePhoto}>
              <Camera className="mr-2 h-4 w-4" />
              Tirar Foto
            </Button>
            <Button variant="outline" onClick={closeCamera}>
              Fechar Câmera
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Compartilhe este QR Code</CardTitle>
              <CardDescription>Escaneie o QR Code para acessar o evento e compartilhar fotos</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <QRCode
                  value={qrCodeUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{ src: "/logo.png", height: 40, width: 40, excavate: true }}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={openCamera}>
                <Camera className="mr-2 h-4 w-4" />
                Abrir Câmera
              </Button>
            </CardFooter>
          </Card>

          {photos.length > 0 && (
            <div className="mt-8 w-full">
              <h2 className="text-2xl font-bold mb-4">Galeria de Fotos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${photo.storage_path}`}
                      alt="Foto do evento"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

