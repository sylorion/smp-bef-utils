
import { gql, request } from 'graphql-request';

const USER_SERVICE_URL = process.env.SMP_USER_SPACE_SERVICE_URL;
const ORG_SERVICE_URL = process.env.SMP_ORGANIZATION_SERVICE_URL;

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
export const getUserRolesFromUsspService = async (userID: string): Promise<Role[]> => {
  const query = gql`
    query GetUserRoles($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
      userRoles(pagination: $pagination, sort: $sort, filter: $filter) {
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
  const response = await request(USER_SERVICE_URL, query, variables);
  return response.userRoles;
}

/**
 * Fetches the organizational roles for a user from the organization service.
 *
 * @param {string} userID - The ID of the user whose organizational roles are to be fetched.
 * @returns {Promise<Role[]>} A promise that resolves to an array of user organizations.
 */
export const getOrgRolesFromOrgService = async (userID: string): Promise<Role[]> => {
  const query = gql`
    query GetOrgRoles($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
      userOrganizations(pagination: $pagination, sort: $sort, filter: $filter) {
        userOrganizationID
        organizationID
        uniqRef
        slug
        roleID
        legend
        userID
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
  const response = await request(ORG_SERVICE_URL, query, variables);
  return response.userOrganizations;
}
