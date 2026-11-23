export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export function validateAvatar(file) {
  if (!file.type.startsWith("image/")) return "Elige una imagen.";
  if (file.size > MAX_AVATAR_SIZE) return "Máximo 2 MB.";
  return null;
}

export function getInitial(owner) {
  return (owner.display_name || owner.username || "?")[0].toUpperCase();
}

export function buildAvatarPath(userId, fileName, now = Date.now()) {
  const ext = fileName.split(".").pop();
  return `${userId}/avatar-${now}.${ext}`;
}