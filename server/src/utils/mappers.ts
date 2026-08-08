export function toGraphQLBodyElement(doc: {
  id: string;
  name: string;
  category: string;
  value: number;
}) {
  return {
    id: doc.id,
    name: doc.name,
    category: doc.category,
    value: doc.value,
  };
}

export function toGraphQLRequirement(doc: {
  id: string;
  ageCategory: string;
  DB: {
    minElements: number;
    maxElements: number;
    requiredElements: string[];
    maxRisks: number;
  };
  DA: {
    minMasteries: number;
    maxMasteries: number;
    maxAcrobatics: number;
  };
  A: {
    minCharacterMoves: number;
    minDanceSteps: number;
    minDynamicEffects: number;
  };
}) {
  return {
    id: doc.id,
    ageCategory: doc.ageCategory,
    DB: doc.DB,
    DA: doc.DA,
    A: doc.A,
  };
}

export function toGraphQLDACriteria(doc: { id: string; name: string }) {
  return { id: doc.id, name: doc.name };
}

export function toGraphQLBase(doc: {
  id: string;
  name: string;
  value: number;
  apparatuses: string[];
  allowedCriteria: string[];
}) {
  return {
    id: doc.id,
    name: doc.name,
    value: doc.value,
    apparatuses: doc.apparatuses,
    allowedCriteria: doc.allowedCriteria,
  };
}

export function toGraphQLRCriteria(doc: {
  id: string;
  name: string;
  type: string;
  value: number;
  apparatuses: string[];
}) {
  return {
    id: doc.id,
    name: doc.name,
    type: doc.type,
    value: doc.value,
    apparatuses: doc.apparatuses,
  };
}

export function toGraphQLRotation(doc: { id: string; name: string; group: string }) {
  return {
    id: doc.id,
    name: doc.name,
    group: doc.group,
  };
}

export function toGraphQLArtistryComponent(doc: {
  id: string;
  name: string;
  type: string;
}) {
  return {
    id: doc.id,
    name: doc.name,
    type: doc.type,
  };
}

export function toGraphQLCoach(doc: {
  _id: { toString(): string };
  email: string;
  firstName: string;
  lastName: string;
  club?: string | null;
  createdAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    email: doc.email,
    firstName: doc.firstName,
    lastName: doc.lastName,
    club: doc.club ?? null,
    createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

export function toGraphQLValidationResult(doc: {
  isValid: boolean;
  dbValid: boolean;
  daValid: boolean;
  artistryValid: boolean;
  missingRequirements: Array<{
    id: string;
    domain: string;
    message: string;
  }>;
  calculatedAt?: Date;
}) {
  return {
    isValid: doc.isValid,
    dbValid: doc.dbValid,
    daValid: doc.daValid,
    artistryValid: doc.artistryValid,
    missingRequirements: doc.missingRequirements.map((item) => ({
      id: item.id,
      domain: item.domain,
      message: item.message,
    })),
    calculatedAt: doc.calculatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

export function toGraphQLRoutineItem(item: unknown) {
  const entry = item as {
    _id: { toString(): string };
    type: string;
    order: number;
    bodyElementId?: string | null;
    risk?: {
      criteriaIds: string[];
      rotations: Array<{ rotationId: string; count: number }>;
      bodyElementId?: string | null;
      value: number;
    } | null;
    mastery?: {
      baseIds: string[];
      criteriaIds: string[];
      rotationId?: string | null;
      value: number;
      isAcro: boolean;
    } | null;
    artistryComponentId?: string | null;
  };

  return {
    id: entry._id.toString(),
    type: entry.type,
    order: entry.order,
    bodyElementId: entry.bodyElementId ?? null,
    risk: entry.risk ?? null,
    mastery: entry.mastery ?? null,
    artistryComponentId: entry.artistryComponentId ?? null,
  };
}

export function toGraphQLRoutine(doc: unknown) {
  const routine = doc as {
    _id: { toString(): string };
    gymnastName: string;
    apparatus: string;
    ageCategory: string;
    timeline?: unknown[];
    dbScore: number;
    daScore: number;
    validation: {
      isValid: boolean;
      dbValid: boolean;
      daValid: boolean;
      artistryValid: boolean;
      missingRequirements: Array<{
        id: string;
        domain: string;
        message: string;
      }>;
      calculatedAt?: Date;
    };
    createdAt?: Date;
    updatedAt?: Date;
  };

  return {
    id: routine._id.toString(),
    gymnastName: routine.gymnastName,
    apparatus: routine.apparatus,
    ageCategory: routine.ageCategory,
    timeline: (routine.timeline ?? []).map((item) =>
      toGraphQLRoutineItem(item as Parameters<typeof toGraphQLRoutineItem>[0]),
    ),
    dbScore: routine.dbScore,
    daScore: routine.daScore,
    validation: toGraphQLValidationResult(routine.validation),
    createdAt: routine.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: routine.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}
