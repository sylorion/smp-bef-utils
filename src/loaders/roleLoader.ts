
import { ScopedRoles, UserRoles, getUserRolesFromUsspService, getOrgRolesFromOrgService } from "./fetchers/roleFetcher";
/**
 * Middleware to build an authentication function that retrieves user data from the User and Organization microservices.
 *
 * @param {string} userID - The id of the user to retrieve data.
 * @param {Object} context - The context object to attach the user data to.
 * @returns {Function} - The authentication middleware function.
 */
export async function rolesLoaderFor(userID: string, context: object | null): Promise<any> {
  if (!context) {
    throw new Error("Context is required to build authentication middleware function.");
  } else {
    let userRoles: ScopedRoles = undefined;
    userRoles = await scopedUserRoleServiceController(userID);
    console.log(`authenticationBuilder User roles: ${JSON.stringify(userRoles, null, 2)}`);
    return userRoles;
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
async function scopedUserRoleServiceController(userID: string): Promise<ScopedRoles> {
  const [userRoles, orgRoles] = await Promise.all([
    await getUserRolesFromUsspService(userID), 
    await getOrgRolesFromOrgService(userID)]);

  const roles: ScopedRoles = {};
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
