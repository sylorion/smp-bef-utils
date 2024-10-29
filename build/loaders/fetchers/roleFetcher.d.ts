export type KnownScope = 'SMP' | 'ORG';
export type ScopedRole = {
    SMP: string[];
    ORG: string[];
};
export interface Role {
    roleID: number;
    legend: string;
    state: string;
    userID: number;
    userRoleID?: number;
    userOrganizationID?: number;
    organizationID?: number;
    roleScope?: KnownScope;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
export interface UserRoles {
    roles: Record<string, Role[]>;
    [key: string]: any;
}
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
