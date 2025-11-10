// ✅ Role levels – easily extendable and consistent
const rolesHierarchy = {
  admin: 3,
  instructor: 2,
  student: 1,
  guest: 0
};

/**
 * ✅ Role-Based Access Control Middleware
 * @param {string[]} allowedRoles - Roles allowed to access the route
 * @returns Express middleware
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    const user = req.user;

    // 🚫 No user or no role
    if (!user || !user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No authenticated user or missing role"
      });
    }

    // 🔐 Determine user level
    const userRoleLevel = rolesHierarchy[user.role] ?? -1;

    // ✅ Check if user meets or exceeds any allowed role level
    const isAuthorized = allowedRoles.some(role => {
      const requiredLevel = rolesHierarchy[role] ?? -1;
      return userRoleLevel >= requiredLevel;
    });

    // 🚫 Not authorized
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the roles: [${allowedRoles.join(", ")}]`
      });
    }

    // ✅ Proceed
    next();
  };
};
