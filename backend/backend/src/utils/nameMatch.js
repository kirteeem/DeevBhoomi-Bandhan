// Small, dependency-free "does this name match that name" check used to
// compare the full name a member types into the signup form against the
// name they say appears on their Aadhaar card. It's intentionally forgiving
// about word order, extra initials, punctuation and casing (Aadhaar cards
// are printed by a government system and people type their own name very
// differently — e.g. "Amit Kumar Sharma" vs "amit sharma"), while still
// catching names that are genuinely different.

const normalize = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z\s]/g, " ") // drop punctuation/digits
    .split(/\s+/)
    .filter(Boolean);

// Classic edit-distance, used to tolerate small typos within a single word
// (e.g. "shrama" vs "sharma") rather than rejecting the whole name outright.
const levenshtein = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
};

const wordsSimilar = (a, b) => {
  if (a === b) return true;
  if (a.length < 3 || b.length < 3) return false; // too short to fuzzy-match safely
  const distance = levenshtein(a, b);
  return distance <= 1 || distance / Math.max(a.length, b.length) <= 0.25;
};

// Returns true when `enteredName` and `aadhaarName` are close enough to be
// considered the same person — every significant word in the shorter name
// must have a close match somewhere in the longer name.
export const namesLikelyMatch = (enteredName, aadhaarName) => {
  const a = normalize(enteredName);
  const b = normalize(aadhaarName);
  if (!a.length || !b.length) return false;

  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];

  const usedIndices = new Set();
  const matchedCount = shorter.filter((word) => {
    const matchIndex = longer.findIndex((candidate, idx) => !usedIndices.has(idx) && wordsSimilar(word, candidate));
    if (matchIndex === -1) return false;
    usedIndices.add(matchIndex);
    return true;
  }).length;

  // Require almost every word in the shorter name to be accounted for —
  // this allows for a missing middle name/initial but not a different name.
  return matchedCount / shorter.length >= 0.8;
};
