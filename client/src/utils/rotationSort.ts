export function rotationGroupRank(group: string): number {
  if (group === "v1") {
    return 0;
  }
  if (group === "v2") {
    return 1;
  }
  if (group === "v3") {
    return 2;
  }
  const acroMatch = /^acro-(\d+)$/.exec(group);
  if (acroMatch) {
    return 10 + Number.parseInt(acroMatch[1], 10);
  }
  return 100;
}

export function sortRotations<T extends { name: string; group: string }>(
  rotations: readonly T[],
): T[] {
  return [...rotations].sort((a, b) => {
    const byGroup = rotationGroupRank(a.group) - rotationGroupRank(b.group);
    if (byGroup !== 0) {
      return byGroup;
    }
    return a.name.localeCompare(b.name);
  });
}
