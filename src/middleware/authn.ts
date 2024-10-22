
import pkgjwt from 'jsonwebtoken';  
import { ScopedRole } from '../loaders/fetchers/roleFetcher.js';
import { scopedRoleServiceController } from '../loaders/roleLoader.js';    
import { set } from './set.js';
const jwt = pkgjwt; 
const JWT_SECRET = process.env.SMP_USER_JWT_ACCESS_SECRET || 'f52001a8f0d6aa43ef65af68f8e9c81fac1a518666a7d8aec94a075ca11bee122dc87244ccfd9ec7187f1f51c066ee4a683bdcf6b0a5d1b5ec683c2b140d742a';

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
export function authenticationMiddlewareBuilder(
  userDetailService?: (userID: number) => Promise<any>,
  scopedRoleService?: (userID: number) => Promise<ScopedRole>
): (req: any, res: any, next: any) => void {
  return async (req: any, res: any, next: any) => {
    const userToken = req.headers['authorization'] || req.headers['Authorization'];
    if (!userToken || !userToken.startsWith('Bearer ')) {
      if (process.env.ENV_NODE != "prod") {
        console.error("======== NO BEARER FOR USER ========="); 
      }
    } else {
      const token = userToken.split(' ')[1];
      if (token) {
        console.log("======== BEARER FOUND FOR USER ========="); 
        try {
          const decodedToken = jwt.verify(token, JWT_SECRET);
          const { id } = (decodedToken as any);
          // console.log(`authenticationMiddlewareBuilder Decoded token: ${JSON.stringify(decodedToken, null, 2)}`);

          let userDetails = undefined;
          if (userDetailService) userDetails = await userDetailService(Number(id));
          let scopedRoles = undefined;
          if (scopedRoleService) scopedRoles = await scopedRoleService(Number(id));
          
          const me = {
            id: id,
            user: userDetails,
            roles: scopedRoles,
          }
          set(req, 'me', me);
          // console.log(`authenticationMiddlewareBuilder Me: ${JSON.stringify(req.me, null, 2)}`);
        } catch (error) {
          if (process.env.ENV_NODE != "prod") {
            console.error("JWT verification failed:", error);
          }
        }
      }
    }
    // Call next only once at the end of the middleware
    next();
  };
}

export const authenticationMiddleware = authenticationMiddlewareBuilder(undefined, scopedRoleServiceController);
