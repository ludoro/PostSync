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
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);


  const handleConnect = async () => {
    console.log("Handle connection")
    try {
      window.location.href = '/api/auth/linkedin';
    } catch (error) {
      console.error('Error initiating LinkedIn connection:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/is_linkedin_connected');
      
      if (response.status === 204) {
        // Handle the case where no data exists (204 No Content)
        console.log('No data found for the user');
        setUserData(null);
        return;
      }
  
      if (!response.ok) {
        // Handle other error statuses
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }
  
      // Parse the response if the status is OK (e.g., 200)
      const data = await response.json();
      // Assuming the response is an array of objects with 'expires_at' property
      const expiresAt = data[0]?.expires_at; // Adjusted to access the first element of the array
      setUserData({ expires_at: expiresAt });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUserData();
  }, []);

  const handleDisconnect = async () => {
    if (isDisconnecting) return;
    
    try {
      setIsDisconnecting(true);
      const response = await fetch('/api/auth/linkedin/disconnect', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }
      
      // Immediately set userData to null to show "Connect Account"
      setUserData(null);
      
    } catch (error) {
      console.error('Error disconnecting:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

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
            <div className="flex flex-col space-y-6">
              {/* Row: Expiration Date, Reconnect Button, and Disconnect Button */}
              <div className="flex items-center justify-between p-4 rounded-lg shadow-md bg-white space-x-6">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-full"></div>
                ) : isConnected ? (
                  <>
                    {/* Left: Expiration Date and Update Button */}
                    <div className="flex flex-col space-y-2">
                      <span className="text-lg font-semibold">LinkedIn</span>
                      <span className="text-lg text-gray-500">
                        Expires: {new Date(userData!.expires_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <button
                        className="bg-green-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-green-600 transition-colors duration-300"
                        onClick={handleConnect}
                      >
                        Update access
                      </button>
                    </div>

                    {/* Right: Disconnect Button */}
                    <button 
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors"
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                    >
                      {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </>
                ) : (
                  <LinkedInIntegration />
                )}
              </div>
            </div>

            {/* Other Integration Items */}
            <IntegrationItem platform="Twitter" action="Coming Soon" />
            <IntegrationItem platform="YouTube" action="Coming Soon" />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
