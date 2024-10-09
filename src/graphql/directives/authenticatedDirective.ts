
import {
  defaultFieldResolver, 
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql'; 
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

export function authenticatedDirective(directiveName: string) {
  return {
    authenticatedDirectiveTypeDefs: `directive @${directiveName} on FIELD_DEFINITION | OBJECT | INTERFACE | SCALAR | ENUM`,
    authenticatedDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          const authDirective = getDirective(schema, type, directiveName)?.[0];
          if (authDirective) {
            if (type instanceof GraphQLObjectType) {
              const fields = type.getFields();
              Object.keys(fields).forEach((fieldName) => {
                const field = fields[fieldName];
                const { resolve = defaultFieldResolver } = field;
                field.resolve = async function (source, args, context, info) {
                  if (!context.user) {
                    throw new Error('Not authenticated');
                  }
                  return resolve(source, args, context, info);
                };
              });
            }
          }
          return type;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
          if (authDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;
            fieldConfig.resolve = async function (source, args, context, info) {
              if (!context.user) {
                throw new Error('Not authenticated');
              }
              return resolve(source, args, context, info);
            };
          }
          return fieldConfig;
        },
      }),
  };
}
