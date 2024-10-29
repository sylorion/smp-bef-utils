import { GraphQLScalarType, } from 'graphql';
import NodeCache from 'node-cache';
const permissionCache = new NodeCache({ stdTTL: 300 }); // Cache TTL of 10 minutes
export const SMPAuthzScope = new GraphQLScalarType({
    name: 'SMPAuthzScope',
    description: 'Scope d’autorisation',
    serialize(value) {
        return value;
    },
    parseValue(value) {
        return value;
    },
    parseLiteral(ast) {
        return ast.value;
    }
});
