const { body } = require('express-validator');

// Sanitization middleware for user input
const sanitizeUserInput = [
  body('name').optional().trim().escape(),
  body('email').optional().normalizeEmail(),
  body('phone').optional().trim(),
  body('organization').optional().trim().escape(),
  body('bio').optional().trim().escape(),
  body('country').optional().trim().escape(),
  body('city').optional().trim().escape(),
  body('exactLocation').optional().trim().escape(),
  body('skills').optional().isArray(),
  body('skills.*').optional().trim().escape(),
  body('gender').optional().trim().escape(),
  body('educationLevel').optional().trim().escape(),
];

// Sanitization middleware for project creation
const sanitizeProjectInput = [
  body('title').trim().escape(),
  body('briefInfo').trim().escape(),
  body('sponsors').optional().trim().escape(),
  body('organizers').optional().trim().escape(),
  body('country').trim().escape(),
  body('city').trim().escape(),
  body('exactLocation').optional().trim().escape(),
  body('resourcesRequired').optional().trim().escape(),
  body('otherInfo').optional().trim().escape(),
];

// Sanitization middleware for offers/donations
const sanitizeOfferInput = [
  body('donorName').optional().trim().escape(),
  body('contact').trim(),
  body('itemType').optional().trim().escape(),
  body('description').optional().trim().escape(),
  body('logistics').optional().trim().escape(),
  body('pickupLocation').optional().trim().escape(),
  body('contactPerson').optional().trim().escape(),
  body('skill').optional().trim().escape(),
  body('timeCommitment').optional().trim().escape(),
  body('method').optional().trim().escape(),
  body('experience').optional().trim().escape(),
];

// Sanitization middleware for donations
const sanitizeDonationInput = [
  body('name').optional().trim().escape(),
  body('email').normalizeEmail(),
  body('phone').trim(),
];

module.exports = {
  sanitizeUserInput,
  sanitizeProjectInput,
  sanitizeOfferInput,
  sanitizeDonationInput,
};
