import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.example.com";
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

const isPlaceholder = (value) => !value || value.includes("example.com") || value.includes("your@");

let transporter = null;
let emailEnabled = true;

if (isPlaceholder(SMTP_HOST) || !SMTP_USER || !SMTP_PASS) {
    console.warn("Email disabled: SMTP not configured or uses placeholder values. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable sending.");
    emailEnabled = false;
} else {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

export const isEmailEnabled = () => emailEnabled;

export const sendMail = async ({ to, subject, html, text, from }) => {
    const mailOptions = {
        from: from || process.env.FROM_EMAIL || "no-reply@example.com",
        to,
        subject,
        text,
        html,
    };

    if (!emailEnabled) {
        console.log("Email disabled. Skipping sendMail. Mail options:", mailOptions);
        return { accepted: [], info: "disabled" };
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (err) {
        console.error("Error sending mail. Check SMTP env vars and network. Details:", err && err.message ? err.message : err);
        return { error: err };
    }
};

export const sendWelcomeEmail = async (user) => {
    const { name, email, flatNumber } = user;
    const subject = `Welcome to Panchayat, ${name}!`;
    const html = `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
    
    <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#4f46e5; color:white; padding:20px; text-align:center;">
        <h1>Panchayat 🏠</h1>
        <p>Smart Society Management</p>
      </div>

      <!-- Body -->
      <div style="padding:20px; color:#333;">
        <h2>Namaste ${name} 👋</h2>

        <p>Welcome to <strong>Panchayat</strong>! 🎉</p>

        <p>Your flat number is:</p>
        <h3 style="color:#4f46e5;">${flatNumber}</h3>

        <p>
          You can now:
        </p>

        <ul>
          <li>📢 Raise complaints</li>
          <li>🛠 Book services</li>
          <li>🤖 Ask AI assistant</li>
        </ul>

        <p style="margin-top:20px;">
          We are excited to have you onboard 🚀
        </p>

        <!-- Button -->
        <div style="text-align:center; margin-top:20px;">
          <a href="https://panchayat-app-five.vercel.app" 
             style="background:#4f46e5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
            Open Panchayat
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f1f1f1; padding:10px; text-align:center; font-size:12px;">
        © 2026 Panchayat App | All rights reserved
      </div>

    </div>
  </div>
`;

    try {
        const res = await sendMail({ to: email, subject, html });
        if (res && res.error) {
            console.error("sendWelcomeEmail: mail send returned error", res.error);
        }
    } catch (err) {
        console.error("Failed to send welcome email:", err && err.message ? err.message : err);
    }
};

export const sendComplaintStatusEmail = async (user, complaint, adminComment) => {
    if (!user || !user.email) {
        console.warn("sendComplaintStatusEmail: missing user or email");
        return;
    }

    const name = user.name || "Resident";
    const email = user.email;
    const flat = user.flatNumber || "";
    const status = (complaint && complaint.status) || "updated";
    const id = complaint && complaint._id ? complaint._id : "";
    const summary = complaint && (complaint.translatedText || complaint.summary || complaint.originalText) ? (complaint.translatedText || complaint.summary || complaint.originalText) : "";
    const category = complaint && complaint.category ? complaint.category : "General";

    const subject = `Your complaint ${id} status: ${status}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
          <div style="background:#4f46e5; color:white; padding:16px; text-align:center;">
            <h2>Complaint Status Update</h2>
          </div>
          <div style="padding:18px; color:#333;">
            <p>Namaste ${name},</p>
            <p>Your complaint <strong>#${id}</strong> has been updated to: <strong>${status}</strong>.</p>
              <p><strong>Flat:</strong> ${flat}</p>
            <p><strong>Category:</strong> ${category}</p>

            <p><strong>Summary:</strong> ${summary}</p>
            ${adminComment ? `<p><strong>Admin note:</strong><br/>${adminComment}</p>` : ""}
            <p style="margin-top:18px">If you have any questions, reply to this email.</p>
            <p>— Panchayat Team</p>
          </div>
          <div style="background:#f1f1f1; padding:10px; text-align:center; font-size:12px;">
            © 2026 Panchayat App
          </div>
        </div>
      </div>
    `;

    try {
        const res = await sendMail({ to: email, subject, html });
        if (res && res.error) console.error("sendComplaintStatusEmail: mail send returned error", res.error);
    } catch (err) {
        console.error("sendComplaintStatusEmail error:", err && err.message ? err.message : err);
    }
};

export const sendBookingStatusEmail = async (user, booking) => {
    if (!user || !user.email) {
        console.warn("sendBookingStatusEmail: missing user or email");
        return;
    }

    const name = user.name || "Resident";
    const email = user.email;
    const flat = user.flatNumber || "";
    const status = booking && booking.status ? booking.status : "updated";
    const id = booking && booking._id ? booking._id : "";
    const serviceName = booking && booking.service && booking.service.name ? booking.service.name : (booking && booking.service) || "Service";
    const date = booking && booking.date ? booking.date : "";
    const time = booking && booking.time ? booking.time : "";

    const subject = `Booking ${id} status: ${status}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
          <div style="background:#4f46e5; color:white; padding:16px; text-align:center;">
            <h2>Booking Status Update</h2>
          </div>
          <div style="padding:18px; color:#333;">
            <p>Namaste ${name},</p>
            <p>Your booking <strong>#${id}</strong> has been updated to: <strong>${status}</strong>.</p>

            <p><strong>Details:</strong></p>
            <ul>
              <li><strong>Flat:</strong> ${flat}</li>
              <li><strong>Service:</strong> ${serviceName}</li>
              <li><strong>Date:</strong> ${date}</li>
              <li><strong>Time:</strong> ${time}</li>
            </ul>

            <p style="margin-top:18px">If you have any questions, reply to this email.</p>
            <p>— Panchayat Team</p>
          </div>
          <div style="background:#f1f1f1; padding:10px; text-align:center; font-size:12px;">
            © 2026 Panchayat App
          </div>
        </div>
      </div>
    `;

    try {
        const res = await sendMail({ to: email, subject, html });
        if (res && res.error) console.error("sendBookingStatusEmail: mail send returned error", res.error);
    } catch (err) {
        console.error("sendBookingStatusEmail error:", err && err.message ? err.message : err);
    }
};
