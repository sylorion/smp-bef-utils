import { GraphQLSchema } from 'graphql';
export declare function authenticatedDirective(directiveName: string): {
    authenticatedDirectiveTypeDefs: string;
    authenticatedDirectiveTransformer: (schema: GraphQLSchema) => GraphQLSchema;
};
