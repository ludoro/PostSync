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
    const { content, scheduledAt, status, files, fileTypes } = json
    
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

    const postId = userId + Math.random().toString(36)
    const imageUrls: string[] = []
    const videoUrls: string[] = []

    // Upload files to Supabase Storage
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileType = fileTypes[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${postId}_${i}.${fileExt}`
        const filePath = `${userId}/${fileName}`
  
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('schedule_stuff_bucket')
          .upload(filePath, file)
  
        if (uploadError) throw uploadError
  
        const { data: { publicUrl } } = supabase.storage
          .from('schedule_stuff_bucket')
          .getPublicUrl(filePath)
  
        if (fileType === 'image') {
          imageUrls.push(publicUrl)
        } else {
          videoUrls.push(publicUrl)
        }
      }
    }

    // Insert into Supabase database
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          post_id: postId,
          clerk_user_id: userId,
          content,
          scheduled_at: scheduledAt,
          status: scheduledAt ? 'scheduled' : 'draft',
          created_at: new Date().toISOString(),
          image_urls: imageUrls,
          video_urls: videoUrls,
        }
      ])
      .select()

    if (error) {
      console.error('Error inserting post:', error)
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in /api/schedule_post:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update content-type configuration for the route
export const config = {
  api: {
    bodyParser: false,
  },
}