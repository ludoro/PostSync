'use client'
import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditDraftOverlay } from '@/components/EditDraftOverlay'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Define the type for draft posts
interface Post {
    id: string
    linkedin_content?: string
    twitter_content?: string
    post_to_linkedin: boolean
    post_to_twitter: boolean
    scheduledAt: string // Keep this as a string since it's JSON-parsed
    image_url?: string
    video_url?: string
}

export default function Page() {
    const [scheduledPosts, setScheduledPosts] = useState<Post[]>([])
    const [isEditOverlayOpen, setIsEditOverlayOpen] = useState(false)
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone


    const { toast } = useToast()


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

    // Fetch scheduled posts
    const fetchScheduledPosts = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/scheduled_posts')
            if (!response.ok) {
                throw new Error('Failed to fetch scheduled posts')
            }
            const data: Post[] = await response.json()
            setScheduledPosts(data)
        } catch (error) {
            console.error('Error fetching scheduled posts:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load scheduled post"
              })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchScheduledPosts()
    }, [])

    // Handle edit of a post
    const handleEdit = (post: Post) => {
        setSelectedPost(post)
        setIsEditOverlayOpen(true)
    }

    // Handle saving an edited post
    const handleSave = async (updatedPost: Post) => {
        try {
            const response = await fetch(`/api/update_scheduled_post/${updatedPost.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id: updatedPost.id, linkedin_content: updatedPost.linkedin_content, twitter_content: updatedPost.twitter_content,
                    scheduled_at: updatedPost.scheduledAt })
            })
    
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update post')
            }
    
            // Store toast message in localStorage
            localStorage.setItem('toastMessage', JSON.stringify({
                type: 'success',
                title: "✨ Success!",
                description: "Post has been updated successfully!"
            }))
    
            // Use window.location for a hard reload
            window.location.href = '/scheduled-posts'
    
        } catch (error) {
            console.error('Error saving post:', error)
            
            // Store error toast in localStorage
            localStorage.setItem('toastMessage', JSON.stringify({
                type: 'error',
                title: "Error",
                description: "Failed to save post"
            }))
    
            // Reload page to show error toast
            window.location.href = '/scheduled-posts'
        }
    }

    const handleDelete = async (updatedPost: Post) => {
        try {
            const response = await fetch(`/api/delete_scheduled_post/${updatedPost.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id: updatedPost.id})
            })
    
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete post')
            }
    
            // Store toast message in localStorage
            localStorage.setItem('toastMessage', JSON.stringify({
                type: 'success',
                title: "✨ Success!",
                description: "Post has been deleted successfully!"
            }))
    
            // Use window.location for a hard reload
            window.location.href = '/scheduled-posts'
    
        } catch (error) {
            console.error('Error deleting post:', error)
            
            // Store error toast in localStorage
            localStorage.setItem('toastMessage', JSON.stringify({
                type: 'error',
                title: "Error",
                description: "Failed to delete post"
            }))
    
            // Reload page to show error toast
            window.location.href = '/scheduled-posts'
        }
    }
    
    

    return (
        <SidebarProvider>
            <div className="grid h-screen grid-cols-[280px_1fr_300px]">
                {/* Sidebar */}
                <MainSidebar currentPath="/scheduled-posts" />

                {/* Main Content */}
                <main className="p-6 overflow-auto">
                    <h2 className="text-2xl font-bold mb-6">Scheduled Posts</h2>

                    {isLoading ? (
                        <div className="flex justify-center items-center">
                            <span>Loading scheduled posts...</span>
                        </div>
                    ) : scheduledPosts.length === 0 ? (
                        <p className="text-gray-500">No Scheduled posts available.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                           {scheduledPosts.map((post) => (
    <div
        key={post.id}
        className="bg-white p-4 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
            {post.image_url && (
                <div className="mt-4 aspect-w-16 aspect-h-9 rounded overflow-hidden">
                    <img
                        src={post.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Video Preview */}
            {post.video_url && (
                <div className="mt-4">
                    <video
                        src={post.video_url}
                        controls
                        className="w-full rounded"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}
                <p className="text-black font-bold mb-2">Content</p>

        {post.linkedin_content && <p className="text-gray-600 text-sm">
            {
                post.linkedin_content.substring(0, 100)}
        </p>}

        {post.twitter_content && <p className="text-gray-600 text-sm">
            {
                post.twitter_content.substring(0, 100)}
        </p>}

        {/* Scheduled Time */}
        <p className="text-sm text-gray-500 mt-2">
            <strong>Scheduled At:</strong> {formatDateToUserTimezone(post.scheduledAt)}
        </p>

        <p className="text-sm text-gray-500 mt-2">
            <strong>Scheduled for:</strong> {post.linkedin_content ? 'LinkedIn' : ''}{ post.twitter_content ? 'Twitter' : ''}
        </p>


        {/* Edit Button */}
        <div className="mt-4">
            <button
                onClick={() => handleEdit(post)}
                className="w-full bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
            >
                Edit scheduled post
            </button>
        </div>
        <div className="mt-4">
            <button
                onClick={() => handleDelete(post)}
                className="w-full bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700 transition"
            >
                Delete scheduled post (careful, cannot be undone)
            </button>
        </div>


    </div>
))}

                        </div>
                    )}
                </main>
            </div>
            {isEditOverlayOpen && selectedPost && (
                <EditDraftOverlay
                    post={selectedPost}
                    isOpen={isEditOverlayOpen}
                    onClose={() => setIsEditOverlayOpen(false)}
                    onSave={handleSave}
                />
            )}
        </SidebarProvider>
    )
}