"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode } from "lucide-react"
import Link from "next/link"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useToast } from "@/components/ui/use-toast"

export default function EventAccessPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [eventId, setEventId] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!eventId.trim()) {
        throw new Error("Por favor, insira o código do evento")
      }

      // Verificar se o evento existe
      const { data, error } = await supabase.from("events").select("id").eq("id", eventId.trim()).single()

      if (error) {
        throw new Error("Evento não encontrado")
      }

      if (!data) {
        throw new Error("Evento não encontrado")
      }

      router.push(`/event/${eventId.trim()}`)
    } catch (error: any) {
      toast({
        title: "Erro ao acessar evento",
        description: error.message,
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acessar Evento</CardTitle>
          <CardDescription>Digite o código do evento ou escaneie o QR Code para acessar.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-id">Código do Evento</Label>
              <Input
                id="event-id"
                placeholder="Digite o código do evento"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ou escaneie o QR Code fornecido pelo anfitrião</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading || !eventId.trim()}>
              {loading ? "Verificando..." : "Acessar Evento"}
            </Button>
            <div className="text-center text-sm">
              <Link href="/" className="text-primary hover:underline">
                Voltar para a página inicial
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

