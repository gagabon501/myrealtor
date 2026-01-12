import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = "no-reply@myrealtor.ph",
  ADMIN_EMAILS,
} = process.env;

let transporter;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.warn("SMTP not configured, skipping email send");
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
};

export const sendRegistrationEmail = async ({ to, name }) => {
  if (!transporter) {
    console.warn("SMTP not configured, skipping email send");
    return;
  }

  const adminList = ADMIN_EMAILS ? ADMIN_EMAILS.split(",").map((e) => e.trim()) : [];

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2>Welcome to MyRealtor PH, ${name || "Client"}!</h2>
      <p>Thank you for registering. You can now browse listings, submit applications, upload documents, and track compliance steps through your dashboard.</p>
      <p style="margin-top:16px;">If you did not create this account, please contact support immediately.</p>
      <p style="margin-top:24px;">– MyRealtor PH Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    cc: adminList,
    subject: "Welcome to MyRealtor PH",
    html,
  });
};

