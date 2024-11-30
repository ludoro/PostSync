'use client'
import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Define the type for draft posts
interface ScheduledPost {
    id: string
    title: string
    content: string
    scheduledAt: string // Keep this as a string since it's JSON-parsed
    image_url?: string[]
    video_url?: string[]
}

export default function Page() {
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
    const router = useRouter()
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Utility to format date to user's timezone
    const formatDateToUserTimezone = (utcDate: string) => {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: userTimezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }).format(new Date(utcDate))
    }

    useEffect(() => {
        const fetchScheduledPosts = async () => {
            const response = await fetch('/api/scheduled_posts')
            const data: ScheduledPost[] = await response.json()
            setScheduledPosts(data)
        }

        fetchScheduledPosts()
    }, [])

    const handleEdit = (id: string) => {
        sessionStorage.setItem('edit-draft-origin', 'scheduled-posts')
        router.push(`/edit-draft/${id}`)
    }

    return (
        <SidebarProvider>
            <div className="grid h-screen grid-cols-[280px_1fr_300px]">
                {/* Sidebar */}
                <MainSidebar currentPath="/scheduled-posts" />

                {/* Main Content */}
                <main className="p-6 overflow-auto">
                    <h2 className="text-2xl font-bold mb-6">Scheduled Posts</h2>

                    {scheduledPosts.length === 0 ? (
                        <p className="text-gray-500">No Scheduled posts available.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scheduledPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-white p-4 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <p className="text-black font-bold mb-2">Scheduled Post</p>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {post.content.length > 100
                                            ? post.content.substring(0, 100) + '...'
                                            : post.content}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        <strong>Scheduled At:</strong> {formatDateToUserTimezone(post.scheduledAt)}
                                    </p>
                                    <button
                                        onClick={() => handleEdit(post.id)}
                                        className="mt-4 bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
                                    >
                                        Edit scheduled post
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </SidebarProvider>
    )
}
