import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const user = await currentUser()
    const userId = user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch draft posts for the current user
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false }) // Most recent drafts first

    if (error) {
      console.error('Error fetching draft posts:', error)
      return NextResponse.json(
        { message: 'Failed to fetch draft posts' },
        { status: 500 }
      )
    }

    // Transform the data to match the frontend expectations
    const transformedDrafts = data.map(draft => ({
      id: draft.post_id,
      content: draft.content,
      created_at: draft.created_at,
      scheduledAt: draft.scheduled_at,
      files: [
        ...(draft.image_urls || []),
        ...(draft.video_urls || [])
      ],
      fileTypes: [
        ...Array(draft.image_urls?.length || 0).fill('image'),
        ...Array(draft.video_urls?.length || 0).fill('video')
      ]
    }))

    return NextResponse.json(transformedDrafts)
  } catch (error) {
    console.error('Error in /api/draft_posts:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}