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

export function toGraphQLRoutine(doc: {
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
}) {
  return {
    id: doc._id.toString(),
    gymnastName: doc.gymnastName,
    apparatus: doc.apparatus,
    ageCategory: doc.ageCategory,
    timeline: [],
    dbScore: doc.dbScore,
    daScore: doc.daScore,
    validation: toGraphQLValidationResult(doc.validation),
    createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}
