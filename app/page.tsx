import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Fixed width content inside full-width header */}
      <header className="w-full border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image src="/favicon.ico" alt="LinkedPulse Logo" width={30} height={30} />
              <span className="text-xl font-medium">LinkedPulse</span>
            </div>
            <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
              <Link href="/sign-in" className="text-white">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section - Centered content with max-width */}
      <main className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col space-y-8">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Scheduling posts should not be expensive and hard.{" "}
                <span className="italic text-blue-500">It should just work.</span>
              </h1>
              
              <p className="text-xl text-gray-600">
                Post and schedule all your content on all your social accounts. 
                A useful tool at an actual fair price, that lets you...
              </p>

              <div className="space-y-4">
                {[
                  "Post on LinkedIn and Twitter seamlessly",
                  "Schedule content for the perfect posting time",
                  "Customize captions for each platform",
                  "Save time!",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8">
                  Try it for free
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="overflow-hidden rounded-xl border bg-white shadow-lg">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  width={800}
                  height={600}
                  alt="Post Bridge Dashboard Preview"
                  className="aspect-video w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}