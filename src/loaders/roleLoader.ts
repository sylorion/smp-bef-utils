
import { ScopedRole, UserRoles, getUserRolesFromUsspService, getOrgRolesFromOrgService, Role } from "./fetchers/roleFetcher.js";

/**
 * Middleware to build an authentication function that retrieves user data from the User and Organization microservices.
 *
 * @param {string} userID - The id of the user to retrieve data.
 * @param {Object} context - The context object to attach the user data to.
 * @returns {Function} - The authentication middleware function.
 */
export async function rolesLoaderFor(userID: number, context: object | null): Promise<any> {
  if (!context) {
    throw new Error("Context is required to build authentication middleware function.");
  } else {
    let userRoles = undefined;
    userRoles = await scopedRoleServiceController(userID);
    // console.log(`authenticationBuilder User roles: ${JSON.stringify(userRoles, null, 2)}`);
    return userRoles;
  }
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
export async function scopedRoleServiceController(userID: number): Promise<ScopedRole> {
  const orgRoles = await getOrgRolesFromOrgService(userID);
  // console.log(`scopedRoleServiceController ${userID} => orgRoles: ${JSON.stringify(orgRoles, null, 2)}`);
  const userRoles = await getUserRolesFromUsspService(userID);
  // console.log(`scopedRoleServiceController ${userID} => userRoles: ${JSON.stringify(orgRoles, null, 2)}`);

  const roles: ScopedRole = {
    SMP: [],
    ORG: []
  };

  userRoles.forEach(role => {
    roles.SMP.push(role);
  });
  orgRoles.forEach(role => { 
    roles.ORG.push(role);
  });

  return roles;
}
