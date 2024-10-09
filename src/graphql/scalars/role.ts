

import {
    GraphQLScalarType, 
  } from 'graphql'; 
  
export const SMPAuthzRole = new GraphQLScalarType({
      name: 'SMPAuthzRole',
      description: 'Rôle d’autorisation',
      serialize(value) {
        return value;
      },
      parseValue(value) {
        return value;
      },
      parseLiteral(ast) {
        return (ast as any).value;
      },
    });
  
    