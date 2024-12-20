import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()
    const userId = user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Fetch the specific draft post
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('post_id', id)
      .eq('status', 'scheduled')
      .single()

    if (error) {
      console.error(`Error fetching scheduled post with ID ${id}:`, error)
      return NextResponse.json(
        { message: 'Failed to fetch the draft post' },
        { status: 404 }
      )
    }

    // Transform the data to match frontend expectations
    const transformedDraft = {
      id: data.post_id,
      title: data.title,
      linkedin_content: data.linkedin_content,
      twitter_content: data.twitter_content,
      created_at: data.created_at,
      scheduledAt: data.scheduled_at,
      image_url: data.image_url,
      video_url: data.video_url,
    }

    return NextResponse.json(transformedDraft)
  } catch (error) {
    console.error('Error in GET /api/draft_posts_id/[id]:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()
    const userId = user?.id
    console.log("Sono qui?")

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()

    // Update the specific draft post
    const { data, error } = await supabase
      .from('posts')
      .update({
        title: body.title,
        linkedin_content: body.linkedin_content,
        twitter_content: body.twitter_content,
        scheduled_at: body.scheduledAt,
        image_url: body.files?.filter((_: string, i: number) => body.fileTypes[i] === 'image'),
        video_url: body.files?.filter((_: string, i: number) => body.fileTypes[i] === 'video')
      })
      .eq('clerk_user_id', userId)
      .eq('post_id', id)
      .eq('status', 'draft')
    console.log("FINISHED UPDATING")
    if (error) {
      console.error(`Error updating draft post with ID ${id}:`, error)
      return NextResponse.json(
        { message: 'Failed to update the draft post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Draft post updated successfully', data })
  } catch (error) {
    console.error('Error in PUT /api/draft_posts/[id]:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
