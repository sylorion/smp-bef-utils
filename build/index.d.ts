import { authenticatedDirective } from './graphql/directives/authenticatedDirective.js';
import { authorizationDirective } from './graphql/directives/authorizationDirective.js';
import { rolesLoaderFor } from './loaders/roleLoader.js';
import { createUserLoaders } from './loaders/userLoader.js';
export { rolesLoaderFor, createUserLoaders, authenticatedDirective, authorizationDirective };
declare const authorizationDirectiveTypeDefs: string, authorizationDirectiveTransformer: (schema: import("graphql").GraphQLSchema) => import("graphql").GraphQLSchema;
declare const authenticatedDirectiveTypeDefs: string, authenticatedDirectiveTransformer: (schema: import("graphql").GraphQLSchema) => import("graphql").GraphQLSchema;
export { authorizationDirectiveTypeDefs, authenticatedDirectiveTypeDefs, authorizationDirectiveTransformer, authenticatedDirectiveTransformer };
