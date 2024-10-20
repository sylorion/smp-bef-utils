export interface Role {
    roleID: number;
    legend: string;
    state: string;
    userID: number;
    userRoleID?: number;
    userOrganizationID?: number;
    organizationID?: number;
    roleScope: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
export type ScopedRoles = Record<string, Role[]> | undefined;
export interface UserRoles {
    roles: Record<string, Role[]>;
    [key: string]: any;
}
/**
 * Fetches user roles from the USSP service based on the provided user ID.
 *
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<Role[]>} A promise that resolves to an array of user roles.
 */
export declare const getUserRolesFromUsspService: (userID: string) => Promise<Role[]>;
/**
 * Fetches the organizational roles for a user from the organization service.
 *
 * @param {string} userID - The ID of the user whose organizational roles are to be fetched.
 * @returns {Promise<Role[]>} A promise that resolves to an array of user organizations.
 */
export declare const getOrgRolesFromOrgService: (userID: string) => Promise<Role[]>;
