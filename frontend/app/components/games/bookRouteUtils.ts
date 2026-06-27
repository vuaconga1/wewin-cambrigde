export function getPlayerIdKey(storagePrefix: string) {
  return `${storagePrefix}_player_id`;
}

export function getReloadFlagKey(storagePrefix: string) {
  return `${storagePrefix}_was_reloaded`;
}

export function getSessionFlagKey(storagePrefix: string) {
  return `${storagePrefix}_session_started`;
}

export function clearBookStorage(storagePrefix: string) {
  if (typeof window === "undefined") return;

  const keysToRemove: string[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;

    const genericProgress = key.startsWith("unit_") && key.endsWith("_progress");
    const prefixedProgress = key.startsWith(`${storagePrefix}_unit_`) && key.endsWith("_progress");
    const bookScopedKey =
      key === getPlayerIdKey(storagePrefix) ||
      key === getReloadFlagKey(storagePrefix) ||
      key === getSessionFlagKey(storagePrefix);

    if (genericProgress || prefixedProgress || bookScopedKey) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
  sessionStorage.removeItem(getReloadFlagKey(storagePrefix));
  sessionStorage.removeItem(getSessionFlagKey(storagePrefix));
}
