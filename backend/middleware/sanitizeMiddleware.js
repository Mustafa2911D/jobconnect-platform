import sanitizeHtml from 'sanitize-html';

const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  allowedIframeHostnames: []
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], sanitizeOptions);
      } else if (Array.isArray(req.body[key])) {
        req.body[key] = req.body[key].map(item => 
          typeof item === 'string' ? sanitizeHtml(item, sanitizeOptions) : item
        );
      }
    });
  }
  next();
};

export const sanitizeJobInput = (req, res, next) => {
  const fieldsToSanitize = ['title', 'description', 'company', 'requirements', 'benefits'];
  
  if (req.body) {
    fieldsToSanitize.forEach(field => {
      if (req.body[field]) {
        if (typeof req.body[field] === 'string') {
          req.body[field] = sanitizeHtml(req.body[field], {
            allowedTags: ['br', 'p', 'ul', 'ol', 'li', 'strong', 'em'],
            allowedAttributes: {}
          });
        } else if (Array.isArray(req.body[field])) {
          req.body[field] = req.body[field].map(item =>
            sanitizeHtml(item, { allowedTags: [], allowedAttributes: {} })
          );
        }
      }
    });
  }
  next();
};