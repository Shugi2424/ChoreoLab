import { mutationResolvers } from "./mutation.js";
import { queryResolvers } from "./query.js";

export const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
};
