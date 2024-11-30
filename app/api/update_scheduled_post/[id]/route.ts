import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { content, post_id } = json

    if (!content?.trim()) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      )
    }

    const user = await currentUser()
    const userId = user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    
    const postData: Record<string, any> = {
        content, // New content to update
    };
    
    // Update the post in Supabase
    const { data, error } = await supabase
        .from('posts')
        .update(postData) // Specify the fields to update
        .eq('post_id', post_id) // Match rows where post_id equals the given value
        .select(); // Return the updated rows
    
    if (error) {
        console.error('Error updating post:', error);
        throw error;
    }

    return NextResponse.json(
        { message: 'Updated' },
        { status: 200 }
      );
  } catch (error) {
    console.error('Error in /api/update_scheduled_post:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}