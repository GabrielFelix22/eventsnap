"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/providers/supabase-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Copy, Download, QrCode, Trash2 } from "lucide-react"
import Link from "next/link"
import JSZip from "jszip"
import { saveAs } from "file-saver"

export default function EventManagePage() {
  const { id } = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [event, setEvent] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])

  useEffect(() => {
    fetchEvent()
    fetchPhotos()
  }, [id])

  const fetchEvent = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase.from("events").select("*").eq("id", id).single()

      if (error) throw error

      // Check if the user is the owner of the event
      if (data.user_id !== user.id) {
        router.push("/dashboard")
        return
      }

      setEvent(data)
    } catch (error: any) {
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

  const deletePhoto = async (photoId: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage.from("event-photos").remove([storagePath])

      if (storageError) throw storageError

      // Delete from database
      const { error } = await supabase.from("photos").delete().eq("id", photoId)

      if (error) throw error

      // Update photos list
      setPhotos(photos.filter((photo) => photo.id !== photoId))

      toast({
        title: "Foto excluída com sucesso",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao excluir foto",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const deleteEvent = async () => {
    try {
      // Delete all photos from storage
      const storagePaths = photos.map((photo) => photo.storage_path)
      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage.from("event-photos").remove(storagePaths)

        if (storageError) throw storageError
      }

      // Delete all photos from database
      const { error: photosError } = await supabase.from("photos").delete().eq("event_id", id)

      if (photosError) throw photosError

      // Delete event
      const { error } = await supabase.from("events").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Evento excluído com sucesso",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Erro ao excluir evento",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const togglePhotoSelection = (photoId: string) => {
    if (selectedPhotos.includes(photoId)) {
      setSelectedPhotos(selectedPhotos.filter((id) => id !== photoId))
    } else {
      setSelectedPhotos([...selectedPhotos, photoId])
    }
  }

  const exportPhotos = async () => {
    setExportLoading(true)
    try {
      const zip = new JSZip()
      const photosToExport =
        selectedPhotos.length > 0 ? photos.filter((photo) => selectedPhotos.includes(photo.id)) : photos

      // Create a folder with the event name
      const folder = zip.folder(event.name.replace(/[^a-z0-9]/gi, "_").toLowerCase())

      if (!folder) throw new Error("Erro ao criar pasta para exportação")

      // Download each photo and add to zip
      for (let i = 0; i < photosToExport.length; i++) {
        const photo = photosToExport[i]
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${photo.storage_path}`

        const response = await fetch(url)
        const blob = await response.blob()

        // Extract filename from storage path
        const filename = photo.storage_path.split("/").pop()
        folder.file(filename, blob)
      }

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, `${event.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_fotos.zip`)

      toast({
        title: "Exportação concluída",
        description: `${photosToExport.length} fotos exportadas com sucesso.`,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao exportar fotos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Evento não encontrado</CardTitle>
            <CardDescription>O evento que você está procurando não existe ou foi removido.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard">Voltar para o dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground">{event.description || "Sem descrição"}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Código do evento:</span>
            <code className="rounded bg-muted px-2 py-1">{event.id}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(event.id)
                toast({
                  title: "Código copiado!",
                  description: "O código do evento foi copiado para a área de transferência.",
                })
              }}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copiar código do evento</span>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button asChild variant="outline">
            <Link href={`/event/${id}`}>
              <QrCode className="mr-2 h-4 w-4" />
              Ver QR Code
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Evento
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento e todas as fotos associadas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={deleteEvent} className="bg-destructive text-destructive-foreground">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Galeria de Fotos</CardTitle>
            <CardDescription>
              Gerencie as fotos do seu evento. Selecione fotos para exportar ou excluir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {photos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma foto foi adicionada a este evento ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {selectedPhotos.length > 0
                      ? `${selectedPhotos.length} fotos selecionadas de ${photos.length}`
                      : `${photos.length} fotos no total`}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedPhotos(
                          photos.length > 0 && selectedPhotos.length < photos.length ? photos.map((p) => p.id) : [],
                        )
                      }
                    >
                      {photos.length > 0 && selectedPhotos.length < photos.length
                        ? "Selecionar todas"
                        : "Desmarcar todas"}
                    </Button>
                    <Button size="sm" onClick={exportPhotos} disabled={exportLoading || photos.length === 0}>
                      <Download className="mr-2 h-4 w-4" />
                      {exportLoading
                        ? "Exportando..."
                        : selectedPhotos.length > 0
                          ? "Exportar selecionadas"
                          : "Exportar todas"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                        selectedPhotos.includes(photo.id) ? "border-primary" : "border-transparent"
                      }`}
                      onClick={() => togglePhotoSelection(photo.id)}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${photo.storage_path}`}
                        alt="Foto do evento"
                        className="w-full h-full object-cover cursor-pointer"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            deletePhoto(photo.id, photo.storage_path)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

