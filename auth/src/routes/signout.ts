import express from "express";

// Create an Express router
const router = express.Router();

/**
 * Route handler for user sign-out.
 * Clears the user's session and signs them out of the system.
 */
router.post("/api/auth/signout", (req, res) => {
  // Clear the user's session
  req.session = null;

  // Send an empty response
  res.send({});
});

// Export the router
export { router as signOutRouter };
