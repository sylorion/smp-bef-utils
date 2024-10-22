
import { gql } from 'graphql-request';
import { authenticatedDirective } from './graphql/directives/authenticatedDirective.js'
import { authorizationDirective } from './graphql/directives/authorizationDirective.js'
import { rolesLoaderFor } from './loaders/roleLoader.js'
import { userLoaders } from './loaders/userLoader.js'
export { authenticationMiddleware, getUserRolesFromUsspService, getOrgRolesFromOrgService} from './loaders/loader.js'
export { rolesLoaderFor, userLoaders, authenticatedDirective, authorizationDirective } ;

import { ApolloServer } from 'apollo-server';
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

const authorization = authorizationDirective("authorization");

export const resolvers = {
  Query: {
    protectedData: async (_: any, __: any, ___: any) => {
      return { id: '1', value: 'Sensitive Data', sensitiveField: 'Secret Data' };
    },
    publicData: async (_: any, __: any, ___: any) => {
      return { id: '2', info: 'Public Information' };
    },
    user: async (_: any, args: { id: any; }, __: any) => {
      // Fetch user data based on args.id
      return {
        id: args.id,
        name: 'User Name',
        email: 'user@example.com',
        role: 'Client',
      };
    },
  },
  ProtectedData: {
    // Field-level resolvers if needed
  },
  User: {
    // Field-level resolvers if needed
  },
};

const typesDefs = gql`
${authorization.authorizationDirectiveTypeDefs}
scalar SMPAuthzRole 
scalar SMPAuthzScope 
scalar Role

enum SMPAuthzFailure {
  THROW
  INFO
  WARN 
}

type Query {
  protectedData: ProtectedData @authorization(roles: [["Client"]], scopes: [["ORG"]] else: THROW) 
  user(id: ID!): User 
  publicData: PublicData
}

type ProtectedData {
  id: ID!
  value: String!
  sensitiveField: String @authorization(roles: [["Admin"]], scopes: [["SMP"]] else: THROW)
}

type User {
  id: ID!
  name: String!
  email: String 
  role: Role!
}

type PublicData {
  id: ID!
  info: String!
}
`;


// const typesArray = [
//   authorization.authorizationDirectiveTypeDefs,
//   typesDefs,
// ];

// // // Build the typeDefs from files defined types
// const typeDefs = mergeTypeDefs(typesArray);


const schema = makeExecutableSchema({
  typeDefs: typesDefs,
  resolvers,
});

// Application des directives au schéma
const schemaWithDirectives = authorization.authorizationDirectiveTransformer(authenticatedDirectiveTransformer(schema)) ?? undefined;

const getUserFromToken = (token: string): User | null => {
  try {
    if (token) {
      return { id: '3', name: 'User Name', email: "some@smp.ceo", role: 'Client' } as User;
    }
    return null;
  } catch (err) {
    return null;
  }
};

const server = new ApolloServer({
  schema: schemaWithDirectives,
  context: ({ req }): GraphQLContext => {
    const token = req.headers.authorization || '';
    const user = getUserFromToken(token.replace('Bearer ', '')) ?? undefined;
    return { user  };
  },
});

// server.listen().then(({ url }) => {
//   console.log(`🚀 Server ready at ${url}`);
// });

