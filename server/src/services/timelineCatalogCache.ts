import { BodyElement } from "../models/BodyElement.js";
import { ArtistryComponent } from "../models/reference.js";
import type { ScoringTimelineEntry } from "../types/routineScoring.js";
import type { ValidationTimelineEntry } from "../utils/validation.js";

export interface TimelineCatalogMaps {
  bodyValueById: Map<string, number>;
  bodyCategoryById: Map<string, string>;
  artistryTypeById: Map<string, string>;
}

function collectBodyElementIds(
  timeline: readonly (ScoringTimelineEntry | ValidationTimelineEntry)[],
): string[] {
  return [
    ...new Set(
      timeline
        .filter((item) => item.type === "body_element" && item.bodyElementId)
        .map((item) => item.bodyElementId as string),
    ),
  ];
}

function collectArtistryIds(
  timeline: readonly (ScoringTimelineEntry | ValidationTimelineEntry)[],
): string[] {
  return [
    ...new Set(
      timeline
        .filter((item) => item.type === "artistry" && item.artistryComponentId)
        .map((item) => item.artistryComponentId as string),
    ),
  ];
}

export async function loadTimelineCatalogMaps(
  timeline: readonly (ScoringTimelineEntry | ValidationTimelineEntry)[],
): Promise<TimelineCatalogMaps> {
  const bodyElementIds = collectBodyElementIds(timeline);
  const artistryIds = collectArtistryIds(timeline);

  const [bodyElements, artistryComponents] = await Promise.all([
    bodyElementIds.length > 0
      ? BodyElement.find({ id: { $in: bodyElementIds } }).lean()
      : Promise.resolve([]),
    artistryIds.length > 0
      ? ArtistryComponent.find({ id: { $in: artistryIds } }).lean()
      : Promise.resolve([]),
  ]);

  return {
    bodyValueById: new Map(bodyElements.map((element) => [element.id, element.value])),
    bodyCategoryById: new Map(bodyElements.map((element) => [element.id, element.category])),
    artistryTypeById: new Map(
      artistryComponents.map((component) => [component.id, component.type]),
    ),
  };
}
