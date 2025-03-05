
export { authenticatedDirectiveTypeDefs, authenticatedDirectiveTransformer, authenticatedDirective } from './graphql/directives/authenticatedDirective.js'
export { authorizationDirectiveTypeDefs, authorizationDirectiveTransformer, authorizationDirective } from './graphql/directives/authorizationDirective.js'
export { rolesLoaderFor } from './loaders/roleLoader.js'
export { userLoaders } from './loaders/userLoader.js'
export { getUserRolesFromUsspService, getOrgRolesFromOrgService} from './loaders/loader.js'
export { authenticationMiddleware, } from './middleware/authn.js'
export { OpenSearchManager, OpenSearchManagerConfig, IndexDocument } from './utils/OpenSearchManager.js'

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

export { FilterInput, buildWhereClause } from './utils/listing-filter.js';
export { PaginationInput, buildPagination } from './utils/listing-pagination.js';
export { SortInput, buildSort } from './utils/listing-sort.js';