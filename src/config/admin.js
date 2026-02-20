// List of Admin UIDs
// REPLACE with your actual UID from Firebase Console or Profile Page console.log
export const ADMIN_UIDS = [
    'aTvg5P0jdoMhC79p4n8Md0Toprr2'
];

export const isAdmin = (user) => {
    if (!user || !user.uid) return false;
    return ADMIN_UIDS.includes(user.uid);
};
