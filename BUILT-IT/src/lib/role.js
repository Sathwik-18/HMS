// lib/role.js

// Define your roles here.  For now, simple strings.
export const USER_ROLES = {
    ADMIN: 'admin',
    STUDENT: 'student',
    GUARD: 'guard',
  };
  
  // Example utility function - you'll expand on this later
  export const checkUserRole = (user, allowedRoles) => {
    if (!user || !user.publicMetadata || !user.publicMetadata.role) {
      return false; // No user or role info
    }
    const userRole = user.publicMetadata.role;
    return allowedRoles.includes(userRole);
  };