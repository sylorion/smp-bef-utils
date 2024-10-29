type KnownScope = 'SMP' | 'ORG';
type ScopedRole = {
    SMP: Role[];
    ORG: Role[];
};
type Role = {
    roleScope: KnownScope;
    legend: string;
    roleID: string;
};
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
export declare function scopedRoleServiceController(userID: number): Promise<{
    SMP: Role[];
    ORG: Role[];
}>;
/**
 * Fetches user roles from the USSP service based on the provided user ID.
 *
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of user roles.
 */
export declare const getUserRolesFromUsspService: (userID: number) => Promise<Role[]>;
/**
 * Fetches the organizational roles for a user from the organization service.
 *
 * @param {string} userID - The ID of the user whose organizational roles are to be fetched.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of user organizations, each containing:
 *   - {string} userOrganizationID - The ID of the user organization.
 *   - {string} organizationID - The ID of the organization.
 *   - {string} roleID - The ID of the role.
 *   - {string} legend - The legend of the role.
 *   - {string} userID - The ID of the user.
 *   - {string} state - The state of the user organization.
 */
export declare const getOrgRolesFromOrgService: (userID: number) => Promise<Role[]>;
export declare const authenticationMiddleware: (req: any, res: any, next: any) => void;
export {};
