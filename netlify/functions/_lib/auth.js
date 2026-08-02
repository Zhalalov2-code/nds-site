// Netlify injects context.clientContext.user when the request carries a
// valid Netlify Identity JWT (Authorization: Bearer <token>).
function getUser(context) {
  return (context.clientContext && context.clientContext.user) || null;
}

function requireUser(context) {
  const user = getUser(context);
  if (!user) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
  return user;
}

module.exports = { getUser, requireUser };
