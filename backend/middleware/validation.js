const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

const validateProjectCreation = (req, res, next) => {
  const { type, title, sdgs, startDate, briefInfo } = req.body;

  const errors = [];

  if (!type || !['event', 'project'].includes(type)) {
    errors.push('Valid type (event or project) is required');
  }

  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!sdgs || !Array.isArray(sdgs) || sdgs.length === 0) {
    errors.push('At least one SDG must be selected');
  }

  if (!startDate || isNaN(Date.parse(startDate))) {
    errors.push('Valid start date is required');
  }

  if (!briefInfo || briefInfo.trim().length < 10) {
    errors.push('Brief info must be at least 10 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProjectCreation,
};
