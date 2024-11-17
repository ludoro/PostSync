'use client';

import { MainSidebar } from '@/components/MainSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

interface UserData {
  first_name: string;
  plan: string;
  plan_last_updated: string;
  scheduled_posts: number;
  // Add other user data fields as needed
}

export default function Page() {
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
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

  return (
    <SidebarProvider>
      <div className="grid h-screen grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <MainSidebar currentPath="/manage-plan"/>

        {/* Main Content */}
        <main className="p-6 overflow-auto">
          <h2 className="text-2xl font-semibold mb-6">Manage Your Plan</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <span>Loading...</span>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="divide-y divide-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span>Account Type</span>
                  <span className="font-semibold">{userData?.plan || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Plan last updated: </span>
                  <span className="font-semibold">
                    {userData?.plan_last_updated
                      ? new Date(userData.plan_last_updated).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Scheduled posts this month</span>
                  <span className="font-semibold ml-2">
                    {userData?.scheduled_posts ? `${userData.scheduled_posts} ` : '0 '}
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Possible Upgrades */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Upgrade 1 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Starter Plan (9$ / month)</h3>
            <p>Up to 30 scheduled posts per month</p>
            <button
              className={`mt-4 ${
                userData?.plan === 'Starter'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-700 text-white'
              } font-bold py-2 px-4 rounded`}
              disabled={userData?.plan === 'Starter'}
            >
              Upgrade to Starter
            </button>
          </div>
          {/* Upgrade 2 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Advanced Plan (29$ / month)</h3>
            <p>Up to 100 scheduled posts per month</p>
            <button
              className={`mt-4 ${
                userData?.plan === 'Advanced'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-700 text-white'
              } font-bold py-2 px-4 rounded`}
              disabled={userData?.plan === 'Advanced'}
            >
              Upgrade to Advanced
            </button>
          </div>
          {/* Upgrade 3 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Pro Plan (49$ / month)</h3>
            <p>Unlimited posts and AI help on posts</p>
            <button
              className={`mt-4 ${
                (userData?.plan === 'Pro' || true)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-700 text-white'
              } font-bold py-2 px-4 rounded`}
              disabled={(userData?.plan === 'Pro') || true}
            >
              Upgrade to Pro (coming soon)
            </button>
          </div>
        </div>

        </main>
      </div>
    </SidebarProvider>
  );
}
