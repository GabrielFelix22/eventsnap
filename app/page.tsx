import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Camera, Image, QrCode, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col items-center justify-center text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">EventSnap</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Capture e compartilhe momentos especiais em eventos com facilidade
        </p>
      </header>

      <Tabs defaultValue="host" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="host">Sou o Anfitrião</TabsTrigger>
          <TabsTrigger value="guest">Sou Convidado</TabsTrigger>
        </TabsList>
        <TabsContent value="host">
          <Card>
            <CardHeader>
              <CardTitle>Crie seu evento</CardTitle>
              <CardDescription>
                Como anfitrião, você pode criar um evento, gerar um QR code para seus convidados e gerenciar todas as
                fotos.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <QrCode className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="font-medium">QR Code Exclusivo</h3>
                  <p className="text-sm text-muted-foreground">Gere um QR code único para seu evento</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <Image className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="font-medium">Galeria Centralizada</h3>
                  <p className="text-sm text-muted-foreground">Acesse todas as fotos em um só lugar</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <Users className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="font-medium">Compartilhamento Fácil</h3>
                  <p className="text-sm text-muted-foreground">Exporte e compartilhe as melhores fotos</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/login">Começar como Anfitrião</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="guest">
          <Card>
            <CardHeader>
              <CardTitle>Participe de um evento</CardTitle>
              <CardDescription>
                Como convidado, você pode acessar o evento através do QR code e compartilhar suas fotos.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <QrCode className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="font-medium">Escaneie o QR Code</h3>
                  <p className="text-sm text-muted-foreground">Acesse o evento com o QR code fornecido</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <Camera className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="font-medium">Tire Fotos</h3>
                  <p className="text-sm text-muted-foreground">Capture momentos especiais diretamente no app</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <Image className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="font-medium">Veja a Galeria</h3>
                  <p className="text-sm text-muted-foreground">Visualize todas as fotos do evento</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/event">Acessar como Convidado</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="mt-20 text-center text-sm text-muted-foreground">
        <p>© 2023 EventSnap. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}

