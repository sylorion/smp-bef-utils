// userLoaders.ts
import DataLoader from 'dataloader';
import { getUserRolesFromDB } from './fetchers/userFetcher.js';

export function createUserLoaders() {
  return {
    userRoles: new DataLoader<string, string[]>(async (userIds) => {
      const rolesMap = await getUserRolesFromDB([...userIds]);
      return userIds.map((id) => rolesMap[id] || []);
    }),
  };
}

const Loaders = { createUserLoaders };
  
export { Loaders };

