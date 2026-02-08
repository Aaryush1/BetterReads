import { cosineSimilarity } from "@/lib/taste-vector";
import { getThematicLabel } from "@/lib/genre-labels";

export interface Candidate {
  book_id: string;
  title: string;
  author: string | null;
  genre: string | null;
  description: string | null;
  cover_url: string | null;
  similarity: number;
}

export interface AnchorBook {
  googleBookId: string;
  title: string;
  author: string | null;
  embedding: number[];
  rating: number;
}

export interface Cluster {
  anchor: AnchorBook;
  candidates: Candidate[];
  theme: string;
}

/**
 * Groups candidate books into clusters, each anchored to the user-rated book
 * with the highest cosine similarity.
 *
 * Returns up to 5 clusters, sorted by size (most candidates first).
 * Within each cluster, candidates are sorted by their similarity to the taste vector.
 */
export function clusterByAnchor(
  candidates: Candidate[],
  anchors: AnchorBook[],
  candidateEmbeddings: Map<string, number[]>
): Cluster[] {
  if (anchors.length === 0 || candidates.length === 0) return [];

  const clusterMap = new Map<
    string,
    { anchor: AnchorBook; candidates: Candidate[] }
  >();

  for (const candidate of candidates) {
    const candEmb = candidateEmbeddings.get(candidate.book_id);

    let bestAnchor = anchors[0];
    let bestSim = -Infinity;

    if (candEmb) {
      for (const anchor of anchors) {
        const sim = cosineSimilarity(candEmb, anchor.embedding);
        if (sim > bestSim) {
          bestSim = sim;
          bestAnchor = anchor;
        }
      }
    }

    const key = bestAnchor.googleBookId;
    if (!clusterMap.has(key)) {
      clusterMap.set(key, { anchor: bestAnchor, candidates: [] });
    }
    clusterMap.get(key)!.candidates.push(candidate);
  }

  // Sort clusters by size descending, take top 5
  return Array.from(clusterMap.values())
    .sort((a, b) => b.candidates.length - a.candidates.length)
    .slice(0, 5)
    .map(({ anchor, candidates: clusterCandidates }) => ({
      anchor,
      candidates: clusterCandidates,
      theme: getThematicLabel(clusterCandidates.map((c) => c.genre)),
    }));
}

/**
 * Generates a human-readable reason string for a recommendation cluster.
 *
 * Pattern: "Theme — inspired by "Anchor Title""
 * Fallback: "Because you liked "Anchor Title"" if no meaningful theme
 */
export function generateReason(cluster: Cluster): string {
  const { anchor, theme } = cluster;

  if (theme !== "Recommended for You") {
    return `${theme} — inspired by "${anchor.title}"`;
  }

  return `Because you liked "${anchor.title}"`;
}
