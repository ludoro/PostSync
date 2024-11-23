'use client'
import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"
import LinkedInIntegration from '@/components/linkedin-integration';
import { useSearchParams } from 'next/navigation';

export default function SocialIntegrationsPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  return (
    <SidebarProvider>
      <div className="grid h-screen grid-cols-[280px_1fr_300px]">
        {/* Sidebar */}
        <MainSidebar currentPath="/social-integrations" />
        
        {/* Main Content */}
        <main className="p-6 overflow-auto">
          <h2 className="text-xl font-bold mb-4">Social Integrations</h2>
          <div className="space-y-4">
            {/* LinkedIn Integration */}
            <div className="flex items-center justify-between p-4 rounded-lg shadow-md bg-white">
              <span className="text-lg font-semibold">LinkedIn</span>
              {status === 'success' ? (
                <button className="bg-green-500 text-white font-semibold py-2 px-4 rounded-full ml-4" disabled>
                  Connected
                </button>
              ) : (
                <LinkedInIntegration />
              )}
            </div>

            {/* Other Integration Items */}
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
      <button className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-full ml-4" disabled>
        {action}
      </button>
    </div>
  );
}