import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { link } from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const {post_id, scheduled_at, linkedin_content, twitter_content } = json
    console.log(post_id)


    if ((!linkedin_content?.trim() && twitter_content?.trim())) {
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


    if (!twitter_content && !linkedin_content) {
      // Delete row that equals to post id from supabase
      const { data: deleteData, error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('post_id', post_id)
      if (deleteError) {
        console.error('Error deleting post:', deleteError);
        throw deleteError;
      }
    }

    
    const postData: Record<string, any> = {
        scheduled_at,
        twitter_content: twitter_content ? twitter_content : null,
        linkedin_content: linkedin_content ? linkedin_content : null,
    };
    if (twitter_content) {
      postData.twitter_content = twitter_content
    }
    if (linkedin_content) {
      postData.linkedin_content = linkedin_content
    }
    
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

    console.log(data)

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