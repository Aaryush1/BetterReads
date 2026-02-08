/**
 * Maps raw genre/subject strings (from Google Books categories and Open Library subjects)
 * to human-friendly thematic labels for recommendation row headings.
 */
const GENRE_MAP: Record<string, string> = {
  // Broad fiction
  "fiction": "Fiction",
  "literary fiction": "Literary Fiction",
  "literary collections": "Literary Fiction",

  // Genre fiction
  "science fiction": "Sci-Fi",
  "fantasy": "Fantasy",
  "fantasy fiction": "Fantasy",
  "mystery": "Mystery",
  "mystery and detective stories": "Mystery",
  "detective and mystery stories": "Mystery",
  "thriller": "Thrillers",
  "thrillers": "Thrillers",
  "suspense": "Suspense",
  "romance": "Romance",
  "love stories": "Romance",
  "horror": "Horror",
  "horror fiction": "Horror",
  "historical fiction": "Historical Fiction",

  // Subgenres
  "dystopian": "Dystopian Fiction",
  "adventure": "Adventure",
  "adventure stories": "Adventure",
  "gothic fiction": "Gothic",
  "magical realism": "Magical Realism",
  "urban fantasy": "Urban Fantasy",
  "epic fantasy": "Epic Fantasy",
  "space opera": "Space Opera",
  "cyberpunk": "Cyberpunk",
  "coming of age": "Coming of Age",
  "war fiction": "War Stories",

  // Non-fiction
  "biography": "Biography",
  "biography & autobiography": "Biography",
  "autobiography": "Memoir",
  "memoir": "Memoir",
  "history": "History",
  "science": "Science",
  "popular science": "Science",
  "psychology": "Psychology",
  "self-help": "Self-Help",
  "philosophy": "Philosophy",
  "business": "Business",
  "business & economics": "Business",
  "true crime": "True Crime",
  "travel": "Travel",
  "cooking": "Food & Cooking",
  "art": "Art",
  "music": "Music",
  "politics": "Politics",
  "political science": "Politics",
  "religion": "Religion",
  "spirituality": "Spirituality",
  "health": "Health & Wellness",
  "health & fitness": "Health & Wellness",
  "nature": "Nature",
  "education": "Education",
  "technology": "Technology",
  "computers": "Technology",
  "mathematics": "Mathematics",
  "sociology": "Sociology",
  "social science": "Social Science",

  // Themes
  "families": "Family Stories",
  "family": "Family Stories",
  "identity": "Identity & Self",
  "race relations": "Race & Identity",
  "immigration": "Immigration Stories",
  "grief": "Grief & Loss",
  "war": "War Stories",

  // Format
  "graphic novels": "Graphic Novels",
  "comics": "Comics & Graphic Novels",
  "poetry": "Poetry",
  "essays": "Essays",
  "short stories": "Short Stories",

  // Young adult
  "young adult fiction": "Young Adult",
  "juvenile fiction": "Young Adult",
};

function titleCase(str: string): string {
  return str
    .split(/[\s/]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Returns a human-friendly thematic label for a set of genre strings.
 * Tries exact match first, then partial match, then falls back to title-casing.
 */
export function getThematicLabel(
  genres: (string | null | undefined)[]
): string {
  for (const genre of genres) {
    if (!genre) continue;
    const lower = genre.toLowerCase().trim();

    // Exact match
    if (GENRE_MAP[lower]) return GENRE_MAP[lower];

    // Partial match — check if any key is contained in the genre string
    for (const [key, label] of Object.entries(GENRE_MAP)) {
      if (lower.includes(key)) return label;
    }
  }

  // Fallback: title-case the first non-null genre
  const first = genres.find((g) => g != null && g.trim().length > 0);
  if (first) return titleCase(first);

  return "Recommended for You";
}
