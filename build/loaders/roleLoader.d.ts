import { ScopedRole } from "./fetchers/roleFetcher.js";
/**
 * Middleware to build an authentication function that retrieves user data from the User and Organization microservices.
 *
 * @param {string} userID - The id of the user to retrieve data.
 * @param {Object} context - The context object to attach the user data to.
 * @returns {Function} - The authentication middleware function.
 */
export declare function rolesLoaderFor(userID: number, context: object | null): Promise<any>;
/**
 * Fetches and aggregates user roles from User and Organization microservices,
 * then attaches these roles to the context with appropriate scopes.
 *
 * @async
 * @function scopedRoleServiceController
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<Object>} A promise that resolves to an object containing the user's roles,
 *                            categorized by their scope (e.g., "SMP" for user roles and "ORG" for org roles).
 */
export declare function scopedRoleServiceController(userID: number): Promise<ScopedRole>;
