// userFetcher.ts

import { gql, request } from 'graphql-request'; 
const USER_SERVICE_URL: string = process.env.SMP_USER_SPACE_SERVICE_URL ?? 'http://localhost:4000/graphql';

export interface UserDetail {
  userID: string;
  username?: string;
  email?: string;
  profile?: any; 
  [key: string]: any;
}

/**
 * Fetches user roles from the USSP service based on the provided user ID.
 *
 * @param {string} userID - The ID of the user whose roles are to be fetched.
 * @returns {Promise<Role[]>} A promise that resolves to an array of user roles.
 */
export const getProfileDetailsFromUsspService = async (profileID: string): Promise<any[]> => {
  const query = gql`
    query GetProfile($profileId: ID!) {
      profile(profileID: $profileId) {
        profileID
        uniqRef
        slug
        firstName
        lastName
        dateOfBirth
        gender
        nationality
        phoneNumber
        locationID
        idCardNumber
        passportNumber
        socialSecurityNumber
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const variables = {
    profileId: profileID
  };
  const response = await request(USER_SERVICE_URL, query, variables);
  return (response as any).profile;
}


/**
 * Fetches user roles from the USSP service based on the provided user ID.
 *
 * @param {string[]} profileIDs:  - The IDs of the profiles to retrieve.
 * @returns {Promise<Role[]>} A promise that resolves to an array of user roles.
 */
export const getProfilesByIDsFromUsspService = async (profileIDs: string[]): Promise<Map<string, any>> => {
  const query = gql`
    query GetProfilesIds($profileIDs: [ID!]!) {
      profilesByIDs(profileIDs: $profileIDs) {
        profileID
        uniqRef
        slug
        firstName
        lastName
        dateOfBirth
        gender
        nationality
        phoneNumber
        locationID
        idCardNumber
        passportNumber
        socialSecurityNumber
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;
  const variables = {
    profileIDs: profileIDs
  };

  const response = await request(USER_SERVICE_URL, query, variables);
      // Associer les utilisateurs avec leurs profils
      const userMap = new Map<string, any>();
      (response as any).profilesByIDs.forEach( (profile: any) => {
        userMap.set(profile.profileID, profile);
      });
  return userMap;
}
