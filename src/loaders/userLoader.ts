// userLoaders.ts
import DataLoader from 'dataloader';
import { getProfilesByIDsFromUsspService } from './fetchers/userFetcher.js';

export function userLoaders() {
  return {
    profiles: new DataLoader<string, string[]>(async (profileIDs) => {
      const profileMap = await getProfilesByIDsFromUsspService([...profileIDs]);
      return profileIDs.map((id) => profileMap.get(id) || undefined);
    }), 
    users: new DataLoader<string, string[]>(async (userIDs) => {
      const userMap = await getProfilesByIDsFromUsspService([...userIDs]);
      return userIDs.map((id) => userMap.get(id) || undefined);
    }),
  };
}

const Loaders = { userLoaders };
  
export { Loaders };

