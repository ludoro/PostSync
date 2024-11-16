import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.SIGNING_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, } = evt.data;
    
    const primaryEmail = email_addresses[0]?.email_address;

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: id,
            email: primaryEmail,
            first_name: first_name || null,
          }
        ])
        .select()

      if (error) throw error;

      return new Response(JSON.stringify({
        message: 'User successfully created in Supabase',
        user: data[0]
      }), {
        status: 200
      })

    } catch (error) {
      console.error('Error inserting user into Supabase:', error)
      return new Response(JSON.stringify({
        error: 'Error creating user in Supabase'
      }), {
        status: 500
      })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error;

      return new Response(JSON.stringify({
        message: 'User successfully deleted from Supabase'
      }), {
        status: 200
      })

    } catch (error) {
      console.error('Error deleting user from Supabase:', error)
      return new Response(JSON.stringify({
        error: 'Error deleting user from Supabase'
      }), {
        status: 500
      })
    }
  }

  return new Response('Webhook received', {
    status: 200
  })
}