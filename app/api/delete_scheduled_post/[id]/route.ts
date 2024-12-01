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
    const {post_id } = json
    console.log(post_id)

    const user = await currentUser()
    const userId = user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }


    if (post_id) {
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
    return NextResponse.json(
        { message: 'Deleted scheduled posts' },
        { status: 200 }
      );
  } catch (error) {
    console.error('Error in /api/delete_scheduled_post:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}