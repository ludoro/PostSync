'use client'
import { MainSidebar } from '@/components/MainSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation' // Adjust import based on your routing library

// Define the type for draft posts
interface DraftPost {
    id: string
    title: string
    content: string
}

export default function Page() {
    const [draftPosts, setDraftPosts] = useState<DraftPost[]>([]) // Explicit type
    const router = useRouter()

    useEffect(() => {
        const fetchDraftPosts = async () => {
            const response = await fetch('/api/draft_posts')
            const data: DraftPost[] = await response.json() // Ensure correct type
            setDraftPosts(data)
        }

        fetchDraftPosts()
    }, [])

    const handleEdit = (id: string) => {
        sessionStorage.setItem('edit-draft-origin', 'draft-posts')
        router.push(`/edit-draft/${id}`)
    }

    return (
        <SidebarProvider>
            <div className="grid h-screen grid-cols-[280px_1fr_300px]">
                {/* Sidebar */}
                <MainSidebar currentPath="/draft-posts" />

                {/* Main Content */}
                <main className="p-6 overflow-auto">
                    <h2 className="text-2xl font-bold mb-6">Draft Posts</h2>

                    {draftPosts.length === 0 ? (
                        <p className="text-gray-500">No draft posts available.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {draftPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-white p-4 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <p className="text-black font-bold mb-2">Draft Post</p>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {post.content.length > 100
                                            ? post.content.substring(0, 100) + '...'
                                            : post.content}
                                    </p>
                                    <button
                                        onClick={() => handleEdit(post.id)}
                                        className="mt-4 bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
                                    >
                                        Edit Draft
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
