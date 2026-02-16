import {client} from "../config/qdrant_connection.js";
import dotenv from "dotenv";

dotenv.config();

/* =========================
   Setup
========================= */

const collectionName = process.env.QDRANT_COLLECTION || "grade2_content";

/* =========================
   Collection operations
========================= */

const initCollection = async () => {
  try {
    const collections = await client.getCollections();

    const exists = collections.collections.some(
      (col) => col.name === collectionName
    );

    if (!exists) {
      await client.createCollection(collectionName, {
        vectors: {
          size: 384, // all-MiniLM-L6-v2
          distance: "Cosine",
        },
      });
      console.log(`Collection ${collectionName} created successfully`);
    } else {
      console.log(`Collection ${collectionName} already exists`);
    }

    return true;
  } catch (error) {
    console.error("Error initializing Qdrant collection:", error);
    throw error;
  }
};

/* =========================
   Content operations
========================= */

const storeContent = async (pointId, vector, payload) => {
  try {
    return await client.upsert(collectionName, {
      points: [
        {
          id: pointId,
          vector,
          payload,
        },
      ],
    });
  } catch (error) {
    console.error("Error storing content in Qdrant:", error);
    throw error;
  }
};

const getContent = async (qdrantId) => {
  try {
    const result = await client.retrieve(collectionName, {
      ids: [qdrantId],
      with_payload: true,
      with_vector: false,
    });

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error retrieving content from Qdrant:", error);
    throw error;
  }
};

const searchContent = async (vector, filter = null, limit = 10) => {
  try {
    const searchParams = {
      vector,
      limit,
      with_payload: true,
      with_vector: false,
    };

    if (filter) {
      searchParams.filter = filter;
    }

    return await client.search(collectionName, searchParams);
  } catch (error) {
    console.error("Error searching content in Qdrant:", error);
    throw error;
  }
};

const searchBySubtopic = async (subtopicId, queryVector, limit = 5) => {
  try {
    const filter = {
      must: [
        {
          key: "subtopic_id",
          match: { value: subtopicId },
        },
      ],
    };

    return await searchContent(queryVector, filter, limit);
  } catch (error) {
    console.error("Error searching by subtopic:", error);
    throw error;
  }
};

const deleteContent = async (qdrantId) => {
  try {
    return await client.delete(collectionName, {
      points: [qdrantId],
    });
  } catch (error) {
    console.error("Error deleting content from Qdrant:", error);
    throw error;
  }
};

const getCollectionInfo = async () => {
  try {
    return await client.getCollection(collectionName);
  } catch (error) {
    console.error("Error getting collection info:", error);
    throw error;
  }
};

/* =========================
   Exports
========================= */

export {
  initCollection,
  storeContent,
  getContent,
  searchContent,
  searchBySubtopic,
  deleteContent,
  getCollectionInfo,
};
