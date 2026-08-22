import { describe, expect, it, vi } from "vitest";
import { applyTimelineScroll } from "./timelineScroll.js";

describe("applyTimelineScroll", () => {
  it("scrolls to scrollHeight when scrollToEnd is true", () => {
    const container = {
      scrollTop: 0,
      scrollHeight: 840,
      querySelector: vi.fn(() => null),
    };

    applyTimelineScroll(container, {
      scrollToEnd: true,
      scrollToItemId: "item-3",
      sortedItemIds: ["item-1", "item-2", "item-3"],
    });

    expect(container.scrollTop).toBe(840);
    expect(container.querySelector).not.toHaveBeenCalled();
  });

  it("scrolls to end when scrollToItemId is the last timeline item", () => {
    const container = {
      scrollTop: 12,
      scrollHeight: 620,
      querySelector: vi.fn(() => null),
    };

    applyTimelineScroll(container, {
      scrollToEnd: false,
      scrollToItemId: "item-3",
      sortedItemIds: ["item-1", "item-2", "item-3"],
    });

    expect(container.scrollTop).toBe(620);
  });

  it("scrolls a middle item into view instead of jumping to the end", () => {
    const scrollIntoView = vi.fn();
    const container = {
      scrollTop: 0,
      scrollHeight: 620,
      querySelector: vi.fn(() => ({ scrollIntoView })),
    };

    applyTimelineScroll(container, {
      scrollToEnd: false,
      scrollToItemId: "item-2",
      sortedItemIds: ["item-1", "item-2", "item-3"],
    });

    expect(container.scrollTop).toBe(0);
    expect(container.querySelector).toHaveBeenCalledWith('[data-timeline-item-id="item-2"]');
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest", behavior: "auto" });
  });
});
