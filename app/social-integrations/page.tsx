'use client'
import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"
import LinkedInIntegration from '@/components/linkedin-integration';
import { useSearchParams } from 'next/navigation';
import React from 'react';

interface UserData {
  expires_at: string | null;
}

export default function SocialIntegrationsPage() {
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/is_linkedin_connected');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const isConnected = React.useMemo(() => {
    if (!userData?.expires_at) return false;
    
    const expiryDate = new Date(userData.expires_at);
    const currentDate = new Date();
    
    return expiryDate > currentDate;
  }, [userData?.expires_at]);

  const IntegrationItem = ({ platform, action }: { platform: string; action: string }) => (
    <div className="flex items-center justify-between p-4 rounded-lg shadow-md bg-white">
      <span className="text-lg font-semibold">{platform}</span>
      <button className="bg-gray-200 text-gray-600 font-semibold py-2 px-4 rounded-full ml-4" disabled>
        {action}
      </button>
    </div>
  );

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
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-full"></div>
              ) : isConnected ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Expires: {new Date(userData!.expires_at!).toLocaleDateString()}
                  </span>
                  <button className="bg-green-500 text-white font-semibold py-2 px-4 rounded-full" disabled>
                    Connected
                  </button>
                </div>
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
  );
}