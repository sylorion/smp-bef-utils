// userService.ts
export async function getUserRolesFromDB(userIds: string[]): Promise<Record<string, string[]>> {
    // Implement your database query here
    // Return a map of userId to roles array
    const rolesMap: Record<string, string[]> = {};
  
    // Example implementation
    for (const userId of userIds) {
      // Fetch roles for each userId
      rolesMap[userId] = await fetchRolesForUser(userId);
    }
  
    return rolesMap;
  }
  
  async function fetchRolesForUser(userId: string): Promise<string[]> {
    // Replace with actual DB call
    return ['USER', 'ADMIN']; // Example roles
  }

