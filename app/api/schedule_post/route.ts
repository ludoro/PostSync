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
    const { existing_id, content, scheduledAt, status, files, fileTypes } = json
    console.log("Scheduling post?")

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

    const postId = 'postid_' + Math.random().toString(36).replace(/\./, '')
    const imageUrls: string[] = []
    const videoUrls: string[] = []

    if (files && Array.isArray(files) && files.length > 0) {
      console.log("Entering files check")
      for (let i = 0; i < files.length; i++) {
        console.log("Looping over files")
        const fileData = files[i]
        const fileType = fileTypes?.[i]
    
        console.log("fileData type:", typeof fileData)
        console.log("fileData:", fileData)
    
        if (!fileData) continue; // Skip undefined files
        console.log("File is defined")
    
        let file: File | Blob
        let fileName: string
        let fileExt: string = 'unknown'
    
        // Check if it's a base64 string
        if (typeof fileData === 'string' && fileData.startsWith('data:')) {
          console.log("Base64 string detected")
          const match = fileData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9]+);base64,/)
          if (match) {
            fileExt = match[1].split('/')[1]
            const base64Response = await fetch(fileData)
            file = await base64Response.blob()
          } else {
            console.log("Invalid base64 string")
            continue;
          }
        } else {
          console.log("Unexpected file data type")
          continue;
        }
    
        const filePath = `files/${postId}_${i}.${fileExt}`
    
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('schedule_stuff_bucket')
          .upload(filePath, file)
    
        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue; // Skip this file but continue with others
        }
    
        const { data: { publicUrl } } = supabase.storage
          .from('schedule_stuff_bucket')
          .getPublicUrl(filePath)
    
        if (fileType === 'image') {
          imageUrls.push(publicUrl)
        } else if (fileType === 'video') {
          videoUrls.push(publicUrl)
        }
      }
    }

    const actualPostId = existing_id ? existing_id : postId;

    // Determine the final status based on the input
    const finalStatus = status === 'published' && scheduledAt ? 'scheduled' : status;

    // Data to be inserted or updated
    const postData = {
      post_id: actualPostId,
      clerk_user_id: userId,
      content,
      scheduled_at: scheduledAt,
      status: finalStatus, // Use the determined status
      created_at: new Date().toISOString(),
      image_urls: imageUrls,
      video_urls: videoUrls,
    };
    
    // Insert or update the post in Supabase
    const { data, error } = await supabase
      .from('posts')
      .upsert([postData], { onConflict: 'post_id' })  // Define the conflict column for upsert
      .select();

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