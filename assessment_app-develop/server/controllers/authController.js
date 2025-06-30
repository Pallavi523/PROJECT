import passport from "passport";
import { decrypt } from "../utils/crypto.js";

export const verifyMagicLink = (req, res, next) => {
  try {
    const encryptedToken = req.params.token;
    const decryptedToken = decrypt(encryptedToken);
    req.query.token = decryptedToken;
    console.log(decryptedToken);

    passport.authenticate("magiclink", async (err, candidate, info, a) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error verifying link", error: err.message });
      }

      // console.log("err", candidate.user);
      // console.log("can", candidate);
      // console.log("info, ", info);

      if (!candidate) {
        return res.status(401).json({
          status: "error",
          message: "Invalid or expired magic link",
          additionalInfo: info,
        });
      }

      const now = new Date();
      const scheduledTime = new Date(candidate.scheduledStartTime);
      const timeWindow = 5;

      // if (now < new Date(scheduledTime.getTime() - timeWindow * 60000)) {
      //   return res.status(403).json({
      //     message: "Assessment has not started yet",
      //     scheduledTime: scheduledTime,
      //   });
      // }

      if (!candidate.isStarted) {
        candidate.isStarted = true;
        candidate.actualStartTime = now;
        candidate.attemptStatus = "IN_PROGRESS";
        const us = await candidate.save();
        console.log("user1", us);
      }

      if (candidate.actualStartTime) {
        const startTime = new Date(candidate.actualStartTime);
        const endTime = new Date(startTime.getTime() + 30 * 60000);

        if (now > endTime) {
          candidate.attemptStatus = "EXPIRED";
          await candidate.save();
          return res
            .status(403)
            .json({ message: "Assessment time has expired" });
        }
      }
      console.log(candidate);

      req.logIn(candidate, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({
            status: "error",
            message: "Error logging in",
          });
        }

        const timeRemaining = candidate.actualStartTime
          ? 30 - Math.floor((now - new Date(candidate.actualStartTime)) / 60000)
          : 30;
        res.json({
          status: "success",
          message: "Assessment access granted",
          timeRemaining,
          assessment: candidate.assessmentId,
          candidateId: candidate._id,
        });
      });
    })(req, res, next);
  } catch (error) {
    console.error("Token decryption error:", error);
    res.status(500).json({
      status: "error",
      message: "Invalid verification link",
    });
  }
};