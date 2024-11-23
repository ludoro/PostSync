import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function POST(request: Request) {
  try {
    const { content, scheduledAt } = await request.json()

    // Validate request
    if (!content?.trim()) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      )
    }

    const user = await currentUser()
    const userId = user?.id
    
    // Debug logs
    console.log('Processing request for userId:', userId)

    if (!userId) {
      console.log('No userId found - unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const uniqueStringId = Math.random().toString(36);

    // Insert into Supabase
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          post_id: uniqueStringId,
          clerk_user_id: userId,
          content,
          scheduled_at: scheduledAt,
          status: scheduledAt ? 'scheduled' : 'draft',
          created_at: new Date().toISOString(),
        }
      ])
      .select()

    if (error) {
      console.error('Error inserting post:', error)
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in /api/posts:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}