const EMBEDDING_DIM = 1536;

const POS_WEIGHTS: Record<number, number> = {
  5: 1.0,
  4.5: 0.85,
  4: 0.7,
  3.5: 0.4,
  3: 0.2,
};

const NEG_WEIGHTS: Record<number, number> = {
  1: 0.6,
  1.5: 0.5,
  2: 0.35,
  2.5: 0.2,
};

const NEGATIVE_ALPHA = 0.3;

interface RatedBook {
  googleBookId: string;
  rating: number;
}

/**
 * Cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical direction).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function normalize(vec: number[]): number[] {
  let mag = 0;
  for (const v of vec) mag += v * v;
  mag = Math.sqrt(mag);
  if (mag === 0) return vec;
  return vec.map((v) => v / mag);
}

/**
 * Computes a taste vector from a user's rated books.
 *
 * Positively-rated books (3–5) are weighted and averaged into a positive vector.
 * Negatively-rated books (1–2.5) are weighted and averaged into a negative vector.
 * Final vector = normalize(posVector - 0.3 * negVector)
 *
 * Returns null if no positive signals exist (no embeddings found for liked books).
 */
export function computeTasteVector(
  ratedBooks: RatedBook[],
  embeddingsMap: Map<string, number[]>
): number[] | null {
  const posVector = new Float64Array(EMBEDDING_DIM);
  const negVector = new Float64Array(EMBEDDING_DIM);
  let posWeightSum = 0;
  let negWeightSum = 0;

  for (const book of ratedBooks) {
    const embedding = embeddingsMap.get(book.googleBookId);
    if (!embedding) continue;

    const posW = POS_WEIGHTS[book.rating] ?? 0;
    const negW = NEG_WEIGHTS[book.rating] ?? 0;

    if (posW > 0) {
      posWeightSum += posW;
      for (let i = 0; i < EMBEDDING_DIM; i++) {
        posVector[i] += posW * embedding[i];
      }
    }

    if (negW > 0) {
      negWeightSum += negW;
      for (let i = 0; i < EMBEDDING_DIM; i++) {
        negVector[i] += negW * embedding[i];
      }
    }
  }

  // No positive signals → can't generate a taste vector
  if (posWeightSum === 0) return null;

  // Weighted average for positive
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    posVector[i] /= posWeightSum;
  }

  // Weighted average for negative (if any)
  if (negWeightSum > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      negVector[i] /= negWeightSum;
    }
  }

  // Combine: pos - alpha * neg
  const result = new Array<number>(EMBEDDING_DIM);
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    result[i] = posVector[i] - NEGATIVE_ALPHA * negVector[i];
  }

  return normalize(result);
}
