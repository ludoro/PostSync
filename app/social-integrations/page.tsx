import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

export default function SocialIntegrationsPage() {
    return (
        <SidebarProvider>
          <div className="grid h-screen grid-cols-[280px_1fr_300px]">
            {/* Sidebar */}
            <MainSidebar currentPath="/social-integrations" />
            
            {/* Main Content */}
            <main className="p-6 overflow-auto">
              <h2 className="text-xl font-bold mb-4">Social Integrations</h2>
              <div className="space-y-4">
                <IntegrationItem platform="LinkedIn" action="Connect Account" />
                <IntegrationItem platform="Twitter" action="Coming Soon" />
                <IntegrationItem platform="YouTube" action="Coming Soon" />
                <IntegrationItem platform="TikTok" action="Coming Soon" />
              </div>
            </main>
          </div>
        </SidebarProvider>
      )
}

interface IntegrationItemProps {
  platform: string;
  action: string;
}

function IntegrationItem({ platform, action }: IntegrationItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg shadow-md bg-white">
      <span className="text-lg font-semibold">{platform}</span>
      {action === 'Connect Account' ? (
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-110">
          {action}
        </button>
      ) : (
        <span className="text-gray-600">{action}</span>
      )}
    </div>
  );
}