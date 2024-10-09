

import { authenticatedDirective } from './graphql/directives/authenticatedDirective.js'
import { authorizationDirective } from './graphql/directives/authorizationDirective.js'
export { authenticatedDirective, authorizationDirective } ;

// Application des directives au schéma
const { authorizationDirectiveTypeDefs, authorizationDirectiveTransformer } = authorizationDirective('authorization'); 
const { authenticatedDirectiveTypeDefs, authenticatedDirectiveTransformer } = authenticatedDirective('authenticated');

export { authorizationDirectiveTypeDefs, authenticatedDirectiveTypeDefs, authorizationDirectiveTransformer, authenticatedDirectiveTransformer };