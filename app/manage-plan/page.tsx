'use client'

import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"
import React from "react"
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
          <div className="grid h-screen grid-cols-[280px_1fr_300px]">
            {/* Sidebar */}
            <MainSidebar currentPath="/manage-plan" />
            
            {/* Main Content */}
            <main className="p-6 overflow-auto">
              <h2 className="text-xl font-bold mb-4">Manage your plan</h2>
              <h2 className="text-xl font-bold mb-4 mt-8">Account Plan</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-4">
                  <span>Account Type</span>
                  <span>{userData?.plan}</span>
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <span>Expiration Date</span>
                  <span>{userData?.plan_last_updated ? new Date(userData.plan_last_updated).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <span>Scheduled posts this month</span>
                  <span>{userData?.scheduled_posts}</span>
                </div>
              </div>
            </main>
          </div>
        </SidebarProvider>
      )
}