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
    const { content, scheduledAt, files, fileTypes, user_time_zone } = json

    if (!content?.trim() && !files) {
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
    let imageUrl: string = "";
    let videoUrl: string = "";

    if (files && Array.isArray(files) && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i]
        const fileType = fileTypes?.[i]
    
        if (!fileData) continue;
    
        let file: File | Blob
        let fileExt: string = 'unknown'
    
        // Improved base64 handling
        if (typeof fileData === 'string' && fileData.startsWith('data:')) {
          try {
            // Split the base64 string into parts
            const base64Parts = fileData.split(',');
            if (base64Parts.length < 2) {
              console.log("Invalid base64 string format");
              continue;
            }
    
            // Extract MIME type and extension
            const mimeType = base64Parts[0].split(':')[1].split(';')[0];
            fileExt = mimeType.split('/')[1] || 'unknown';
    
            // Convert base64 to Blob directly
            const byteCharacters = atob(base64Parts[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let j = 0; j < byteCharacters.length; j++) {
              byteNumbers[j] = byteCharacters.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            file = new Blob([byteArray], { type: mimeType });
          } catch (conversionError) {
            console.error('Error converting base64 to blob:', conversionError);
            continue;
          }
        } else {
          console.log("Unexpected file data type");
          continue;
        }
    
        const filePath = `files/${postId}_${i}.${fileExt}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('schedule_stuff_bucket')
            .upload(filePath, file)
          console.log("QUI")
          if (uploadError) {
            console.log("QUA")
            console.error('Upload error:', uploadError)
            continue; // Skip this file but continue with others
          }
          const { data: { publicUrl } } = supabase.storage
          .from('schedule_stuff_bucket')
          .getPublicUrl(filePath)
    
          if (fileType === 'image') {
            imageUrl = publicUrl
          } else if (fileType === 'video') {
            videoUrl = publicUrl
          }
      }
    }

    
    const postData: Record<string, any> = {
      post_id: postId,
      clerk_user_id: userId,
      content,
      scheduled_at: scheduledAt,
      status: 'scheduled',
      image_url: imageUrl,
      video_url: videoUrl,
      created_at: new Date().toISOString(),
      time_zone: user_time_zone,
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