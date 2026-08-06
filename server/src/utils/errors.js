const formatError = (error) => {
  if (error.name === 'SequelizeUniqueConstraintError') {
    let message = 'A record with duplicate values already exists.';
    if (error.errors && error.errors.length > 0) {
      message = error.errors.map(err => {
        const field = err.path;
        const fieldLabel = field
          ? field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')
          : 'field';
        return `${fieldLabel} must be unique. This ${fieldLabel.toLowerCase()} is already in use.`;
      }).join(' ');
    }
    return { status: 400, message };
  }

  if (error.name === 'SequelizeValidationError') {
    let message = error.message;
    if (error.errors && error.errors.length > 0) {
      message = error.errors.map(err => err.message).join(', ');
    }
    return { status: 400, message };
  }

  return { status: 500, message: error.message };
};

module.exports = { formatError };
