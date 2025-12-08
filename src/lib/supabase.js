import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Save or update highscore for a wallet address
 * @param {string} walletAddress - The user's wallet address
 * @param {number} kills - Total kills to save
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export const saveHighscore = async (walletAddress, kills) => {
    try {
        // First, get existing record
        const { data: existing, error: fetchError } = await supabase
            .from('highscores')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 = no rows found, which is fine for new users
            console.error('Error fetching highscore:', fetchError);
            return { success: false, error: fetchError };
        }

        if (existing) {
            // Update only if new kills is higher
            if (kills > existing.total_kills) {
                const { data, error } = await supabase
                    .from('highscores')
                    .update({ 
                        total_kills: kills,
                        updated_at: new Date().toISOString()
                    })
                    .eq('wallet_address', walletAddress)
                    .select();

                if (error) {
                    console.error('Error updating highscore:', error);
                    return { success: false, error };
                }
                return { success: true, data, isNewHighscore: true };
            }
            return { success: true, data: existing, isNewHighscore: false };
        } else {
            // Insert new record
            const { data, error } = await supabase
                .from('highscores')
                .insert({
                    wallet_address: walletAddress,
                    total_kills: kills
                })
                .select();

            if (error) {
                console.error('Error inserting highscore:', error);
                return { success: false, error };
            }
            return { success: true, data, isNewHighscore: true };
        }
    } catch (error) {
        console.error('Error saving highscore:', error);
        return { success: false, error };
    }
};

/**
 * Get highscore for a wallet address
 * @param {string} walletAddress - The user's wallet address
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export const getHighscore = async (walletAddress) => {
    try {
        const { data, error } = await supabase
            .from('highscores')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching highscore:', error);
            return { success: false, error };
        }

        return { success: true, data: data || { total_kills: 0 } };
    } catch (error) {
        console.error('Error getting highscore:', error);
        return { success: false, error };
    }
};

/**
 * Get top highscores (leaderboard)
 * @param {number} limit - Number of top scores to fetch
 * @returns {Promise<{success: boolean, data?: any[], error?: any}>}
 */
export const getLeaderboard = async (limit = 10) => {
    try {
        const { data, error } = await supabase
            .from('highscores')
            .select('*')
            .order('total_kills', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return { success: false, error };
    }
};

/**
 * Get user's rank in the leaderboard
 * @param {string} walletAddress - The user's wallet address
 * @returns {Promise<{success: boolean, rank?: number, data?: any, error?: any}>}
 */
export const getUserRank = async (walletAddress) => {
    try {
        // First get the user's score
        const { data: userData, error: userError } = await supabase
            .from('highscores')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single();

        if (userError && userError.code !== 'PGRST116') {
            console.error('Error fetching user data:', userError);
            return { success: false, error: userError };
        }

        if (!userData) {
            return { success: true, rank: null, data: null };
        }

        // Count how many users have more kills
        const { count, error: countError } = await supabase
            .from('highscores')
            .select('*', { count: 'exact', head: true })
            .gt('total_kills', userData.total_kills);

        if (countError) {
            console.error('Error counting ranks:', countError);
            return { success: false, error: countError };
        }

        const rank = (count || 0) + 1;

        return { success: true, rank, data: userData };
    } catch (error) {
        console.error('Error getting user rank:', error);
        return { success: false, error };
    }
};

