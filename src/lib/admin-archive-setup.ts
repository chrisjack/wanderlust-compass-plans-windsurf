import { supabase } from "@/integrations/supabase/client";

/**
 * Admin function to ensure Archive columns exist for ALL users in the system.
 * This should be run by an admin or during system maintenance.
 * 
 * WARNING: This function queries all users and should be used carefully.
 */
export async function ensureArchiveColumnsForAllUsers(): Promise<{
  success: boolean;
  message: string;
  createdCount: number;
  errorCount: number;
}> {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return {
        success: false,
        message: 'Failed to fetch users',
        createdCount: 0,
        errorCount: 0
      };
    }

    if (!users || users.length === 0) {
      return {
        success: true,
        message: 'No users found',
        createdCount: 0,
        errorCount: 0
      };
    }

    let createdCount = 0;
    let errorCount = 0;

    // Process each user
    for (const user of users) {
      try {
        // Check if user already has an Archive column
        const { data: existingArchive, error: checkError } = await supabase
          .from('planner_columns')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', 'Archive')
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`Error checking Archive column for user ${user.id}:`, checkError);
          errorCount++;
          continue;
        }

        // If Archive column doesn't exist, create it
        if (!existingArchive) {
          // Get the highest position number for this user's columns
          const { data: maxPositionResult, error: maxError } = await supabase
            .from('planner_columns')
            .select('position')
            .eq('user_id', user.id)
            .order('position', { ascending: false })
            .limit(1);

          if (maxError) {
            console.error(`Error getting max position for user ${user.id}:`, maxError);
            errorCount++;
            continue;
          }

          const newPosition = (maxPositionResult?.[0]?.position || 0) + 1;

          // Create the Archive column
          const { error: createError } = await supabase
            .from('planner_columns')
            .insert([{
              title: 'Archive',
              position: newPosition,
              user_id: user.id,
              is_archive: true
            }]);

          if (createError) {
            console.error(`Error creating Archive column for user ${user.id}:`, createError);
            errorCount++;
            continue;
          }

          createdCount++;
          console.log(`Archive column created for user: ${user.id}`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        errorCount++;
      }
    }

    const message = `Processed ${users.length} users. Created ${createdCount} Archive columns. Errors: ${errorCount}`;
    
    return {
      success: errorCount === 0,
      message,
      createdCount,
      errorCount
    };

  } catch (error) {
    console.error('Error in ensureArchiveColumnsForAllUsers:', error);
    return {
      success: false,
      message: 'Unexpected error occurred',
      createdCount: 0,
      errorCount: 1
    };
  }
}

/**
 * Function to get statistics about Archive columns across all users.
 */
export async function getArchiveColumnStats(): Promise<{
  totalUsers: number;
  usersWithArchive: number;
  usersWithoutArchive: number;
}> {
  try {
    // Get total user count
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      throw usersError;
    }

    // Get count of users with Archive columns
    const { count: usersWithArchive, error: archiveError } = await supabase
      .from('planner_columns')
      .select('user_id', { count: 'exact', head: true })
      .eq('title', 'Archive');

    if (archiveError) {
      throw archiveError;
    }

    return {
      totalUsers: totalUsers || 0,
      usersWithArchive: usersWithArchive || 0,
      usersWithoutArchive: (totalUsers || 0) - (usersWithArchive || 0)
    };

  } catch (error) {
    console.error('Error getting Archive column stats:', error);
    throw error;
  }
} 