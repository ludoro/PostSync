import { UserProfile } from '@clerk/nextjs'
import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"


export default function Page() {
    return (
        <SidebarProvider>
          <div className="grid h-screen grid-cols-[280px_1fr_300px]">
            {/* Sidebar */}
            <MainSidebar currentPath="" />
            
            {/* Main Content */}
            <main className="p-6 overflow-auto">
              <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
              <UserProfile/>
            </main>
          </div>
        </SidebarProvider>
      )
}