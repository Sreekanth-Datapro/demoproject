const csrf = require("csurf");

/*
  Using session-based CSRF protection.
  Make sure express-session is enabled BEFORE this middleware.
*/

const csrfProtection = csrf({
  cookie: false, // we are using session storage
  ignoreMethods: ["GET", "HEAD", "OPTIONS"] // protect only state-changing requests
});

module.exports = csrfProtection;