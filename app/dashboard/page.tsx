'use client'

import * as React from 'react'

import { SidebarProvider } from "@/components/ui/sidebar"
import { MainSidebar } from '@/components/MainSidebar'
import PostForm from '@/components/PostForm'
import PostReview from '@/components/PostReview'
import PlanSelectionOverlay from '@/components/PlanSelectionOverlay'




export default function Dashboard() {
  const [date, setDate] = React.useState<Date>()
  const [time, setTime] = React.useState<string>('12:00')
  const [postContent, setPostContent] = React.useState('')
  const [hasPlan, setHasPlan] = React.useState(true)
  const handlePlanSelection = () => {
    // Handle the plan selection here
    // You might want to make an API call to your backend
    setHasPlan(true)
  }

  return (
    <SidebarProvider>
      {!hasPlan && <PlanSelectionOverlay onSelectPlan={handlePlanSelection} />}
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

        {/* Preview */}
        <PostReview
          date={date}
          time={time}
          content={postContent}
        />
      </div>
    </SidebarProvider>
  )
}