// app/api/auth/linkedin/route.ts
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    // Ensure user is authenticated
    const user = await currentUser();

    if (!user) {
      return NextResponse.redirect('/sign-in');
    }

    // Check for required environment variables
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`;

    if (!clientId || !redirectUri) {
      console.error('Error: Missing environment variables LINKEDIN_CLIENT_ID or NEXT_PUBLIC_BASE_URL');
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Generate and store state parameter (using cryptographically secure random string)
    const state = randomBytes(16).toString('hex');

    // Define scopes
    const scopes = ['r_liteprofile', 'r_emailaddress'];

    // Construct authorization URL
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
      ' '
    )}&state=${state}`;

    console.log('Redirecting user to LinkedIn for authorization:', authUrl); // Log the URL

    // Create a response and set the cookie header
    const response = NextResponse.redirect(authUrl);
    response.headers.set(
        'Set-Cookie',
        `linkedin_oauth_state=${state}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; Path=/; Max-Age=${60 * 10}; SameSite=Lax`
      );

    return response; // Return the modified response

  } catch (error) {
    console.error('Error during LinkedIn authentication initiation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}