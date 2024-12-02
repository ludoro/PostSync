// api/auth/twitter/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify the current user
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if the user id exists in the twitter_connections table
    const { data: connectionData, error: connectionError } = await supabase
      .from('twitter_connections')
      .select('clerk_user_id')
      .eq('clerk_user_id', user.id)
      .single();

    if (connectionError || !connectionData) {
      return new NextResponse(JSON.stringify({ error: 'User not found in twitter_connections' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Retrieve the stored refresh token for the user
    const { data, error: fetchError } = await supabase
      .from('twitter_connections')
      .select('refresh_token')
      .eq('clerk_user_id', user.id)
      .single();

    if (fetchError || !data?.refresh_token) {
      console.error('No refresh token found', fetchError);
      return new NextResponse(JSON.stringify({ error: 'No refresh token available' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Refresh the token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: data.refresh_token,
        client_id: process.env.TWITTER_CLIENT_ID!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Error refreshing access token:', tokenResponse.statusText, errorText);
      return new NextResponse(JSON.stringify({ error: 'Failed to refresh token' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tokenData = await tokenResponse.json();

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Update the tokens in Supabase
    const { error: updateError } = await supabase
      .from('twitter_connections')
      .update({
        updated_at: new Date().toISOString(),
        refresh_token: tokenData.refresh_token, // Twitter might issue a new refresh token
        expires_at: expiresAt.toISOString(),
      })
      .eq('clerk_user_id', user.id);

    if (updateError) {
      console.error('Error updating tokens in Supabase:', updateError);
      return new NextResponse(JSON.stringify({ error: 'Failed to update tokens' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the new access token
    return new NextResponse(JSON.stringify({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in token refresh:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}