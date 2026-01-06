import { client } from "../../../config/qdrant_connection.js";
import { createError } from "../../../utils/ErrorHandler.js";

/**
 * Utility: Validate JSON request
 */
const validateJson = (req, next) => {
  if (!req.is("application/json")) {
    return next(
      createError(415, "Unsupported Media Type: Expected application/json")
    );
  }
};

/**
 * CREATE COLLECTION
 */
export const createCollection = async (req, res, next) => {
  validateJson(req, next);

  try {
    const { name, size, distance = "Cosine" } = req.body;

    if (!name || !size) {
      return next(
        createError(400, "Collection 'name' and 'size' are required")
      );
    }

    await client.createCollection(name, {
      vectors: { size, distance },
    });

    return res
      .status(201)
      .json({ success: true, message: "Collection created successfully" });
  } catch (error) {
    return next(error);
  }
};

/**
 * 
 * UPSERT VECTORS
 */
export const upsertCollection = async (req, res, next) => {
  validateJson(req, next);

  try {
    const { collection, points } = req.body;

    if (!collection || !Array.isArray(points)) {
      return next(
        createError(400, "'collection' and an array of 'points' are required")
      );
    }

    // const testEmbed = Array.from({ length : 1536}, ()=> Math.random())
    // console.log(testEmbed);
    // res.json(testEmbed)

    await client.upsert(collection, { points });

    return res.status(200).json({
      success: true,
      message: "Points inserted or updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * SEARCH VECTOR
 */
export const searchCollection = async (req, res, next) => {
  validateJson(req, next);

  try {
    const { collection, vector, limit = 5 } = req.body;

    if (!collection || !vector) {
      return next(createError(400, "'collection' and 'vector' are required"));
    }

    const result = await client.search(collection, { vector, limit });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

/**
 * SEARCH WITH FILTERS
 */
export const searchWithFilters = async (req, res, next) => {
  validateJson(req, next);

  try {
    const { collection, vector, filter, limit = 5 } = req.body;

    if (!collection || !vector) {
      return next(createError(400, "'collection' and 'vector' are required"));
    }

    const result = await client.search(collection, {
      vector,
      limit,
      filter,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE POINTS
 */
export const deletePoints = async (req, res, next) => {
  validateJson(req, next);

  try {
    const { collection, ids } = req.body;

    if (!collection || !Array.isArray(ids)) {
      return next(
        createError(400, "'collection' and an array of 'ids' are required")
      );
    }

    await client.delete(collection, { points: ids });

    return res
      .status(200)
      .json({ success: true, message: "Points deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

/**
 * LIST COLLECTIONS
 */
export const listCollections = async (req, res, next) => {
  validateJson(req, next);

  try {
    const result = await client.getCollections();

    return res
      .status(200)
      .json({ success: true, data: result.collections || [] });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE COLLECTION
 */
export const deleteCollection = async (req, res, next) => {
  validateJson(req, next);

  try {
    const { name } = req.params;

    if (!name) {
      return next(createError(400, "Collection 'name' param is required"));
    }

    await client.deleteCollection(name);

    return res
      .status(200)
      .json({ success: true, message: "Collection deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
