import { authenticatedDirective } from './graphql/directives/authenticatedDirective.js';
import { authorizationDirective } from './graphql/directives/authorizationDirective.js';
import { rolesLoaderFor } from './loaders/roleLoader.js';
import { userLoaders } from './loaders/userLoader.js';
export { getUserRolesFromUsspService, getOrgRolesFromOrgService } from './loaders/loader.js';
export { authenticationMiddleware, } from './middleware/authn.js';
export { rolesLoaderFor, userLoaders, authenticatedDirective, authorizationDirective };
export interface User {
    id: string;
    name: string;
    role: Role;
    [key: string]: any;
}
export type Role = 'Admin' | 'Client' | 'ANALYST' | 'Moderator';
export interface GraphQLContext {
    user?: User;
}
declare const authorizationDirectiveTypeDefs: string, authorizationDirectiveTransformer: (schema: import("graphql").GraphQLSchema) => import("graphql").GraphQLSchema;
declare const authenticatedDirectiveTypeDefs: string, authenticatedDirectiveTransformer: (schema: import("graphql").GraphQLSchema) => import("graphql").GraphQLSchema;
export { authorizationDirectiveTypeDefs, authenticatedDirectiveTypeDefs, authorizationDirectiveTransformer, authenticatedDirectiveTransformer };
export declare const resolvers: {
    Query: {
        protectedData: (_: any, __: any, ___: any) => Promise<{
            id: string;
            value: string;
            sensitiveField: string;
        }>;
        publicData: (_: any, __: any, ___: any) => Promise<{
            id: string;
            info: string;
        }>;
        user: (_: any, args: {
            id: any;
        }, __: any) => Promise<{
            id: any;
            name: string;
            email: string;
            role: string;
        }>;
    };
    ProtectedData: {};
    User: {};
};
