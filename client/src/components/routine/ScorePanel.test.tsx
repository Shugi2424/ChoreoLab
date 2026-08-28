// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ScorePanel } from "./ScorePanel";
import { theme } from "../../theme/theme";
import type { Routine } from "../../types/routine";

function renderScorePanel(routine: Routine) {
  return render(
    <ThemeProvider theme={theme}>
      <ScorePanel routine={routine} />
    </ThemeProvider>,
  );
}

afterEach(() => {
  cleanup();
});

const baseRoutine: Routine = {
  id: "routine-1",
  gymnastName: "Alex",
  apparatus: "hoop",
  ageCategory: "senior",
  dbScore: 1.2,
  daScore: 0.8,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  timeline: [],
  validation: {
    isValid: false,
    dbValid: false,
    daValid: true,
    artistryValid: true,
    missingRequirements: [
      {
        id: "missing-balance",
        domain: "db",
        message: "Add a balance element.",
      },
    ],
    warnings: [
      {
        id: "under-max-risks",
        domain: "db",
        severity: "info",
        message: "You can add more risks.",
      },
    ],
    calculatedAt: "2026-01-01T00:00:00.000Z",
  },
};

describe("ScorePanel", () => {
  it("formats DB and DA scores with one decimal", () => {
    renderScorePanel(baseRoutine);
    expect(screen.getByText("1.2")).toBeInTheDocument();
    expect(screen.getByText("0.8")).toBeInTheDocument();
  });

  it("shows validation errors and info warnings", () => {
    renderScorePanel(baseRoutine);
    expect(screen.getByText("Add a balance element.")).toBeInTheDocument();
    expect(screen.getByText("You can add more risks.")).toBeInTheDocument();
  });

  it("shows success copy when the routine is valid", () => {
    renderScorePanel({
      ...baseRoutine,
      validation: {
        ...baseRoutine.validation,
        isValid: true,
        dbValid: true,
        missingRequirements: [],
        warnings: [],
        calculatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    expect(screen.getByText("Routine meets all CoP requirements.")).toBeInTheDocument();
  });
});
