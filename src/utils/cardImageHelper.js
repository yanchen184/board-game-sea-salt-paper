/**
 * Card Image Helper
 * Maps card names to their origami-style images
 */

/**
 * Get the image path for a card
 * @param {string} cardName - The name of the card
 * @returns {string} - The path to the card's origami image
 */
export function getCardImage(cardName) {
  const base = import.meta.env.BASE_URL || '/'
  const imageMap = {
    Fish: `${base}assets/cards/fish_origami.png`,
    Crab: `${base}assets/cards/crab_origami.png`,
    Shell: `${base}assets/cards/shell_origami.png`,
    Starfish: `${base}assets/cards/starfish_origami.png`,
    Sailboat: `${base}assets/cards/sailboat_origami.png`,
    Shark: `${base}assets/cards/shark_origami.png`,
    Swimmer: `${base}assets/cards/swimmer_origami.png`,
    Sailor: `${base}assets/cards/sailor_origami.png`,
    Octopus: `${base}assets/cards/octopus_origami.png`,
    Penguin: `${base}assets/cards/penguin_origami.png`,
    Captain: `${base}assets/cards/captain_origami.png`,
    Seagull: `${base}assets/cards/seagull_origami.png`,
    Mermaid: `${base}assets/cards/mermaid_origami.png`
  }

  return imageMap[cardName] || null
}

/**
 * Check if a card has an origami image available
 * @param {string} cardName - The name of the card
 * @returns {boolean} - True if image exists
 */
export function hasCardImage(cardName) {
  return getCardImage(cardName) !== null
}

/**
 * Get all available card images
 * @returns {Object} - Map of card names to image paths
 */
export function getAllCardImages() {
  const base = import.meta.env.BASE_URL || '/'
  return {
    Fish: `${base}assets/cards/fish_origami.png`,
    Crab: `${base}assets/cards/crab_origami.png`,
    Shell: `${base}assets/cards/shell_origami.png`,
    Starfish: `${base}assets/cards/starfish_origami.png`,
    Sailboat: `${base}assets/cards/sailboat_origami.png`,
    Shark: `${base}assets/cards/shark_origami.png`,
    Swimmer: `${base}assets/cards/swimmer_origami.png`,
    Sailor: `${base}assets/cards/sailor_origami.png`,
    Octopus: `${base}assets/cards/octopus_origami.png`,
    Penguin: `${base}assets/cards/penguin_origami.png`,
    Captain: `${base}assets/cards/captain_origami.png`,
    Seagull: `${base}assets/cards/seagull_origami.png`,
    Mermaid: `${base}assets/cards/mermaid_origami.png`
  }
}
