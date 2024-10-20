import { profile } from '@/public/images/PROFILE.png';
// Middleware for Apollo Federation Gateway to decode JWT and propagate roles and scopes in context
import jwt from 'jsonwebtoken';
import { gql, request } from 'graphql-request';
import { Request, Response, NextFunction } from 'express';

// Assuming the secret for decoding the JWT
const JWT_SECRET = process.env.SMP_USER_JWT_SECRET || 'f52001a8f0d6aa43ef65af68f8e9c81fac1a518666a7d8aec94a075ca11bee122dc87244ccfd9ec7187f1f51c066ee4a683bdcf6b0a5d1b5ec683c2b140d742a';
const USER_SERVICE_URL = process.env.SMP_USER_SPACE_SERVICE_URL;
const ORG_SERVICE_URL = process.env.SMP_ORGANIZATION_SERVICE_URL;

interface DecodedToken {
  userID: string;
  username?: string;
  email?: string;
  [key: string]: any;
}

interface UserDetail {
  userID: string;
  username?: string;
  email?: string;
  profile?: any; 
  [key: string]: any;
}

interface Role {
  roleID: number;
  legend: string;
  state: string;
  userID: number;
  userRoleID?: number;
  userOrganizationID?: number;
  organizationID?: number;
  roleScope: string;
}

interface UserRoles {
  roles: Record<string, Role[]>;
  [key: string]: any;
}

/**
 * Middleware to build an authentication function that retrieves user data from the User and Organization microservices.
 *
 * @param {Object} context - The context object to attach the user data to.
 * @param {Function} userServiceController - The function that retrieves user data from the User microservice.
 * @param {Function} scopedRoleServiceController - The function that retrieves user roles from the Organization microservice.
 * @returns {Function} - The authentication middleware function.
 */
async function authenticationBuilder(
  context: object | null,
  userID: string,
  userServiceController: (userID: string) => Promise<any>,
  scopedRoleServiceController: (userID: string) => Promise<UserRoles>
): Promise<any> {
  if (!context) {
    throw new Error("Context is required to build authentication middleware function.");
  } else {
    let userDetails: any = undefined;
    let userRoles: UserRoles | undefined = undefined;

    if (scopedRoleServiceController) {
      userRoles = await scopedRoleServiceController(userID);
    }
    if (userServiceController) {
      userDetails = await userServiceController(userID);
    }

    const detailedUser = userDetails ? { ...userDetails, ...userRoles } : { userID, ...userRoles };
    console.log(`authenticationBuilder User roles: ${JSON.stringify(detailedUser, null, 2)}`);
    return detailedUser;
  }
}

/**
 * Fetches and aggregates user roles from User and Organization microservices,
 * then attaches these roles to the context with appropriate scopes.
 *
 * @async
 * @function scopedUserRoleServiceController
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<User>} A promise that resolves to an object containing the user's roles,
 *                            categorized by their scope (e.g., "SMP" for user roles and "ORG" for org roles).
 */
async function scopedUserRoleServiceController(userID: string): Promise<UserRoles> {
  const userRoles = await getUserRolesFromUsspService(userID);
  const orgRoles = await getOrgRolesFromOrgService(userID);

  const roles: Record<string, Role[]> = {};
  userRoles.forEach(role => {
    role.roleScope = "SMP";
    if (!roles[role.roleScope]) {
      roles[role.roleScope] = [];
    }
    roles[role.roleScope].push(role);
  });
  orgRoles.forEach(role => {
    role.roleScope = "ORG";
    if (!roles[role.roleScope]) {
      roles[role.roleScope] = [];
    }
    roles[role.roleScope].push(role);
  });
  const user: UserRoles = {
    roles,
  };
  return user;
}

/**
 * Fetches user roles from the USSP service based on the provided user ID.
 *
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<Role[]>} A promise that resolves to an array of user roles.
 */
const getUserRolesFromUsspService = async (userID: string): Promise<Role[]> => {
  const query = gql`
    query GetUserRoles($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
      userRoles(pagination: $pagination, sort: $sort, filter: $filter) {
        roleID
        userRoleID
        legend
        state
        userID
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
        roleID
        legend
        userID
        state
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


/**
 * Fetches and aggregates user details from the User Space microservice.
 *
 * @async
 * @function userDetailRetrievingServiceController
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<User>} A promise that resolves to an object containing the user's roles,
 *                            categorized by their scope (e.g., "SMP" for user roles and "ORG" for org roles).
 */
async function userDetailRetrievingServiceController(userID: string): Promise<UserDetails> {
  const userRoles = await getUserRolesFromUsspService(userID);
  const orgRoles = await getOrgRolesFromOrgService(userID);

  const roles: Record<string, Role[]> = {};
  userRoles.forEach(role => {
    role.roleScope = "SMP";
    if (!roles[role.roleScope]) {
      roles[role.roleScope] = [];
    }
    roles[role.roleScope].push(role);
  });
  orgRoles.forEach(role => {
    role.roleScope = "ORG";
    if (!roles[role.roleScope]) {
      roles[role.roleScope] = [];
    }
    roles[role.roleScope].push(role);
  });
  const user: UserRoles = {
    roles,
  };
  return user;
}
