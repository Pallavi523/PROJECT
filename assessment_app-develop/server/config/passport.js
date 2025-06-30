import passport from "passport";
import { Strategy as MagicLinkStrategy } from "passport-magic-link";
import nodemailer from "nodemailer";
import Candidate from "../models/candidate.js";
import { encrypt } from "../utils/crypto.js";
import dotenv from "dotenv";
import Assessment from "../models/assessment.js";
dotenv.config();
 
export const transporter = nodemailer.createTransport({
  // service: "smtp.office365.com",
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log("SMTP connection verified");
  } catch (error) {
    console.error("SMTP verification failed:", error);
    throw error;
  }
};

passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Candidate.findById(id).populate("assessmentId");
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Use MagicLink strategy
passport.use(
  new MagicLinkStrategy(
    {
      secret: process.env.JWT_SECRET,
      userFields: ["email", "assessmentId"],
      tokenField: "token",
      verifyUserAfterToken: true,
      tokenExpiration: 30 * 60 * 60,
    },
    async function send({ email, assessmentId }, token) {
      try {
        const cryptoToken = encrypt(token);
        await verifyTransporter();

        const candidate = await Candidate.findOne({ email }).populate(
          "assessmentId"
        );
        if (!candidate) throw new Error("Candidate not found");
        console.log(candidate);
        
        console.log(candidate.assessmentId);
        console.log(candidate.assessmentId.title);
        const magicLink = `${process.env.CLIENT_URL}/verify/${cryptoToken}`;
        const scheduledTime = candidate.scheduledStartTime.toLocaleString();

        const mailOptions = {
          from: {
            name: "Your Assessment System",
            address: process.env.SMTP_FROM,
          },
          to: email,
          subject: "Your Assessment Access Link",
          html: `
            <h1>Online Assessment</h1>
            <p>Dear ${candidate.fullName},</p>
            <p>Your assessment "${candidate.assessmentId.title}" is scheduled for: <strong>${scheduledTime}</strong></p>
            <p>Duration of Exam will be of "${candidate.assessmentId.duration}" mins</p>
            <p>No.of Question will be "${candidate.assessmentId.totalQuestions}" and passing score will be "${candidate.assessmentId.passingScore}"</p>
            <p>Please click the link below to start your assessment:</p>
            <a href="${magicLink}">Start Assessment</a>
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>This link will only work at your scheduled time</li>
              <li>The assessment will automatically end after "${candidate.assessmentId.duration}" mins </li>
              <li>Ensure a stable internet connection</li>
            </ul>
          `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);

        await Candidate.updateOne(
          { email },
          {
            $set: {
              emailSent: true,
              emailSentAt: new Date(),
              magicLinkToken: token,
            },
          }
        );
      } catch (err) {
        console.error("Failed to send magic link:", err);
        throw new Error(`Failed to send magic link: ${err.message}`);
      }
    },
    async function verify(payload) {
      
      console.log("Payload: ", payload);
      try {
        console.log("user email", payload.email);
        console.log("user assessment", payload.assessmentId);

        const user = await Candidate.findOne({
          email: payload.email,
          assessmentId: payload.assessmentId,
          attemptStatus: { $eq: "NOT_STARTED" },
        }).populate("assessmentId");
        console.log("Verification user: ", user);

        if (!user) {
          console.error("Verification failed: No matching user found");
          return false;
        }
        return user;
      } catch (err) {
        console.error("Error during verification:", err);
        throw new Error("Error verifying candidate");
      }
    }
  )
);

export default passport;


