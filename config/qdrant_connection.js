import {QdrantClient} from "@qdrant/js-client-rest"

const url = process.env.QDRANT_URL || "http://localhost:6333"

export const client = new QdrantClient({
    url,
    apiKey : url.startsWith("https://") ? process.env.QDRANT_API_KEY : undefined
});