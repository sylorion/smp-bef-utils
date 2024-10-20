/**
 * Middleware to build an authentication function that retrieves user data from the User and Organization microservices.
 *
 * @param {string} userID - The id of the user to retrieve data.
 * @param {Object} context - The context object to attach the user data to.
 * @returns {Function} - The authentication middleware function.
 */
export declare function rolesLoaderFor(userID: string, context: object | null): Promise<any>;
