import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

/**
 * SMTP transport when configured; JSON transport otherwise so development
 * works without a mail server (the message, including the code, is logged).
 */
const transporter: Transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    })
  : nodemailer.createTransport({ jsonTransport: true });

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  const info = await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html, text });
  if (!env.SMTP_HOST) {
    logger.info({ to, subject, text }, "Email (dev transport — not delivered)");
  } else {
    logger.info({ to, subject, messageId: info.messageId }, "Email sent");
  }
}

const layout = (title: string, body: string) => `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
    <div style="background:#152642;border-radius:12px 12px 0 0;padding:20px 24px">
      <span style="font-size:22px;font-weight:800;color:#ffffff">Zyn<span style="color:#D4A017">tra</span></span>
    </div>
    <div style="border:1px solid #e5eaf1;border-top:0;border-radius:0 0 12px 12px;padding:24px">
      <h2 style="margin:0 0 12px;color:#152642;font-size:18px">${title}</h2>
      ${body}
      <p style="color:#8a93a3;font-size:12px;margin-top:24px">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  </div>`;

const codeBlock = (code: string) => `
  <p style="background:#f5f7fa;border:1px dashed #2D6CB5;border-radius:10px;
     font-size:28px;letter-spacing:8px;font-weight:700;color:#152642;
     text-align:center;padding:14px 0;margin:16px 0">${code}</p>`;

export const mailer = {
  async sendVerificationCode(to: string, name: string, code: string): Promise<void> {
    await send(
      to,
      "Verify your Zyntra account",
      layout(
        `Welcome, ${name}!`,
        `<p style="color:#4a5568;font-size:14px;line-height:1.6">
           Enter this code in Zyntra to verify your email address.
           It expires in ${env.CODE_TTL_MINUTES} minutes.</p>${codeBlock(code)}`,
      ),
      `Your Zyntra verification code is ${code}. It expires in ${env.CODE_TTL_MINUTES} minutes.`,
    );
  },

  async sendPasswordResetCode(to: string, name: string, code: string): Promise<void> {
    await send(
      to,
      "Reset your Zyntra password",
      layout(
        `Hi ${name},`,
        `<p style="color:#4a5568;font-size:14px;line-height:1.6">
           Use this code to set a new password. It expires in ${env.CODE_TTL_MINUTES} minutes.</p>${codeBlock(code)}`,
      ),
      `Your Zyntra password reset code is ${code}. It expires in ${env.CODE_TTL_MINUTES} minutes.`,
    );
  },

  async sendDeadlineReminder(
    to: string,
    name: string,
    items: { university: string; program: string; deadline: string; daysLeft: number }[],
  ): Promise<void> {
    const rows = items
      .map(
        (i) =>
          `<tr>
             <td style="padding:8px 0;border-bottom:1px solid #eef1f5">
               <strong style="color:#152642">${i.university}</strong><br/>
               <span style="color:#6b7280;font-size:13px">${i.program}</span>
             </td>
             <td style="padding:8px 0;border-bottom:1px solid #eef1f5;text-align:right;white-space:nowrap">
               <span style="color:${i.daysLeft <= 7 ? "#D64545" : "#2D6CB5"};font-weight:600">
                 ${i.daysLeft === 0 ? "Due today" : `${i.daysLeft} day${i.daysLeft === 1 ? "" : "s"} left`}
               </span><br/>
               <span style="color:#9aa3b2;font-size:12px">${i.deadline}</span>
             </td>
           </tr>`,
      )
      .join("");
    await send(
      to,
      "Upcoming application deadlines — Zyntra",
      layout(
        `Hi ${name},`,
        `<p style="color:#4a5568;font-size:14px;line-height:1.6">
           These application deadlines are coming up. Log in to Zyntra to review your progress.</p>
         <table style="width:100%;border-collapse:collapse;margin-top:8px">${rows}</table>`,
      ),
      `Upcoming deadlines:\n${items.map((i) => `- ${i.university} (${i.program}): ${i.daysLeft} day(s) left, ${i.deadline}`).join("\n")}`,
    );
  },
};
