import { Element } from "../models/Element.js";

export const resolvers = {
  Query: {
    health: () => "ChoreoLab API is running",

    elements: async (_: unknown, { apparatus }: { apparatus?: string }) => {
      const filter = apparatus ? { apparatus } : {};
      const docs = await Element.find(filter).sort({ code: 1 });
      return docs.map(toGraphQLElement);
    },

    element: async (_: unknown, { id }: { id: string }) => {
      const doc = await Element.findById(id);
      return doc ? toGraphQLElement(doc) : null;
    },
  },
};

function toGraphQLElement(doc: {
  _id: { toString(): string };
  name: string;
  code: string;
  apparatus: string;
  category: string;
  difficulty: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    code: doc.code,
    apparatus: doc.apparatus,
    category: doc.category,
    difficulty: doc.difficulty,
    description: doc.description ?? null,
    createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}
