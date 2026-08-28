// @vitest-environment jsdom
import { DndContext } from "@dnd-kit/core";
import { ThemeProvider } from "@mui/material";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimelinePanel } from "./TimelinePanel";
import { theme } from "../../theme/theme";
import type { Routine, RoutineItem } from "../../types/routine";

function renderTimelinePanel(
  timeline: RoutineItem[],
  localItemIds = timeline.map((item) => item.id),
) {
  const routine: Routine = {
    id: "routine-1",
    gymnastName: "Alex",
    apparatus: "hoop",
    ageCategory: "senior",
    dbScore: 1,
    daScore: 0.5,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    timeline,
    validation: {
      isValid: false,
      dbValid: false,
      daValid: true,
      artistryValid: true,
      missingRequirements: [],
      warnings: [],
      calculatedAt: "2026-01-01T00:00:00.000Z",
    },
  };

  return render(
    <ThemeProvider theme={theme}>
      <DndContext>
        <TimelinePanel
          routine={routine}
          selectedItemId={null}
          onSelectItem={vi.fn()}
          onRemoveItem={vi.fn()}
          onMoveItem={vi.fn()}
          localItemIds={localItemIds}
          dropInsertIndex={null}
          busy={false}
        />
      </DndContext>
    </ThemeProvider>,
  );
}

afterEach(() => {
  cleanup();
});

describe("TimelinePanel", () => {
  it("renders two-line body element labels with category", () => {
    renderTimelinePanel([
      {
        id: "item-1",
        type: "body_element",
        order: 0,
        bodyElement: {
          id: "be-1",
          name: "Split leap",
          category: "jump",
          value: 0.2,
        },
        bodyElementConfig: { value: 0.2 },
      },
    ]);

    expect(screen.getByText("1. Split leap")).toBeInTheDocument();
    expect(screen.getByText("Body element (DB) · Jump · 0.2")).toBeInTheDocument();
  });

  it("shows empty-state guidance when the timeline has no items", () => {
    renderTimelinePanel([]);

    expect(
      screen.getByText(/Drag body elements or artistry here/i),
    ).toBeInTheDocument();
  });
});
