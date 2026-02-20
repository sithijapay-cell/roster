/**
 * Badge system based on referral count
 * Bronze Nurse: 1-5 referrals
 * Silver Nurse: 6-15 referrals
 * Gold Nurse: 16-30 referrals
 * Platinum Legend: 30+ referrals
 */

export const BADGES = [
    { id: 'platinum', label: 'Platinum Legend', emoji: '💎', min: 31, color: 'from-violet-400 to-purple-600', textColor: 'text-violet-400', bgColor: 'bg-violet-500/15 border-violet-500/30' },
    { id: 'gold', label: 'Gold Nurse', emoji: '🥇', min: 16, color: 'from-yellow-400 to-amber-600', textColor: 'text-yellow-400', bgColor: 'bg-yellow-500/15 border-yellow-500/30' },
    { id: 'silver', label: 'Silver Nurse', emoji: '🥈', min: 6, color: 'from-slate-300 to-slate-500', textColor: 'text-slate-300', bgColor: 'bg-slate-400/15 border-slate-400/30' },
    { id: 'bronze', label: 'Bronze Nurse', emoji: '🥉', min: 1, color: 'from-orange-400 to-orange-700', textColor: 'text-orange-400', bgColor: 'bg-orange-500/15 border-orange-500/30' },
];

/**
 * Get badge info for a given referral count
 * @param {number} referralCount
 * @returns {{ id: string, label: string, emoji: string, min: number, color: string, textColor: string, bgColor: string } | null}
 */
export const getBadge = (referralCount = 0) => {
    const count = Number(referralCount) || 0;
    if (count < 1) return null;
    return BADGES.find(b => count >= b.min) || null;
};

/**
 * Get the next badge info (for progress display)
 * @param {number} referralCount
 * @returns {{ badge: object, remaining: number } | null}
 */
export const getNextBadge = (referralCount = 0) => {
    const count = Number(referralCount) || 0;
    // Find the next tier they haven't reached
    const reversed = [...BADGES].reverse(); // bronze first
    for (const badge of reversed) {
        if (count < badge.min) {
            return { badge, remaining: badge.min - count };
        }
    }
    return null; // Already at max
};
