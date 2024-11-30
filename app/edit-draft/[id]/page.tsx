'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PostForm from '@/components/PostForm'
import { SidebarProvider } from "@/components/ui/sidebar"
import { MainSidebar } from '@/components/MainSidebar'

// Define the type for the draft post
interface DraftPost {
    id: string
    title: string
    content: string
    date?: string | null
    time?: string | null
    image_urls?: string[] | null
    video_urls?: string[] | null
}

export default function EditDraft() {
    const [draft, setDraft] = useState<DraftPost | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const params = useParams() // Use useParams instead of props
    const existingPostId = typeof params?.id === 'string' ? params.id : '';

    useEffect(() => {
        const fetchDraft = async () => {
            const origin = sessionStorage.getItem('edit-draft-origin')
            const apiEndpoint = origin === 'scheduled-posts' 
            ? `/api/scheduled_posts_id/${params.id}` 
            : `/api/draft_posts_id/${params.id}`;

            if (!params?.id) return
            try {
                const response = await fetch(apiEndpoint)
                if (!response.ok) throw new Error('Failed to fetch draft')
                const data: DraftPost = await response.json()
                setDraft(data)
            } catch (error) {
                console.error(error)
                router.push('/draft-posts') // Redirect on error
            } finally {
                setLoading(false)
            }
        }

        fetchDraft()
    }, [params?.id, router])

    if (loading) {
        return <p>Loading...</p>
    }

    if (!draft) {
        return <p>Draft not found</p>
    }

    return (
        <SidebarProvider>
            <div className="grid h-screen grid-cols-[280px_1fr_300px]">
                {/* Sidebar */}
                <MainSidebar currentPath="/edit-draft" />

                {/* Main Content */}
                <main className="p-6 overflow-auto">
                    <h2 className="text-2xl font-bold mb-6">Edit Draft</h2>
                    <PostForm
                        existingPostId={existingPostId || ''}
                        content={draft?.content || ''}
                        setContent={(content) =>
                            setDraft((prev) =>
                                prev ? { ...prev, content } : null
                            )
                        }
                        date={draft?.date ? new Date(draft.date) : undefined}
                        setDate={(date) =>
                            setDraft((prev) =>
                                prev ? { ...prev, date: date?.toISOString() || null } : null
                            )
                        }
                        time={draft?.time || '12:00'}
                        setTime={(time) =>
                            setDraft((prev) =>
                                prev ? { ...prev, time } : null
                            )
                        }
                    />
                </main>
            </div>
        </SidebarProvider>
    )
}
