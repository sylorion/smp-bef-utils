export interface UserDetail {
    userID: string;
    username?: string;
    email?: string;
    profile?: any;
    [key: string]: any;
}
/**
 * Fetches user roles from the USSP service based on the provided user ID.
 *
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<Role[]>} A promise that resolves to an array of user roles.
 */
export declare const getProfileDetailsFromUsspService: (profileID: string) => Promise<any[]>;
/**
 * Fetches user roles from the USSP service based on the provided user ID.
 *
 * @param {string[]} profileIDs:  - The IDs of the profiles to retrieve.
 * @returns {Promise<Role[]>} A promise that resolves to an array of user roles.
 */
export declare const getProfilesByIDsFromUsspService: (profileIDs: string[]) => Promise<Map<string, any>>;
