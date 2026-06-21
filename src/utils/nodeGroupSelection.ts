export const ALL_NODES_GROUP = "all";
export const LEGACY_ALL_NODES_GROUP = "_all_";

export function normalizeNodeSelectedGroup(
  selectedGroup: string | null | undefined,
  groups: readonly string[]
): string {
  if (
    !selectedGroup ||
    selectedGroup === ALL_NODES_GROUP ||
    selectedGroup === LEGACY_ALL_NODES_GROUP
  ) {
    return ALL_NODES_GROUP;
  }

  return groups.includes(selectedGroup) ? selectedGroup : ALL_NODES_GROUP;
}
