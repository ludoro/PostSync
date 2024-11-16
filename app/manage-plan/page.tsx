import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Page() {
    return (
        <SidebarProvider>
          <div className="grid h-screen grid-cols-[280px_1fr_300px]">
            {/* Sidebar */}
            <MainSidebar currentPath="/manage-plan" />
            
            {/* Main Content */}
            <main className="p-6 overflow-auto">
              <h2 className="text-xl font-bold mb-4">Manage your plan</h2>
              <h2 className="text-xl font-bold mb-4 mt-8">Account Plan</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Account Type</span>
                  <span>Pro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Expiration Date</span>
                  <span>2023-12-31</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Connected Accounts</span>
                  <span>3</span>
                </div>
              </div>
            </main>
          </div>
        </SidebarProvider>
      )
}