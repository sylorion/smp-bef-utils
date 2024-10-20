

import { authenticatedDirective } from './graphql/directives/authenticatedDirective.js'
import { authorizationDirective } from './graphql/directives/authorizationDirective.js'
import { rolesLoaderFor } from './loaders/roleLoader.js'
import { userLoaders } from './loaders/userLoader.js'
export { rolesLoaderFor, userLoaders, authenticatedDirective, authorizationDirective } ;

// Application des directives au schéma
const { authorizationDirectiveTypeDefs, authorizationDirectiveTransformer } = authorizationDirective('authorization'); 
const { authenticatedDirectiveTypeDefs, authenticatedDirectiveTransformer } = authenticatedDirective('authenticated');

export { authorizationDirectiveTypeDefs, authenticatedDirectiveTypeDefs, authorizationDirectiveTransformer, authenticatedDirectiveTransformer };