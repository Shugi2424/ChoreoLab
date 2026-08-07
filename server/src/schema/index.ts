import { authTypeDefs } from "./auth.js";
import { enumTypeDefs } from "./enums.js";
import { mutationTypeDefs } from "./mutation.js";
import { queryTypeDefs } from "./query.js";
import { routineTypeDefs } from "./routine.js";
import { objectTypeDefs } from "./types.js";

export const typeDefs = [
  enumTypeDefs,
  authTypeDefs,
  objectTypeDefs,
  routineTypeDefs,
  queryTypeDefs,
  mutationTypeDefs,
];
