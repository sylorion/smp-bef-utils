
import {
  defaultFieldResolver, 
  GraphQLSchema, 
  GraphQLObjectType, 
  GraphQLFieldResolver
} from 'graphql'; 
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

// Création d'une classe de base pour les exceptions personnalisées
class SMPError extends Error {
  code: string;
  extensions: Record<string, any>;
  constructor(message:string, code:string, extensions: Record<string, any> = {}) {
    super(message);
    this.extensions = extensions;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

function checkRolesForScopes(requiredRoles:string[][], requiredScopes: string[][], context: any) {
  const userRoles: Record<string, any[]> = context.user.roles || []; 
  if(userRoles && requiredRoles.length > 0 && requiredScopes.length > 0) return false;
  const isAuthorized = requiredRoles.some((roleArray: string[], index: number) => {
    const scopeArray: string[] = requiredScopes[index];
    if (!scopeArray) return false;
    console.log("scopeArray", scopeArray);
    console.log("roleArray", roleArray);
    console.log("userRoles", userRoles);
    
    //TODO: Next release should check the role title/name and not the legend associated to the role
    const hasScopesAndRoles = scopeArray.every((scope) => userRoles[scope].every((role) => roleArray.includes(role.legend)));
    return hasScopesAndRoles ;
  });
  return isAuthorized;
}

function createAuthResolver(
  resolve: GraphQLFieldResolver<any, any>,
  requiredRoles: string[][],
  requiredScopes: string[][],
  requiredAction: string
): GraphQLFieldResolver<any, any> {
  return async function (source, args, context, info) {
    if (!context.user) {
      const error = new SMPError('Not authenticated', "AUTH_USER_UNDEFINED", { path: info.path });
      return handleAuthFailure(context, requiredAction, error);
    }
    const isAuthorized = checkRolesForScopes(requiredRoles, requiredScopes, context);
    if (!isAuthorized) {
      const error = new SMPError('Not authorized user', "AUTH_USER_UNAUTHORIZED", { roles: requiredRoles, scopes: requiredScopes, path: info.path });
      return handleAuthFailure(context, requiredAction, error);
    }
    return resolve(source, args, context, info);
  };
}

function handleAuthFailure(context: any, action: string, error: Error) {
  context.errors = context.errors || [];
  context.errors.push(error);
  switch (action) {
    case 'INFO':
      context.logger(action.toLowerCase(), error.message);
      break;
    case 'WARN':
      context.logger(action.toLowerCase(), error.message);
      break;
    case 'THROW':
    default:
      throw error;
  }
  return null;
}


// Implémentation des directives @authorization et @authenticated
 export function authorizationDirective(directiveName: string) {
  return {
    authorizationDirectiveTypeDefs: `directive @${directiveName}(roles: [[SMPAuthzRole!]!]!, scopes: [[SMPAuthzScope!]!]! else: SMPAuthzFailure) on FIELD_DEFINITION | OBJECT | INTERFACE | SCALAR | ENUM`,
    authorizationDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          const authorizationDirective = getDirective(schema, type, directiveName)?.[0] || null;
          if (authorizationDirective) {
            const requiredRoles = authorizationDirective.roles;
            const requiredScopes = authorizationDirective.scopes;
            const requiredActions = authorizationDirective.else;
            if (type instanceof GraphQLObjectType) {
              const fields = type.getFields();
              Object.keys(fields).forEach((fieldName) => {
                let field = fields[fieldName];
                field.resolve = field.resolve || defaultFieldResolver;
                field.resolve = createAuthResolver(field.resolve, requiredRoles, requiredScopes, requiredActions);
              });
            }
          }
          return type;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const authorizationDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
          if (authorizationDirective) {
            const requiredRoles = authorizationDirective.roles;
            const requiredScopes = authorizationDirective.scopes;
            const requiredActions = authorizationDirective.else;
            fieldConfig.resolve = fieldConfig.resolve || defaultFieldResolver;
            fieldConfig.resolve = createAuthResolver(fieldConfig.resolve, requiredRoles, requiredScopes, requiredActions);
          }
          // Retourner la configuration du champ sans la modifier pour préserver les directives
          return fieldConfig;
        },
      }),
  };
}
