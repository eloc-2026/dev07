/**
 * Random utility functions for procedural generation
 */

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Pick a random element from an array
 */
export function randomChoice(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Pick N random elements from an array (without replacement)
 */
export function randomChoices(array, n) {
  if (!array || array.length === 0) return [];
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

/**
 * Generate a random boolean with optional probability
 * @param {number} probability - Probability of true (0-1), default 0.5
 */
export function randomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Generate a random ID
 */
export function randomId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${randomPart}` : `${timestamp}_${randomPart}`;
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a weighted random choice
 * @param {Array} items - Array of items
 * @param {Array} weights - Array of weights (same length as items)
 */
export function weightedChoice(items, weights) {
  if (items.length !== weights.length) {
    throw new Error('Items and weights must have the same length');
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

export default {
  randomInt,
  randomFloat,
  randomChoice,
  randomChoices,
  randomBoolean,
  randomId,
  shuffle,
  weightedChoice
};
