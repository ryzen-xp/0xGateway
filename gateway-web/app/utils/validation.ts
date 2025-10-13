/**
 * Username validation utility
 * ----------------------------
 * Rules:
 *  - 4–20 characters
 *  - Only letters (a–z, A–Z), numbers (0–9), and underscores (_)
 *  - No spaces or special symbols
 */

export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
  return usernameRegex.test(username);
}

/**
 * Returns an error message if invalid, or null if valid.
 * Useful for displaying specific validation feedback.
 */
export function getUsernameError(username: string): string | null {
  if (!username || username.trim().length === 0)
    return "Username cannot be empty.";

  if (username.length < 4)
    return "Username must be at least 4 characters long.";

  if (username.length > 20) return "Username cannot exceed 20 characters.";

  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return "Only letters, numbers, and underscores are allowed.";

  return null;
}
