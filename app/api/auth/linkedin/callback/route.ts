// app/api/auth/linkedin/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers'; // Import headers
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  try {
    // Check for required environment variables
      if (
          !process.env.LINKEDIN_CLIENT_ID ||
          !process.env.LINKEDIN_CLIENT_SECRET ||
          !process.env.NEXT_PUBLIC_BASE_URL
        ) {
          console.error(
            'Error: Missing environment variables LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET or NEXT_PUBLIC_BASE_URL'
          );
          return new NextResponse('Internal Server Error', { status: 500 });
        }

    // Verify state parameter
    const cookiesList = await headers();
    const savedStateCookie = cookiesList.get('cookie')?.split(';').find((cookiePart: string): boolean => cookiePart.trim().startsWith('linkedin_oauth_state='))
    const savedState = savedStateCookie ? savedStateCookie.split('=')[1] : null;
    if (!savedState || savedState !== state) {
      return NextResponse.redirect('/social-integrations?error=invalid_state');
    }

    // Get current user from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.redirect('/sign-in');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`,
      }),
    });

    if(!tokenResponse.ok) {
        console.error('Error fetching access token:', tokenResponse.statusText);
        return NextResponse.redirect('/social-integrations?status=error')
    }

    const tokenData = await tokenResponse.json();

    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

     if(!profileResponse.ok) {
        console.error('Error fetching profile data:', profileResponse.statusText);
        return NextResponse.redirect('/social-integrations?status=error')
     }

    const profileData = await profileResponse.json();

    // Get email
    const emailResponse = await fetch(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

     if(!emailResponse.ok) {
        console.error('Error fetching email data:', emailResponse.statusText);
        return NextResponse.redirect('/social-integrations?status=error')
     }

    const emailData = await emailResponse.json();
    const email = emailData.elements[0]['handle~'].emailAddress;

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Store in Supabase
    const { error } = await supabase.from('linkedin_connections').upsert({
      clerk_user_id: user.id,
      linkedin_id: profileData.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      email,
      name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
      profile_data: profileData,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
        console.error('Error storing data in Supabase:', error)
        return NextResponse.redirect('/social-integrations?status=error')
    }

    // Clean up state cookie by creating a new response
    const response = NextResponse.redirect('/social-integrations?status=success');
    response.headers.set(
      'Set-Cookie',
      `linkedin_oauth_state=; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; Path=/; Max-Age=0; SameSite=Lax`
    );

    return response;
  } catch (error) {
    console.error('LinkedIn OAuth Error:', error);
    return NextResponse.redirect('/social-integrations?status=error');
  }
}