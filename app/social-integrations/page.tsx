'use client'
import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"
import LinkedInIntegration from '@/components/linkedin-integration';
import TwitterIntegration from '@/components/twitter-integration';
import { useSearchParams } from 'next/navigation';
import React from 'react';

interface UserData {
  expires_at: string | null;
}

export default function SocialIntegrationsPage() {
  const [linkedInData, setLinkedInData] = React.useState<UserData | null>(null);
  const [twitterData, setTwitterData] = React.useState<UserData | null>(null);
  const [isLinkedInLoading, setIsLinkedInLoading] = React.useState(true);
  const [isTwitterLoading, setIsTwitterLoading] = React.useState(true);
  const [isLinkedInDisconnecting, setIsLinkedInDisconnecting] = React.useState(false);
  const [isTwitterDisconnecting, setIsTwitterDisconnecting] = React.useState(false);

  const handleLinkedInConnect = async () => {
    try {
      window.location.href = '/api/auth/linkedin';
    } catch (error) {
      console.error('Error initiating LinkedIn connection:', error);
    }
  };

  const handleTwitterConnect = async () => {
    try {
      window.location.href = '/api/auth/twitter';
    } catch (error) {
      console.error('Error initiating Twitter connection:', error);
    }
  };

  const fetchLinkedInUserData = async () => {
    try {
      const response = await fetch('/api/is_linkedin_connected');
      
      if (response.status === 204) {
        console.log('No LinkedIn data found for the user');
        setLinkedInData(null);
        return;
      }
  
      if (!response.ok) {
        throw new Error(`Failed to fetch LinkedIn user data: ${response.statusText}`);
      }
  
      const data = await response.json();
      const expiresAt = data[0]?.expires_at;
      setLinkedInData({ expires_at: expiresAt });
    } catch (error) {
      console.error('Error fetching LinkedIn user data:', error);
      setLinkedInData(null);
    } finally {
      setIsLinkedInLoading(false);
    }
  };

  const fetchTwitterUserData = async () => {
    try {
      const response = await fetch('/api/is_twitter_connected');
      
      if (response.status === 204) {
        console.log('No Twitter data found for the user');
        setTwitterData(null);
        return;
      }
  
      if (!response.ok) {
        throw new Error(`Failed to fetch Twitter user data: ${response.statusText}`);
      }
  
      const data = await response.json();
      const expiresAt = data[0]?.expires_at;
      setTwitterData({ expires_at: expiresAt });
    } catch (error) {
      console.error('Error fetching Twitter user data:', error);
      setTwitterData(null);
    } finally {
      setIsTwitterLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLinkedInUserData();
    fetchTwitterUserData();
  }, []);

  const handleLinkedInDisconnect = async () => {
    if (isLinkedInDisconnecting) return;
    
    try {
      setIsLinkedInDisconnecting(true);
      const response = await fetch('/api/auth/linkedin/disconnect', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect LinkedIn');
      }
      
      setLinkedInData(null);
      
    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error);
    } finally {
      setIsLinkedInDisconnecting(false);
    }
  };

  const handleTwitterDisconnect = async () => {
    if (isTwitterDisconnecting) return;
    
    try {
      setIsTwitterDisconnecting(true);
      const response = await fetch('/api/auth/twitter/disconnect', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect Twitter');
      }
      
      setTwitterData(null);
      
    } catch (error) {
      console.error('Error disconnecting Twitter:', error);
    } finally {
      setIsTwitterDisconnecting(false);
    }
  };

  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const isLinkedInConnected = React.useMemo(() => {
    if (!linkedInData?.expires_at) return false;
    
    const expiryDate = new Date(linkedInData.expires_at);
    const currentDate = new Date();
    
    return expiryDate > currentDate;
  }, [linkedInData?.expires_at]);

  const isTwitterConnected = React.useMemo(() => {
    if (!twitterData?.expires_at) return false;
    
    const expiryDate = new Date(twitterData.expires_at);
    const currentDate = new Date();
    
    return expiryDate > currentDate;
  }, [twitterData?.expires_at]);

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
                {isLinkedInLoading ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-full"></div>
                ) : isLinkedInConnected ? (
                  <>
                    {/* Left: Expiration Date and Update Button */}
                    <div className="flex flex-col space-y-2">
                      <span className="text-lg font-semibold">LinkedIn</span>
                      <span className="text-lg text-gray-500">
                        Expires: {new Date(linkedInData!.expires_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <button
                        className="bg-green-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-green-600 transition-colors duration-300"
                        onClick={handleLinkedInConnect}
                      >
                        Update access
                      </button>
                    </div>

                    {/* Right: Disconnect Button */}
                    <button 
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors"
                      onClick={handleLinkedInDisconnect}
                      disabled={isLinkedInDisconnecting}
                    >
                      {isLinkedInDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </>
                ) : (
                  <LinkedInIntegration />
                )}
              </div>
            </div>

            {/* Twitter Integration */}
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg shadow-md bg-white space-x-6">
                {isTwitterLoading ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-full"></div>
                ) : isTwitterConnected ? (
                  <>
                    {/* Left: Expiration Date and Update Button */}
                    <div className="flex flex-col space-y-2">
                      <span className="text-lg font-semibold">Twitter</span>
                      <span className="text-lg text-gray-500">
                        Expires: {new Date(twitterData!.expires_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <button
                        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-300"
                        onClick={handleTwitterConnect}
                      >
                        Update access
                      </button>
                    </div>

                    {/* Right: Disconnect Button */}
                    <button 
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors"
                      onClick={handleTwitterDisconnect}
                      disabled={isTwitterDisconnecting}
                    >
                      {isTwitterDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </>
                ) : (
                  <TwitterIntegration onConnect={handleTwitterConnect} />
                )}
              </div>
            </div>

            {/* YouTube Integration */}
            <IntegrationItem platform="YouTube" action="Coming Soon" />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}