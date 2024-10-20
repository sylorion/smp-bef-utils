import { GraphQLSchema } from 'graphql';
export declare function authorizationDirective(directiveName: string): {
    authorizationDirectiveTypeDefs: string;
    authorizationDirectiveTransformer: (schema: GraphQLSchema) => GraphQLSchema;
};
