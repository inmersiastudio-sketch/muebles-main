import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const FROM_EMAIL = env.EMAIL_FROM || "Amobly <onboarding@resend.dev>";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[email] (no RESEND_API_KEY) To: ${to}`);
    console.log(`[email] Subject: ${subject}`);
    console.log(`[email] Body:\n${html}`);
    return { ok: true, dev: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }

    console.log(`[email] ✅ Sent to ${to} (id: ${data?.id})`);
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[email] Failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown" };
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string, name?: string) {
  const subject = "Verificá tu email - Amobly";
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Amobly</h1>
        <p style="color: #64748b; margin: 5px 0 0;">Plataforma de Muebles AR</p>
      </div>
      
      <h2 style="color: #0f172a;">¡Bienvenido${name ? `, ${name}` : ""}!</h2>
      <p style="color: #334155; font-size: 16px;">
        Gracias por registrar tu mueblería en Amobly. Para empezar a usar la plataforma, 
        verificá tu correo electrónico haciendo click en el siguiente botón:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Verificar mi email
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 14px;">
        Este enlace expira en 24 horas. Si no creaste esta cuenta, ignorá este correo.
      </p>
      <p style="color: #64748b; font-size: 14px;">
        O copiá este enlace en tu navegador:<br/>
        <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; word-break: break-all; font-size: 12px;">${verifyUrl}</code>
      </p>
    </div>
  `;

  return sendEmail(to, subject, html);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, name?: string) {
  const subject = "Recuperar contraseña - Amobly";
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Amobly</h1>
      </div>
      
      <h2 style="color: #0f172a;">Recuperar contraseña</h2>
      <p>Hola${name ? ` ${name}` : ""},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña en Amobly.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Restablecer contraseña
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 14px;">
        Este enlace expira en 1 hora. Si no solicitaste restablecer tu contraseña, ignorá este correo.
      </p>
      <p style="color: #64748b; font-size: 14px;">
        O copiá este enlace en tu navegador:<br/>
        <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; word-break: break-all;">${resetUrl}</code>
      </p>
    </div>
  `;

  return sendEmail(to, subject, html);
}

export async function sendWelcomeEmail(to: string, storeName: string, loginUrl: string) {
  const subject = `¡Tu mueblería "${storeName}" ya está activa! - Amobly`;
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Amobly</h1>
      </div>
      
      <h2 style="color: #0f172a;">🎉 ¡Email verificado!</h2>
      <p style="color: #334155; font-size: 16px;">
        Tu mueblería <strong>"${storeName}"</strong> ya está activa en Amobly. 
        Ya podés empezar a cargar tus productos con modelos 3D y realidad aumentada.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Ir a mi panel
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 14px;">
        Con Amobly podés:<br/>
        ✅ Subir fotos de tus muebles y generar modelos 3D con IA<br/>
        ✅ Tus clientes ven los muebles en su casa con AR<br/>
        ✅ Gestionar inventario, pedidos y más
      </p>
    </div>
  `;

  return sendEmail(to, subject, html);
}
