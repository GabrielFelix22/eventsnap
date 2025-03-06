"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/providers/supabase-provider"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

interface Event {
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function DashboardPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      fetchEvents(user.id)
    }

    checkUser()
  }, [supabase, router])

  const fetchEvents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meus Eventos</h1>
          <p className="text-muted-foreground">Gerencie seus eventos e galerias de fotos</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button asChild variant="outline">
            <Link href="/dashboard/new-event">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Evento
            </Link>
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Nenhum evento encontrado</CardTitle>
              <CardDescription>Você ainda não criou nenhum evento. Comece criando seu primeiro evento!</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/dashboard/new-event">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Evento
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
                <CardDescription>{event.description || "Sem descrição"}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Criado em: {new Date(event.created_at).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline">
                  <Link href={`/event/${event.id}`}>Ver QR Code</Link>
                </Button>
                <Button asChild>
                  <Link href={`/dashboard/event/${event.id}`}>Gerenciar</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

