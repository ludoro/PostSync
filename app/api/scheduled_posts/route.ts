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

    // Fetch scheduled posts for the current user
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true }) // Most recent drafts first

    if (error) {
      console.error('Error fetching draft posts:', error)
      return NextResponse.json(
        { message: 'Failed to fetch draft posts' },
        { status: 500 }
      )
    }

    // Transform the data to match the frontend expectations
    const transformedDrafts = data.map(scheduled => ({
      id: scheduled.post_id,
      linkedin_content: scheduled.linkedin_content,
      twitter_content: scheduled.twitter_content,
      created_at: scheduled.created_at,
      scheduledAt: scheduled.scheduled_at,
      image_url: scheduled.image_url,
      video_url: scheduled.video_url
    }))

    return NextResponse.json(transformedDrafts)
  } catch (error) {
    console.error('Error in /api/scheduled_posts:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}