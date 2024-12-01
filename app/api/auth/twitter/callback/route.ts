// api/auth/twitter/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    if (
      !process.env.TWITTER_CLIENT_ID ||
      !process.env.TWITTER_CLIENT_SECRET ||
      !baseUrl
    ) {
      console.error('Missing required environment variables.');
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Retrieve state and code verifier from cookies
    const cookieStore = await cookies();
    const savedState = cookieStore.get('twitter_oauth_state')?.value;
    const codeVerifier = cookieStore.get('twitter_code_verifier')?.value;

    // Validate state
    if (!savedState || savedState !== state) {
      return NextResponse.redirect(`${baseUrl}/social-integrations?error=invalid_state`);
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.redirect(`${baseUrl}/sign-in`);
    }

    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          client_id: process.env.TWITTER_CLIENT_ID,
          redirect_uri: `${baseUrl}/api/auth/twitter/callback`,
          code_verifier: codeVerifier || '', // Ensure code_verifier is provided
        }),
      });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Error fetching access token:', tokenResponse.statusText, errorText);
      return NextResponse.redirect(`${baseUrl}/social-integrations?status=error`);
    }

    const tokenData = await tokenResponse.json();

    console.log("EXPIRES IN:")
    console.log(tokenData.expires_in)

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    const { error } = await supabase.from('twitter_connections').upsert({
      clerk_user_id: user.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error('Error storing data in Supabase:', error);
      return NextResponse.redirect(`${baseUrl}/social-integrations?status=error`);
    }

    // Clear the state and code verifier cookies
    const response = NextResponse.redirect(`${baseUrl}/social-integrations?status=success`);
    response.cookies.delete('twitter_oauth_state');
    response.cookies.delete('twitter_code_verifier');

    return response;
  } catch (error) {
    console.error('Twitter OAuth Error:', error);
    return NextResponse.redirect(`${baseUrl}/social-integrations?status=error`);
  }
}