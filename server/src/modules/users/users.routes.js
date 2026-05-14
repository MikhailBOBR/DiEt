const express = require("express");
const { requireAuth, requireRole } = require("../../middlewares/auth");
const { assertOneOf } = require("../../lib/validation");
const { listUsers, updateUserRole } = require("./users.service");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", async (_req, res) => {
  res.json(await listUsers());
});

router.patch("/:id/role", async (req, res) => {
  assertOneOf(req.body.role, "role", ["user", "admin"]);

  res.json(
    await updateUserRole(
      Number(req.params.id),
      req.body.role.trim(),
      req.user.id
    )
  );
});

module.exports = router;
