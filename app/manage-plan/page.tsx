'use client';

import { MainSidebar } from '@/components/MainSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

interface UserData {
  first_name: string;
  plan: string;
  plan_last_updated: string;
  scheduled_posts: number;
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
        <MainSidebar currentPath="/manage-plan" />

        {/* Main Content */}
        <main className="p-6 overflow-auto bg-white">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Manage Your Plan</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <span className="text-lg font-medium text-gray-600">Loading...</span>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-lg p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Account Type</span>
                  <span className="font-semibold text-gray-800">{userData?.plan || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Plan Last Updated</span>
                  <span className="font-semibold text-gray-800">
                    {userData?.plan_last_updated
                      ? new Date(userData.plan_last_updated).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Scheduled Posts This Month</span>
                  <span className="font-semibold text-gray-800">
                    {userData?.scheduled_posts || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            {[
              {
                title: 'Starter Plan',
                price: '$9 / month',
                description: 'Up to 30 scheduled posts per month',
                active: userData?.plan === 'Starter',
                bgColor: 'bg-blue-500',
                hoverBg: 'hover:bg-blue-700',
              },
              {
                title: 'Advanced Plan',
                price: '$29 / month',
                description: 'Up to 100 scheduled posts per month',
                active: userData?.plan === 'Advanced',
                bgColor: 'bg-orange-500',
                hoverBg: 'hover:bg-orange-700',
              },
              {
                title: 'Pro Plan',
                price: '$49 / month',
                description: 'Unlimited posts and AI assistance',
                active: true, // Coming soon
                disabled: true,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg p-6 border border-gray-100"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{plan.title}</h3>
                <p className="text-gray-500 mb-4">{plan.description}</p>
                <button
                  className={`w-full py-2 px-4 rounded font-medium text-white ${
                    plan.active
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : `${plan.bgColor} ${plan.hoverBg}`
                  }`}
                  disabled={plan.active || plan.disabled}
                >
                  {plan.disabled ? 'Coming Soon' : `Upgrade to ${plan.title}`}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
