// For production, use a proper embedding service like:
// 1. HuggingFace Inference API
// 2. OpenAI Embeddings
// 3. Cohere Embeddings
// 4. Local sentence-transformers via Python microservice

const embeddingSize = 384; // all-MiniLM-L6-v2 size

// Generate embeddings for text
const generateEmbedding = async (text) => {
  try {
    // Mock embedding - replace with actual API call
    // Example with HuggingFace:
    // const response = await fetch(
    //   'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
    //   {
    //     method: 'POST',
    //     headers: {
    //       Authorization: `Bearer ${process.env.HF_TOKEN}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ inputs: text }),
    //   }
    // );
    // const result = await response.json();
    // return result;

    // Mock implementation for demo
    return mockEmbedding(text);
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Fallback to mock embedding
    return mockEmbedding(text);
  }
};

// Mock embedding function for development
const mockEmbedding = (text) => {
  // Create a deterministic mock embedding based on text length and words
  const embedding = new Array(embeddingSize).fill(0);
  const words = text.toLowerCase().split(/\s+/);

  words.forEach((word, wordIndex) => {
    for (let i = 0; i < embeddingSize; i++) {
      // Create pseudo-random but deterministic values
      const charSum = word
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);

      embedding[i] += Math.sin(wordIndex * 100 + i * 10 + charSum) * 0.01;
    }
  });

  // Normalize
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));

  return embedding.map((val) => val / norm);
};

// Batch generate embeddings
const generateEmbeddings = async (texts) => {
  const embeddings = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }

  return embeddings;
};

export { generateEmbedding, generateEmbeddings };
