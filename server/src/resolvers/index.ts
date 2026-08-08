import { mutationResolvers } from "./mutation.js";
import { queryResolvers } from "./query.js";
import { routineItemResolvers } from "./routine.js";

export const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  RoutineItem: routineItemResolvers,
};
