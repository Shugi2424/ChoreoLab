export interface GraphQLContext {
  coachId: string | null;
}

export function createContext(): GraphQLContext {
  return { coachId: null };
}
