
import { gql } from 'graphql-request';
import { authenticatedDirective } from './graphql/directives/authenticatedDirective.js'
import { authorizationDirective } from './graphql/directives/authorizationDirective.js'
import { rolesLoaderFor } from './loaders/roleLoader.js'
import { userLoaders } from './loaders/userLoader.js'
export { getUserRolesFromUsspService, getOrgRolesFromOrgService} from './loaders/loader.js'
export { authenticationMiddleware, } from './middleware/authn.js'
export { rolesLoaderFor, userLoaders, authenticatedDirective, authorizationDirective } ;
export { OpenSearchManager, OpenSearchManagerConfig, IndexDocument } from './utils/OpenSearchManager.js'
import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from 'graphql-tools';  
import * as fs from 'fs';

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

// Application des directives au schéma
const { authorizationDirectiveTypeDefs, authorizationDirectiveTransformer } = authorizationDirective('authorization'); 
const { authenticatedDirectiveTypeDefs, authenticatedDirectiveTransformer } = authenticatedDirective('authenticated');

export { authorizationDirectiveTypeDefs, authenticatedDirectiveTypeDefs, authorizationDirectiveTransformer, authenticatedDirectiveTransformer };
export { FilterInput, buildWhereClause } from './utils/listing-filter.js';
export { PaginationInput, buildPagination } from './utils/listing-pagination.js';
export { SortInput, buildSort } from './utils/listing-sort.js';