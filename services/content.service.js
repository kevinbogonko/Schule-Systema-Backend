import { v4 as uuidv4 } from "uuid";

import {
  createContentReference,
  getSubtopicComplete,
  getContentReferenceByQdrantId,
} from "../services/postgres.service.js";

import {
  storeContent as storeQdrantContent,
  getContent as getQdrantContent,
  searchBySubtopic,
  searchContent as searchQdrantContent,
  deleteContent as deleteQdrantContent,
} from "../services/qdrant.service.js";

import { generateEmbedding } from "../services/embedding.service.js";

/* =========================
   Store content
========================= */

const storeContent = async (contentData) => {
  try {
    const { subtopic_id, content_type, title, content, description, metadata } =
      contentData;

    // Generate embedding
    const embedding = await generateEmbedding(content);

    // Generate Qdrant ID
    const qdrantId = uuidv4();

    // Auto-generate description
    const finalDescription =
      description ||
      (content.length > 500 ? content.substring(0, 497) + "..." : content);

    // Qdrant payload
    const payload = {
      subtopic_id,
      content_type,
      title,
      content,
      description: finalDescription,
      metadata: metadata || {},
      word_count: content.split(/\s+/).length,
      created_at: new Date().toISOString(),
    };

    // Store in Qdrant
    await storeQdrantContent(qdrantId, embedding, payload);

    // Store reference in PostgreSQL
    const postgresRef = await createContentReference({
      subtopic_id,
      content_type,
      title,
      description: finalDescription,
      qdrant_point_id: qdrantId,
      metadata: metadata || {},
    });

    return {
      postgres_id: postgresRef.id,
      qdrant_id: qdrantId,
      message: "Content stored successfully",
    };
  } catch (error) {
    console.error("Error storing content:", error);
    throw new Error(`Failed to store content: ${error.message}`);
  }
};

/* =========================
   Get subtopic content
========================= */

const getSubtopicContent = async (subtopicId, includeFullContent = false) => {
  try {
    const subtopicData = await getSubtopicComplete(subtopicId);

    if (!subtopicData) return null;

    if (includeFullContent && subtopicData.content_references.length > 0) {
      const enriched = [];

      for (const ref of subtopicData.content_references) {
        const qdrantData = await getQdrantContent(ref.qdrant_id);

        enriched.push(
          qdrantData
            ? {
                ...ref,
                full_content: qdrantData.payload.content,
                embedding_score: null,
              }
            : ref
        );
      }

      subtopicData.content_references = enriched;
    }

    return subtopicData;
  } catch (error) {
    console.error("Error getting subtopic content:", error);
    throw new Error(`Failed to get subtopic content: ${error.message}`);
  }
};

/* =========================
   Semantic search
========================= */

const searchContent = async (query, subtopicId = null, limit = 10) => {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const searchResults = subtopicId
      ? await searchBySubtopic(subtopicId, queryEmbedding, limit)
      : await searchQdrantContent(queryEmbedding, null, limit);

    const enrichedResults = [];

    for (const result of searchResults) {
      const postgresData = await getContentReferenceByQdrantId(result.id);

      if (!postgresData) continue;

      enrichedResults.push({
        score: result.score,
        qdrant_id: result.id,
        title: result.payload.title,
        content_preview: result.payload.content.substring(0, 200) + "...",
        full_content: result.score > 0.8 ? result.payload.content : null,
        subtopic: {
          id: postgresData.subtopic_id,
          name: postgresData.subtopic_name,
          code: postgresData.subtopic_code,
          subject_id: postgresData.subject_id,
          form: postgresData.form,
        },
        topic: postgresData.topic_name,
        subject: {
          id: postgresData.subject_id,
          name: postgresData.subject_name,
          init: postgresData.subject_init,
        },
        metadata: result.payload.metadata,
        created_at: result.payload.created_at,
      });
    }

    return enrichedResults;
  } catch (error) {
    console.error("Error searching content:", error);
    throw new Error(`Failed to search content: ${error.message}`);
  }
};

/* =========================
   Get single content item
========================= */

const getContentItem = async (qdrantId) => {
  try {
    const qdrantData = await getQdrantContent(qdrantId);
    if (!qdrantData) return null;

    const postgresData = await getContentReferenceByQdrantId(qdrantId);

    return {
      qdrant: {
        id: qdrantData.id,
        payload: qdrantData.payload,
      },
      postgres: postgresData,
    };
  } catch (error) {
    console.error("Error getting content item:", error);
    throw new Error(`Failed to get content item: ${error.message}`);
  }
};

/* =========================
   Delete content
========================= */

const deleteContent = async (qdrantId) => {
  try {
    await deleteQdrantContent(qdrantId);

    // PostgreSQL deletion handled via FK / cascade
    return {
      message: "Content deleted successfully",
      qdrant_id: qdrantId,
    };
  } catch (error) {
    console.error("Error deleting content:", error);
    throw new Error(`Failed to delete content: ${error.message}`);
  }
};

/* =========================
   Exports
========================= */

export {
  storeContent,
  getSubtopicContent,
  searchContent,
  getContentItem,
  deleteContent,
};
