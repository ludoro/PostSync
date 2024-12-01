// api/auth/twitter/route.ts
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { randomBytes, createHash } from 'crypto';

// Helper function to generate code verifier and challenge
function generateCodeChallenge() {
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return { codeVerifier, codeChallenge };
}

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.redirect('/sign-in');
    }

    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/twitter/callback`;

    if (!clientId || !redirectUri) {
      console.error('Missing required environment variables.');
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    const state = randomBytes(16).toString('hex');
    const { codeVerifier, codeChallenge } = generateCodeChallenge();
    const scopes = ['tweet.read', 'users.read', 'offline.access'];

    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
      ' '
    )}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256&duration=permanent`;

    console.log('Redirecting user to Twitter for authorization:', authUrl);

    const response = NextResponse.redirect(authUrl);
    
    // Set cookies for state and code verifier
    response.cookies.set({
      name: 'twitter_oauth_state',
      value: state,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 600, // 10 minutes
      sameSite: 'lax'
    });
    
    response.cookies.set({
      name: 'twitter_code_verifier',
      value: codeVerifier,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 600, // 10 minutes
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Error during Twitter authentication initiation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}