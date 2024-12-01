// app/api/user/route.ts
import { createClient } from '@supabase/supabase-js'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
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

    // Query Supabase for user data
    const { data, error } = await supabase
      .from('twitter_connections')
      .select('expires_at')  // Be explicit about what we're selecting
      .eq('clerk_user_id', userId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
        console.log('No user found with clerk_user_id:', userId);
        // Return a 204 No Content if no data is found
        return new NextResponse(null, { status: 204 });
    }

    // Log successful response
    console.log('Successfully retrieved user data:', data)
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('Unexpected error in /api/user:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}