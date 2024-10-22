
import { gql, request } from 'graphql-request';

const USER_SERVICE_URL:string = process.env.SMP_USER_SPACE_SERVICE_URL ?? 'http://localhost:4000/graphql';
const ORG_SERVICE_URL:string = process.env.SMP_ORGANIZATION_SERVICE_URL ?? 'http://localhost:4000/graphql';

export type KnownScope = 'SMP' | 'ORG';
export type ScopedRole = { SMP: Role[], ORG: Role[] };
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
export const getUserRolesFromUsspService = async (userID: number): Promise<Role[]> => {
  if (!userID) {
    return [];
  }
  const query = gql `
  query GetUserRoles {
    userRoles(pagination: { limit: 10, offset: 0 }, sort: { field: "userRoleID", order: "ASC" }, filter: [{ field: "userID", value: "${userID}", operator: "=" }]){
      userRoleID
      uniqRef
      slug
      legend
      authorID
      userID
      roleID
      state
      createdAt
      updatedAt
      deletedAt
    }
  }
  `;

  const variables = {
    pagination: { limit: 10, offset: 0 },
    sort: { field: "userRoleID", order: "ASC" },
    filter: [{ field: "userID", value: `${userID}`, operator: "=" }]
  };
  // console.log(`getUserRolesFromUsspService USER_SERVICE_URL: ${USER_SERVICE_URL}`);
  try {
    const response = await request(USER_SERVICE_URL, query, variables);
    const userRoles = (response as any).userRoles;
    return userRoles;
  } catch (error) {
    console.error(`getUserRolesFromUsspService ERROR: ${error}`);
    return [];
  }
};

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
export const getOrgRolesFromOrgService = async (userID: number): Promise<Role[]> => {
  if (!userID) {
    return [];
  } 
  const query = gql`
    query GetOrgRoles {
      userOrganizations(pagination: { limit: 10, offset: 0 }, sort: { field: "userOrganizationID", order: "ASC" }, filter: [{ field: "userID", value: "${userID}", operator: "=" }]) {
        userOrganizationID
        uniqRef
        slug
        authorID
        legend
        userID
        roleID
        organizationID
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const variables = {
    pagination: { limit: 10, offset: 0 },
    sort: { field: "userOrganizationID", order: "ASC" },
    filter: [{ field: "userID", value: `${userID}`, operator: "=" }]
  };
  // console.log(`getOrgRolesFromOrgService ORG_SERVICE_URL: ${ORG_SERVICE_URL}`);
  const response = await request(ORG_SERVICE_URL, query, variables);
  return (response as any).userOrganizations;
};
