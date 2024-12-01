import { logger, schedules } from "@trigger.dev/sdk/v3";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client outside the function to avoid recreating on each run
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const deleteOldPublishedPostsTask = schedules.task({
  id: "delete-old-published-posts",
  // Run daily at midnight
  cron: "0 0 * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    try {
      // Log the start of the task
      logger.log("Starting delete old published posts task", { 
        timestamp: payload.timestamp 
      });
      
      // Calculate the date 7 days ago in UTC
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Delete published posts older than 7 days
      const { data, error, count } = await supabase
        .from('posts')
        .delete()
        .eq('status', 'published')
        .lt('scheduled_at', sevenDaysAgo);

      if (error) {
        logger.error("Error deleting old published posts", { error });
        throw error;
      }

      logger.log("Deleted old published posts", {
        deletedPostsCount: count
      });

      return {
        success: true,
        message: "Old published posts deletion task completed",
        deletedPostsCount: count
      };
    } catch (error) {
      // Log any errors
      logger.error("Error in delete old published posts task", { 
        error: error instanceof Error ? error.message : String(error) 
      });

      // Throw the error to mark the task as failed
      throw error;
    }
  },
});