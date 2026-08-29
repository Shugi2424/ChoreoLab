import { ApolloServer } from "@apollo/server";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { clearAuthRateLimits } from "../middleware/authRateLimit.js";
import { Coach } from "../models/Coach.js";
import { resolvers } from "../resolvers/index.js";
import { routineService } from "../services/routineService.js";
import { clearRequirementsCache } from "../services/requirementsCache.js";
import { typeDefs } from "../schema/index.js";
import { signToken } from "../utils/jwt.js";
import { hashPassword } from "../utils/password.js";
import {
  clearIntegrationCollections,
  connectIntegrationDb,
  disconnectIntegrationDb,
} from "../test/integration/mongoMemory.js";
import { seedIntegrationReferenceData } from "../test/integration/seedReferenceData.js";
import { buildIntegrationContext, TEST_JWT_SECRET } from "../test/integration/testContext.js";

let server: ApolloServer | undefined;

async function createCoach(email: string) {
  return Coach.create({
    email,
    passwordHash: await hashPassword("coach1234"),
    firstName: "GraphQL",
    lastName: "Coach",
  });
}

function getSingleResult(response: Awaited<ReturnType<ApolloServer["executeOperation"]>>) {
  expect(response.body.kind).toBe("single");
  if (response.body.kind !== "single") {
    throw new Error("Expected single GraphQL result");
  }
  return response.body.singleResult;
}

describe("GraphQL integration", () => {
  beforeAll(async () => {
    await connectIntegrationDb();
    server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
    await disconnectIntegrationDb();
  });

  beforeEach(async () => {
    clearRequirementsCache();
    clearAuthRateLimits();
    await clearIntegrationCollections();
    await seedIntegrationReferenceData();
  });

  it("rejects protected mutations without a JWT", async () => {
    const response = await server.executeOperation(
      {
        query: `
          mutation CreateRoutine($input: CreateRoutineInput!) {
            createRoutine(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            gymnastName: "Alex",
            apparatus: "hoop",
            ageCategory: "senior",
          },
        },
      },
      { contextValue: buildIntegrationContext(null) },
    );

    const result = getSingleResult(response);
    expect(result.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("rejects protected queries with an invalid JWT", async () => {
    const response = await server.executeOperation(
      {
        query: `
          query Routines {
            routines {
              id
            }
          }
        `,
      },
      { contextValue: buildIntegrationContext(null) },
    );

    const result = getSingleResult(response);
    expect(result.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("creates a routine for an authenticated coach", async () => {
    const coach = await createCoach("graphql-create@test.com");
    const token = signToken(coach._id.toString(), TEST_JWT_SECRET);

    const response = await server.executeOperation(
      {
        query: `
          mutation CreateRoutine($input: CreateRoutineInput!) {
            createRoutine(input: $input) {
              id
              gymnastName
              dbScore
            }
          }
        `,
        variables: {
          input: {
            gymnastName: "Alex",
            apparatus: "hoop",
            ageCategory: "senior",
          },
        },
      },
      {
        contextValue: buildIntegrationContext(coach._id.toString()),
      },
    );

    const result = getSingleResult(response);
    expect(result.errors).toBeUndefined();
    expect(result.data?.createRoutine).toMatchObject({
      gymnastName: "Alex",
      dbScore: 0,
    });
    expect(token).toBeTruthy();
  });

  it("forbids access to another coach's routine", async () => {
    const owner = await createCoach("owner@test.com");
    const other = await createCoach("other@test.com");
    const routine = await routineService.create(owner._id.toString(), {
      gymnastName: "Private",
      apparatus: "hoop",
      ageCategory: "senior",
    });

    const response = await server.executeOperation(
      {
        query: `
          query Routine($id: ID!) {
            routine(id: $id) {
              id
              gymnastName
            }
          }
        `,
        variables: { id: routine.id },
      },
      { contextValue: buildIntegrationContext(other._id.toString()) },
    );

    const result = getSingleResult(response);
    expect(result.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
  });
});
