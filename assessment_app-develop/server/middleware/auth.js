export const isAuthenticated = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = new Date();
  const startTime = new Date(req.user.actualStartTime);
  const endTime = new Date(startTime.getTime() + 30 * 60000);

  if (now > endTime) {
    req.user.attemptStatus = "EXPIRED";
    await req.user.save();
    return res.status(403).json({ message: "Assessment time has expired" });
  }
  next();
};
