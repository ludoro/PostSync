'use client'

import * as React from 'react'

import { SidebarProvider } from "@/components/ui/sidebar"
import { MainSidebar } from '@/components/MainSidebar'
import PostForm from '@/components/PostForm'
import PlanSelectionOverlay from '@/components/PlanSelectionOverlay'

export default function Dashboard() {
  const [date, setDate] = React.useState<Date>()
  const [time, setTime] = React.useState<string>('12:00')
  const [postContent, setPostContent] = React.useState('')
  const [hasIgnoreOverlay, setHasIgnoredOverlay] = React.useState(true)

  const refreshTwitterToken = React.useCallback(async () => {
    try {
      const response = await fetch('/api/auth/twitter/refresh', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refresh Twitter token');
      }

      const { access_token, expires_in } = await response.json();


      return access_token;
    } catch (error) {
      console.error('Twitter token refresh error:', error);

      // Optionally, you could trigger a re-authentication flow here
      return null;
    }
  }, []);

  React.useEffect(() => {
    // Refresh token when component mounts
    refreshTwitterToken();
  }, [refreshTwitterToken]);

  const handlePlanSelection = () => {
    // Handle the plan selection here
    // You might want to make an API call to your backend
    setHasIgnoredOverlay(true)
  }

  return (
    <SidebarProvider>
      {!hasIgnoreOverlay && <PlanSelectionOverlay onSelectPlan={handlePlanSelection} />}
      <div className="grid h-screen grid-cols-[280px_1fr_300px]">
        {/* Sidebar */}
        <MainSidebar currentPath="/dashboard"/>
        
        {/* Main Content */}
        <main className="p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
          <PostForm
            date={date}
            setDate={setDate}
            time={time}
            setTime={setTime}
            content={postContent}
            setContent={setPostContent}
          />
        </main>
      </div>
    </SidebarProvider>
  )
}