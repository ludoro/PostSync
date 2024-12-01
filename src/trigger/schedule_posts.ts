import { logger, schedules, wait } from "@trigger.dev/sdk/v3";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client outside the function to avoid recreating on each run
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const deleteScheduledPostsTask = schedules.task({
  id: "delete-scheduled-posts",
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
      // Query to update scheduled posts to published
      const { data, error } = await supabase
        .from('posts')
        .update({ status: 'published' })
        .eq('status', 'scheduled')

      // Log the results
      if (error) {
        logger.error("Error deleting scheduled posts", { error });
        throw error;
      }

      return {
        success: true,
        message: "Scheduled posts published task completed",
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