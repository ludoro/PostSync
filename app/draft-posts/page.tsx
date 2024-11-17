import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Page() {
    return (
        <SidebarProvider>
          <div className="grid h-screen grid-cols-[280px_1fr_300px]">
            {/* Sidebar */}
            <MainSidebar currentPath="/draft-posts" />
            
            {/* Main Content */}
            <main className="p-6 overflow-auto">
              <h2 className="text-xl font-bold mb-4">Draft posts</h2>
            </main>
          </div>
        </SidebarProvider>
      )
}