const sanitizeUserInput = (req, res, next) => {
  // Sanitize user input fields
  if (req.body.name) req.body.name = req.body.name.trim();
  if (req.body.email) req.body.email = req.body.email.trim().toLowerCase();
  if (req.body.phone) req.body.phone = req.body.phone.trim();
  if (req.body.gender) req.body.gender = req.body.gender.trim();
  if (req.body.organization) req.body.organization = req.body.organization.trim();
  if (req.body.bio) req.body.bio = req.body.bio.trim();
  if (req.body.country) req.body.country = req.body.country.trim();
  if (req.body.city) req.body.city = req.body.city.trim();
  if (req.body.exactLocation) req.body.exactLocation = req.body.exactLocation.trim();
  if (Array.isArray(req.body.skills)) {
    req.body.skills = req.body.skills.map(skill => skill.trim());
  }

  next();
};

const sanitizeProjectInput = (req, res, next) => {
  console.log('Before sanitize sdgs:', req.body.sdgs, 'type:', typeof req.body.sdgs);

  // Sanitize project input fields
  if (req.body.type) req.body.type = req.body.type.trim();
  if (req.body.title) req.body.title = req.body.title.trim();
  if (req.body.country) req.body.country = req.body.country.trim();
  if (req.body.city) req.body.city = req.body.city.trim();
  if (req.body.exactLocation) req.body.exactLocation = req.body.exactLocation.trim();
  if (req.body.sponsors) req.body.sponsors = req.body.sponsors.trim();
  if (req.body.organizers) req.body.organizers = req.body.organizers.trim();
  if (req.body.briefInfo) req.body.briefInfo = req.body.briefInfo.trim();
  if (req.body.resourcesRequired) req.body.resourcesRequired = req.body.resourcesRequired.trim();
  if (req.body.otherInfo) req.body.otherInfo = req.body.otherInfo.trim();

  // Handle sdgs - if it's a string, parse it
  if (req.body.sdgs && typeof req.body.sdgs === 'string') {
    try {
      req.body.sdgs = JSON.parse(req.body.sdgs);
      console.log('Parsed sdgs:', req.body.sdgs);
    } catch (error) {
      console.log('Error parsing sdgs:', error);
      req.body.sdgs = [];
    }
  }

  // Ensure sdgs is an array
  if (!Array.isArray(req.body.sdgs)) {
    req.body.sdgs = [];
  }

  console.log('After sanitize sdgs:', req.body.sdgs);

  next();
};

const sanitizeOfferInput = (req, res, next) => {
  // Sanitize offer input fields
  if (req.body.category) req.body.category = req.body.category.trim();
  if (req.body.donorName) req.body.donorName = req.body.donorName.trim();
  if (req.body.contact) req.body.contact = req.body.contact.trim();
  if (req.body.itemType) req.body.itemType = req.body.itemType.trim();
  if (req.body.description) req.body.description = req.body.description.trim();
  if (req.body.logistics) req.body.logistics = req.body.logistics.trim();
  if (req.body.pickupLocation) req.body.pickupLocation = req.body.pickupLocation.trim();
  if (req.body.contactPerson) req.body.contactPerson = req.body.contactPerson.trim();
  if (req.body.skill) req.body.skill = req.body.skill.trim();
  if (req.body.method) req.body.method = req.body.method.trim();
  if (req.body.experience) req.body.experience = req.body.experience.trim();

  next();
};

const sanitizeDonationInput = (req, res, next) => {
  // Sanitize donation input fields
  if (req.body.name) req.body.name = req.body.name.trim();
  if (req.body.email) req.body.email = req.body.email.trim().toLowerCase();
  if (req.body.phone) req.body.phone = req.body.phone.trim();

  next();
};

module.exports = {
  sanitizeUserInput,
  sanitizeProjectInput,
  sanitizeOfferInput,
  sanitizeDonationInput,
};
