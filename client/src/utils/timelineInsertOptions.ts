import type { RoutineItem } from "../types/routine";
import { getRoutineItemTimelinePrimary } from "../types/routine";
import type { InsertPositionOption } from "../components/routine/InsertPositionDialog";

export function buildTimelineInsertOptions(
  orderedItems: RoutineItem[],
): InsertPositionOption[] {
  const options: InsertPositionOption[] = [
    { label: "At the beginning", insertIndex: 0 },
  ];

  orderedItems.forEach((item, index) => {
    options.push({
      label: `After ${index + 1}. ${getRoutineItemTimelinePrimary(item)}`,
      insertIndex: index + 1,
    });
  });

  if (orderedItems.length === 0) {
    return [{ label: "At the end (empty timeline)", insertIndex: 0 }];
  }

  return options;
}
