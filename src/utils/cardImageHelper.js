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
  const imageMap = {
    Fish: '/assets/cards/fish_origami.png',
    Crab: '/assets/cards/crab_origami.png',
    Shell: '/assets/cards/shell_origami.png',
    Starfish: '/assets/cards/starfish_origami.png',
    Sailboat: '/assets/cards/sailboat_origami.png',
    Shark: '/assets/cards/shark_origami.png',
    Swimmer: '/assets/cards/swimmer_origami.png',
    Sailor: '/assets/cards/sailor_origami.png',
    Octopus: '/assets/cards/octopus_origami.png',
    Penguin: '/assets/cards/penguin_origami.png',
    Captain: '/assets/cards/captain_origami.png',
    Seagull: '/assets/cards/seagull_origami.png',
    Mermaid: '/assets/cards/mermaid_origami.png'
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
  return {
    Fish: '/assets/cards/fish_origami.png',
    Crab: '/assets/cards/crab_origami.png',
    Shell: '/assets/cards/shell_origami.png',
    Starfish: '/assets/cards/starfish_origami.png',
    Sailboat: '/assets/cards/sailboat_origami.png',
    Shark: '/assets/cards/shark_origami.png',
    Swimmer: '/assets/cards/swimmer_origami.png',
    Sailor: '/assets/cards/sailor_origami.png',
    Octopus: '/assets/cards/octopus_origami.png',
    Penguin: '/assets/cards/penguin_origami.png',
    Captain: '/assets/cards/captain_origami.png',
    Seagull: '/assets/cards/seagull_origami.png',
    Mermaid: '/assets/cards/mermaid_origami.png'
  }
}
