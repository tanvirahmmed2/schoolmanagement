import { registerUser } from "@/lib/auth";
import { createTenant } from "@/lib/tenant";
import { sendCreated, sendBadRequest, sendConflict, sendServerError } from "@/utils/response";
import { validateRequired, isValidEmail, isValidPassword, isValidInstitutionType } from "@/utils/validator";
import { withTransaction } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(request) {
  try {
    const body = await request.json();
    const { valid, errors } = validateRequired(body, ["name", "email", "password", "institutionName", "institutionType"]);
    if (!valid) return sendBadRequest("Validation failed", errors);

    if (!isValidEmail(body.email))             return sendBadRequest("Invalid email format");
    if (!isValidPassword(body.password))       return sendBadRequest("Password must be at least 8 characters with letters and numbers");
    if (!isValidInstitutionType(body.institutionType)) return sendBadRequest("Invalid institution type");

    const result = await withTransaction(async (client) => {
      // Create the user
      const user = await registerUser({
        name:     body.name.trim(),
        email:    body.email.toLowerCase().trim(),
        password: body.password,
        role:     "client",
      });

      // Create their tenant
      const tenant = await createTenant({
        ownerUserId:     user.id,
        institutionName: body.institutionName.trim(),
        institutionType: body.institutionType,
        email:           body.email.toLowerCase().trim(),
        phone:           body.phone?.trim() || null,
        country:         body.country || "Bangladesh",
      });

      return { user, tenant };
    });

    // Send verification email asynchronously
    try {
      await sendVerificationEmail({
        email: body.email.toLowerCase().trim(),
        name: body.name.trim(),
        token: result.user.verification_token,
      });
    } catch (emailErr) {
      console.error("[Email Error] Failed to send verification email:", emailErr);
    }

    // Remove verification token from the response object
    if (result.user.verification_token) {
      delete result.user.verification_token;
    }

    return sendCreated(result);
  } catch (err) {
    if (err.status === 409) return sendConflict(err.message);
    return sendServerError(err);
  }
}

