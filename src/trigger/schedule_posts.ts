import { logger, schedules, wait } from "@trigger.dev/sdk/v3";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client outside the function to avoid recreating on each run
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const schedulePosts = schedules.task({
  id: "schedule-posts",
  // Run every 15 minutes
  cron: "*/15 * * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    try {
      // Log the start of the task
      logger.log("Starting delete scheduled posts task", { 
        timestamp: payload.timestamp 
      });
      
      // Query to get all posts that have a "Scheduled time" that is in a delta of 2 min of current time (in UTC)
      const { data: data_posts, error: error_posts } = await supabase
        .from('posts')
        .select()
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date(Date.now() - 2 * 60 * 1000).toISOString())
        .lte('scheduled_at', new Date(Date.now() + 2 * 60 * 1000).toISOString());

      // Log the results
      if (error_posts) {
        logger.error("Error deleting scheduled posts", { error_posts });
        throw error_posts;
      }

      // Iterate through each post and perform additional actions
      if (data_posts && data_posts.length > 0) {
        for (const post of data_posts) {
          logger.log("Processing scheduled post", {
            postId: post.id,
            scheduledAt: post.scheduled_at,
          });

          // Call linkedin API if post has linkedin content
          // Fetch the token from the table for the user id of the post

          // call the api


          // Call twitter Api if post has twitter content
          // Fetch token from table for the user id of the post

          // call the api
        }
      }

      // Query to update scheduled posts to published
      const { data: data_update, error: error_update} = await supabase
        .from('posts')
        .update({ status: 'published' })
        .eq('status', 'scheduled')
      
      if (error_update) {
        logger.error("Error updating posts to published", { error_update });
        throw error_update;
      }

      return {
        success: true,
        message: "Scheduled posts published task completed",
        processedPosts: data_posts?.length || 0
      };
    } catch (error) {
      // Log any errors
      logger.error("Error in delete scheduled posts task", { 
        error: error instanceof Error ? error.message : String(error) 
      });

      // Throw the error to mark the task as failed
      throw error;
    }
  },
});