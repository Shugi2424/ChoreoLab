import { Types } from "mongoose";
import { BodyElement } from "../models/BodyElement.js";
import { Routine, type RoutineDocument } from "../models/Routine.js";
import type { RoutinePersistTarget } from "../types/routineScoring.js";
import { RCriteria, Rotation, ArtistryComponent } from "../models/reference.js";
import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from "../utils/errors.js";
import {
  calculateMasteryValue,
  validateMasteryInput,
  type MasteryInput,
} from "../utils/masteryValidation.js";
import {
  calculateRiskValue,
  normalizeRiskCriteriaIds,
  validateRiskComposition,
  type RiskInput,
  type RiskRotationInput,
} from "../utils/riskValidation.js";

import type { Apparatus } from "../types/enums.js";
import { toGraphQLRoutine } from "../utils/mappers.js";
import {
  calculatePivotValue,
  getPivotRotationRule,
  validatePivotTurnCount,
} from "../utils/pivotRotation.js";
import { applyDerivedRoutineFields } from "./routineDerivedFields.js";

export type { RiskInput, RiskRotationInput };

export interface AddRoutineItemInput {
  type: "body_element" | "risk" | "mastery" | "artistry";
  bodyElementId?: string;
  rotationCount?: number;
  risk?: RiskInput;
  mastery?: MasteryInput;
  artistryComponentId?: string;
}

export interface UpdateRoutineItemInput {
  bodyElementId?: string;
  rotationCount?: number;
  risk?: RiskInput;
  mastery?: MasteryInput;
  artistryComponentId?: string;
}

async function getRoutineDocForCoach(id: string, coachId: string) {
  const routine = await Routine.findById(id);
  if (!routine) {
    throw new NotFoundError("Routine not found");
  }
  if (routine.coach.toString() !== coachId) {
    throw new ForbiddenError();
  }
  return routine;
}

function renormalizeOrder(timeline: RoutineDocument["timeline"]) {
  timeline.forEach((item, index) => {
    (item as { order: number }).order = index;
  });
}

async function validateBodyElementId(id: string) {
  const element = await BodyElement.findOne({ id }).lean();
  if (!element) {
    throw new UserInputError("Body element not found.");
  }
  return element;
}

async function validateArtistryComponentId(id: string) {
  const component = await ArtistryComponent.findOne({ id }).lean();
  if (!component) {
    throw new UserInputError("Artistry component not found.");
  }
  return component;
}

async function buildBodyElementPayload(bodyElementId: string, rotationCount?: number) {
  const element = await validateBodyElementId(bodyElementId);

  if (element.category === "pivot") {
    const count = rotationCount ?? 1;
    if (!Number.isInteger(count) || count < 1) {
      throw new UserInputError("rotationCount must be at least 1 for pivot elements.");
    }

    const rule = getPivotRotationRule(element.id, element.value);
    const turnError = validatePivotTurnCount(rule, count);
    if (turnError) {
      throw new UserInputError(turnError);
    }

    const value = calculatePivotValue(element.value, rule, count);
    return {
      bodyElementId,
      bodyElementConfig: {
        rotationCount: count,
        value,
      },
    };
  }

  if (rotationCount != null && rotationCount !== 1) {
    throw new UserInputError("rotationCount applies only to pivot body elements.");
  }

  return {
    bodyElementId,
    bodyElementConfig: {
      value: element.value,
    },
  };
}

async function buildRiskPayload(input: RiskInput, apparatus: string) {
  const criteriaIds = normalizeRiskCriteriaIds(input.criteriaIds ?? []);
  const rotations = input.rotations ?? [];

  validateRiskComposition({ criteriaIds, rotations });

  const criteria = await RCriteria.find({ id: { $in: criteriaIds } }).lean();
  if (criteria.length !== criteriaIds.length) {
    throw new UserInputError("One or more risk criteria were not found.");
  }

  for (const criterion of criteria) {
    if (!criterion.apparatuses.includes(apparatus as Apparatus)) {
      throw new UserInputError(
        `Risk criterion "${criterion.name}" is not valid for this apparatus.`,
      );
    }
  }

  const rotationIds = rotations.map((r) => r.rotationId);
  const uniqueRotationIds = [...new Set(rotationIds)];
  const rotationDocs = await Rotation.find({ id: { $in: uniqueRotationIds } }).lean();
  if (rotationDocs.length !== uniqueRotationIds.length) {
    throw new UserInputError("One or more rotations were not found.");
  }

  const criteriaValueMap = new Map(criteria.map((c) => [c.id, c.value]));
  const totalRotationCount = rotations.reduce((sum, r) => sum + r.count, 0);
  const value = calculateRiskValue(criteriaIds, criteriaValueMap, totalRotationCount);

  return {
    criteriaIds,
    rotations: rotations.map((r) => ({
      rotationId: r.rotationId,
      count: r.count,
    })),
    value,
  };
}

async function buildMasteryPayload(input: MasteryInput, apparatus: string) {
  const validated = await validateMasteryInput(input, apparatus);
  let isAcro = false;

  if (validated.rotationId) {
    const rotation = await Rotation.findOne({ id: validated.rotationId }).lean();
    if (!rotation) {
      throw new UserInputError("Rotation not found.");
    }
    isAcro = rotation.group.startsWith("acro-");
  }

  const value = await calculateMasteryValue(validated.baseIds, validated.criteriaIds);

  return {
    baseIds: validated.baseIds,
    criteriaIds: validated.criteriaIds,
    rotationId: validated.rotationId,
    value,
    isAcro,
  };
}

async function buildTimelineItem(
  input: AddRoutineItemInput,
  order: number,
  apparatus: string,
) {
  const base = {
    type: input.type,
    order,
  };

  switch (input.type) {
    case "body_element": {
      if (!input.bodyElementId) {
        throw new UserInputError("bodyElementId is required for body elements.");
      }
      const bodyPayload = await buildBodyElementPayload(
        input.bodyElementId,
        input.rotationCount,
      );
      return { ...base, ...bodyPayload };
    }
    case "artistry": {
      if (!input.artistryComponentId) {
        throw new UserInputError(
          "artistryComponentId is required for artistry items.",
        );
      }
      await validateArtistryComponentId(input.artistryComponentId);
      return { ...base, artistryComponentId: input.artistryComponentId };
    }
    case "risk": {
      if (!input.risk) {
        throw new UserInputError("risk input is required for risk items.");
      }
      const risk = await buildRiskPayload(input.risk, apparatus);
      return { ...base, risk };
    }
    case "mastery": {
      if (!input.mastery) {
        throw new UserInputError("mastery input is required for mastery items.");
      }
      const mastery = await buildMasteryPayload(input.mastery, apparatus);
      return { ...base, mastery };
    }
    default:
      throw new UserInputError("Invalid routine item type.");
  }
}

function findTimelineItem(routine: RoutineDocument, itemId: string) {
  const item = routine.timeline.find(
    (entry) => (entry as { _id?: Types.ObjectId })._id?.toString() === itemId,
  );
  if (!item) {
    throw new NotFoundError("Timeline item not found");
  }
  return item;
}

type RoutineDoc = NonNullable<Awaited<ReturnType<typeof getRoutineDocForCoach>>>;

async function persistRoutine(routine: RoutineDoc) {
  const persistTarget = routine as unknown as RoutinePersistTarget;
  await applyDerivedRoutineFields(persistTarget);
  routine.markModified("validation");
  routine.markModified("dbScore");
  routine.markModified("daScore");
  await routine.save();
  return toGraphQLRoutine(routine.toObject());
}

export const routineTimelineService = {
  async addItem(
    coachId: string,
    routineId: string,
    input: AddRoutineItemInput,
    insertIndex?: number,
  ) {
    const routine = await getRoutineDocForCoach(routineId, coachId);
    const index = insertIndex ?? routine.timeline.length;
    if (index < 0 || index > routine.timeline.length) {
      throw new UserInputError("Invalid insert position.");
    }
    const item = await buildTimelineItem(input, index, routine.apparatus);
    routine.timeline.splice(index, 0, item);
    renormalizeOrder(routine.timeline);
    routine.markModified("timeline");
    return persistRoutine(routine);
  },

  async removeItem(coachId: string, routineId: string, itemId: string) {
    const routine = await getRoutineDocForCoach(routineId, coachId);
    const index = routine.timeline.findIndex(
      (entry) => (entry as { _id?: Types.ObjectId })._id?.toString() === itemId,
    );
    if (index === -1) {
      throw new NotFoundError("Timeline item not found");
    }
    routine.timeline.splice(index, 1);
    renormalizeOrder(routine.timeline);
    return persistRoutine(routine);
  },

  async reorderItems(coachId: string, routineId: string, itemIds: string[]) {
    const routine = await getRoutineDocForCoach(routineId, coachId);

    if (itemIds.length !== routine.timeline.length) {
      throw new UserInputError("Item list must include every timeline item.");
    }

    const timelineIds = new Set(
      routine.timeline.map((entry) =>
        (entry as { _id: Types.ObjectId })._id.toString(),
      ),
    );

    for (const id of itemIds) {
      if (!timelineIds.has(id)) {
        throw new UserInputError("Invalid timeline item id in reorder list.");
      }
    }

    const orderMap = new Map(itemIds.map((id, index) => [id, index]));

    for (const entry of routine.timeline) {
      const timelineEntry = entry as { _id: Types.ObjectId; order: number };
      const nextOrder = orderMap.get(timelineEntry._id.toString());
      if (nextOrder === undefined) {
        throw new UserInputError("Invalid timeline item id in reorder list.");
      }
      timelineEntry.order = nextOrder;
    }

    routine.timeline.sort(
      (a, b) => (a as { order: number }).order - (b as { order: number }).order,
    );
    routine.markModified("timeline");
    return persistRoutine(routine);
  },

  async updateItem(
    coachId: string,
    routineId: string,
    itemId: string,
    input: UpdateRoutineItemInput,
  ) {
    const routine = await getRoutineDocForCoach(routineId, coachId);
    const item = findTimelineItem(routine, itemId) as {
      type: string;
      bodyElementId?: string;
      bodyElementConfig?: { rotationCount?: number; value: number };
      risk?: RiskInput;
      mastery?: MasteryInput;
      artistryComponentId?: string;
    };

    switch (item.type) {
      case "body_element": {
        const bodyElementId = input.bodyElementId ?? item.bodyElementId;
        if (!bodyElementId) {
          throw new UserInputError("bodyElementId is required.");
        }
        const rotationCount =
          input.rotationCount ?? item.bodyElementConfig?.rotationCount;
        const bodyPayload = await buildBodyElementPayload(bodyElementId, rotationCount);
        item.bodyElementId = bodyPayload.bodyElementId;
        item.bodyElementConfig = bodyPayload.bodyElementConfig;
        break;
      }
      case "artistry": {
        if (!input.artistryComponentId) {
          throw new UserInputError("artistryComponentId is required.");
        }
        await validateArtistryComponentId(input.artistryComponentId);
        item.artistryComponentId = input.artistryComponentId;
        break;
      }
      case "risk": {
        if (!input.risk) {
          throw new UserInputError("risk input is required.");
        }
        item.risk = await buildRiskPayload(input.risk, routine.apparatus);
        break;
      }
      case "mastery": {
        if (!input.mastery) {
          throw new UserInputError("mastery input is required.");
        }
        item.mastery = await buildMasteryPayload(input.mastery, routine.apparatus);
        break;
      }
      default:
        throw new UserInputError("Invalid routine item type.");
    }

    return persistRoutine(routine);
  },
};
