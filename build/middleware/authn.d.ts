import { ScopedRole } from '../loaders/fetchers/roleFetcher.js';
/**
 * Builds an authentication middleware function.
 *
 * This middleware function extracts and verifies a JWT token from the request headers,
 * decodes it to get user details, and attaches the user details and roles to the request object.
 *
 * @param {Function} [userService] - Service for fetching user roles.
 * @param {Function} [orgService] - Service for fetching organization roles.
 * @returns {Function} The authentication middleware function.
 */
export declare function authenticationMiddlewareBuilder(userDetailService?: (userID: number) => Promise<any>, scopedRoleService?: (userID: number) => Promise<ScopedRole>): (req: any, res: any, next: any) => void;
export declare const authenticationMiddleware: (req: any, res: any, next: any) => void;
