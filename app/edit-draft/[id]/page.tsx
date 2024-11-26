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
}

export default function EditDraft() {
    const [draft, setDraft] = useState<DraftPost | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const params = useParams() // Use useParams instead of props
    const existingPostId = typeof params?.id === 'string' ? params.id : '';
    console.log("AAAA")
    console.log(params.id)
    console.log(existingPostId)

    useEffect(() => {
        const fetchDraft = async () => {
            if (!params?.id) return
            try {
                const response = await fetch(`/api/draft_posts_id/${params.id}`)
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

    const handleSave = async (updatedData: Partial<DraftPost>) => {
        try {
            const response = await fetch(`/api/draft_posts/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            })
            if (!response.ok) throw new Error('Failed to update draft')

            router.push('/draft-posts') // Redirect to draft list after saving
        } catch (error) {
            console.error(error)
        }
    }

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
                        time={draft?.time || ''}
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
