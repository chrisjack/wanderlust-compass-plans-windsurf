import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures that the current user has an Archive column.
 * This function can be called on app initialization to guarantee Archive columns exist.
 */
export async function ensureArchiveColumn(userId: string): Promise<void> {
  try {
    // Check if user already has an Archive column
    const { data: existingArchive, error: checkError } = await supabase
      .from('planner_columns')
      .select('id')
      .eq('user_id', userId)
      .eq('title', 'Archive')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for Archive column:', checkError);
      return;
    }

    // If Archive column doesn't exist, create it
    if (!existingArchive) {
      // Get the highest position number for this user's columns
      const { data: maxPositionResult, error: maxError } = await supabase
        .from('planner_columns')
        .select('position')
        .eq('user_id', userId)
        .order('position', { ascending: false })
        .limit(1);

      if (maxError) {
        console.error('Error getting max position:', maxError);
        return;
      }

      const newPosition = (maxPositionResult?.[0]?.position || 0) + 1;

      // Create the Archive column
      const { error: createError } = await supabase
        .from('planner_columns')
        .insert([{
          title: 'Archive',
          position: newPosition,
          user_id: userId,
          is_archive: true
        }]);

      if (createError) {
        console.error('Error creating Archive column:', createError);
        return;
      }

      console.log('Archive column created for user:', userId);
    }
  } catch (error) {
    console.error('Error in ensureArchiveColumn:', error);
  }
}

/**
 * Batch function to ensure Archive columns for multiple users.
 * This can be used for bulk operations or admin functions.
 */
export async function ensureArchiveColumnsForUsers(userIds: string[]): Promise<void> {
  for (const userId of userIds) {
    await ensureArchiveColumn(userId);
  }
} 