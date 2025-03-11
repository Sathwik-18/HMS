export const USER_ROLES = {
    ADMIN: 'admin',
    STUDENT: 'student',
    GUARD: 'guard',
  };
  
  export const checkUserRole = (user, allowedRoles) => {
    if (!user || !user.publicMetadata || !user.publicMetadata.role) {
      return false; 
    }
    const userRole = user.publicMetadata.role;
    return allowedRoles.includes(userRole);
  };