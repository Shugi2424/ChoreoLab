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
