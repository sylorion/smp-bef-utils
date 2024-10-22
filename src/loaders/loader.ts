import pkgjwt from 'jsonwebtoken'; 

const jwt = pkgjwt; 
import { gql, request } from 'graphql-request';

const JWT_SECRET = process.env.SMP_USER_JWT_ACCESS_SECRET || 'f52001a8f0d6aa43ef65af68f8e9c81fac1a518666a7d8aec94a075ca11bee122dc87244ccfd9ec7187f1f51c066ee4a683bdcf6b0a5d1b5ec683c2b140d742a';
const USER_SERVICE_URL = process.env.SMP_USER_SPACE_SERVICE_URL || 'http://localhost:4000/graphql';
const ORG_SERVICE_URL = process.env.SMP_ORGANIZATION_SERVICE_URL || 'http://localhost:4001/graphql';

type KnownScpoe = 'SMP' | 'ORG';
type UserToken = {
  userID: string; 
};

type Role = {
  roleScope: KnownScpoe;
  legend: string;
  roleID: string;
};

type UserContext = {
  user: {
    userID: string; 
    roles: Record<KnownScpoe, string[]>;
  };
};

/**
 * Middleware to check the authorization token of a user.
 * 
 * This function extracts the JWT token from the request headers, decodes it to get user details,
 * fetches user roles from the User and Organization microservices, and attaches the roles and 
 * user details to the request object.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers.authorization - The authorization header containing the Bearer token.
 * @param {string} req.headers.Authorization - The authorization header containing the Bearer token (case insensitive).
 * @param {string} req.ip - The IP address of the client making the request.
 * @param {string} req.headers.origin - The origin header of the request.
 * @param {string} req.headers.referer - The referer header of the request.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack. 
 * @returns {void} 
 * @throws {Error} If there is an error in user authentication.
 */
export async function checkAuthUserToken(req: any, res: any, next: any) {
  const userToken = req.headers['authorization'] || req.headers['Authorization'];
  if (!userToken || !userToken.startsWith('Bearer ')) {
    if (process.env.ENV_NODE != "prod") {
      console.error("======== NO BEARER FOR USER ========="); 
      console.log(`Nouvelle requête de ${req.ip} depuis ${req.headers.origin} + referrer : ${req.headers.referer}`);
      next();
    }
  } else {
    const token = userToken.split(' ')[1];
    if (token) {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      const { userID } = (decodedToken as any);
      console.log(`checkAuthUserToken Decoded token: ${JSON.stringify(decodedToken, null, 2)}`);
      const userRoles = await getUserRolesFromUsspService(userID);
      const orgRoles = await getOrgRolesFromOrgService(userID);

      const roles: Record<KnownScpoe, string[]> = { SMP: [], ORG: [] };
      userRoles.forEach(role => {
        role.roleScope = "SMP";
        if (!roles[role.roleScope]) {
          roles[role.roleScope] = [];
        }
        roles[role.roleScope].push(role.roleID);
      });
      orgRoles.forEach(role => {
        role.roleScope = "ORG";
        if (!roles[role.roleScope]) {
          roles[role.roleScope] = [];
        }
        roles[role.roleScope].push(role.roleID);
      });

      try {
        req.user = {
          userID, 
          roles,
        };
        console.log(`checkAuthUserToken User roles: ${JSON.stringify(req.user, null, 2)}`);
      } catch (error) {
        console.error("======== ERROR IN USER AUTHENTICATION =========");
        console.error(error);
        // throw error;
      }
      next();
    }
  }
}

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
export function authenticationMiddlewareBuilder(userService?: (userID: string) => Promise<Role[]>, orgService?: (userID: string) => Promise<Role[]>): (req: any, res: any, next: any) => void {
  return async (req: any, res: any, next: any) => {
    const userToken = req.headers['authorization'] || req.headers['Authorization'];
    if (!userToken || !userToken.startsWith('Bearer ')) {
      if (process.env.ENV_NODE != "prod") {
        console.error("======== NO BEARER FOR USER ========="); 
        console.log(`Nouvelle requête de ${req.ip} depuis ${req.headers.origin} + referrer : ${req.headers.referer}`);
        next();
      }
    } else {
      const token = userToken.split(' ')[1];
      if (token) {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const { userID } = (decodedToken as any);
        console.log(`authenticationMiddlewareBuilder Decoded token: ${JSON.stringify(decodedToken, null, 2)}`);

        const userRoles: Role[] = userService ? await userService(userID) : [];
        const orgRoles: Role[] = orgService ? await orgService(userID) : [];

        const roles: Record<KnownScpoe, string[]> = { SMP: [], ORG: [] };
        userRoles.forEach(role => {
          role.roleScope = "SMP";
          if (!roles[role.roleScope]) {
            roles[role.roleScope] = [];
          }
          roles[role.roleScope].push(role.legend);
        });
        orgRoles.forEach(role => {
          role.roleScope = "ORG";
          if (!roles[role.roleScope]) {
            roles[role.roleScope] = [];
          }
          roles[role.roleScope].push(role.legend);
        });

        req.user = {
          userID,
          roles,
        };
        console.log(`authenticationMiddlewareBuilder User roles: ${JSON.stringify(req.user, null, 2)}`);
      }
    }
    next();
  };
}

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
export async function scopedRoleServiceController(userID: string): Promise<{ SMP: Role[], ORG: Role[] }> {
  const userRoles = await getUserRolesFromUsspService(userID);
  const orgRoles = await getOrgRolesFromOrgService(userID);

  const roles: { SMP: Role[], ORG: Role[] } = {
    SMP: [],
    ORG: []
  };

  userRoles.forEach(role => {
    role.roleScope = "SMP";
    roles.SMP.push(role);
  });
  orgRoles.forEach(role => {
    role.roleScope = "ORG";
    roles.ORG.push(role);
  });

  return roles;
}

/**
 * Fetches user roles from the USSP service based on the provided user ID.
 *
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of user roles.
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
  console.log(`getUserRolesFromUsspService USER_SERVICE_URL: ${USER_SERVICE_URL}`);
  const response = await request(USER_SERVICE_URL, query, variables);
  return (response as any).userRoles;
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
  console.log(`getOrgRolesFromOrgService ORG_SERVICE_URL: ${ORG_SERVICE_URL}`);
  const response = await request(ORG_SERVICE_URL, query, variables);
  return (response as any).userOrganizations;
};

export const authenticationMiddleware = authenticationMiddlewareBuilder(undefined, getOrgRolesFromOrgService);
