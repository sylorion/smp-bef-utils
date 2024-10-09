

import { GraphQLEnumType } from 'graphql'; 

export const SMPAuthzFailure = new GraphQLEnumType({
      description: 'Action to take on authorization failure',
      name: 'SMPAuthzFailure',
      values: {
        THROW: { value: 'THROW', description: 'Throw an error on authorization failure' },
        INFO: { value: 'INFO', description: 'Log an informational message on authorization failure' },
        WARN: { value: 'WARN', description: 'Log a warning on authorization failure' },
      },
    }) ;