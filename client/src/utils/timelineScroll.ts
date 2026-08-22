export interface TimelineScrollContainer {
  scrollTop: number;
  scrollHeight: number;
  querySelector(selector: string): { scrollIntoView: (options: ScrollIntoViewOptions) => void } | null;
}

export function applyTimelineScroll(
  container: TimelineScrollContainer,
  options: {
    scrollToEnd: boolean;
    scrollToItemId: string | null | undefined;
    sortedItemIds: readonly string[];
  },
): void {
  const lastItemId = options.sortedItemIds[options.sortedItemIds.length - 1];
  const shouldScrollToEnd =
    options.scrollToEnd ||
    (options.scrollToItemId != null && options.scrollToItemId === lastItemId);

  if (shouldScrollToEnd) {
    container.scrollTop = container.scrollHeight;
    return;
  }

  if (options.scrollToItemId) {
    const row = container.querySelector(
      `[data-timeline-item-id="${options.scrollToItemId}"]`,
    );
    row?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }
}
