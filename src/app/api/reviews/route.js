import { getReviews, createReview } from "@/lib/review";
import { getClientTenant } from "@/lib/tenant";
import { requireAuth } from "@/lib/middleware";
import { sendOk, sendCreated, sendBadRequest, sendServerError } from "@/utils/response";

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const status = sp.get("status") || undefined;
  const myReviews = sp.get("myReviews") === "true";

  // If status is not approved, user must be admin or manager
  if (status && status !== "approved") {
    const { user, error } = await requireAuth(request, ["admin", "manager"]);
    if (error) return error;
  }

  try {
    const filterParams = {};
    if (status) {
      filterParams.status = status;
    } else if (!myReviews) {
      // Default to approved for public frontend page
      filterParams.status = "approved";
    }

    if (myReviews) {
      const { user, error } = await requireAuth(request, ["client"]);
      if (error) return error;
      
      const tenant = await getClientTenant(user.id);
      if (!tenant) {
        return sendBadRequest("No tenant associated with user");
      }
      filterParams.tenantId = tenant.id;
    }

    const reviews = await getReviews(filterParams);
    return sendOk(reviews);
  } catch (err) {
    return sendServerError(err);
  }
}

export async function POST(request) {
  const { user, error } = await requireAuth(request, ["client"]);
  if (error) return error;

  try {
    const body = await request.json();
    const tenant = await getClientTenant(user.id);
    if (!tenant) {
      return sendBadRequest("No tenant associated with user");
    }

    const rating = parseInt(body.rating, 10);
    const comment = body.comment;

    const review = await createReview({
      tenantId: tenant.id,
      userId: user.id,
      rating,
      comment,
    });

    return sendCreated(review);
  } catch (err) {
    if (err.status) {
      return sendBadRequest(err.message);
    }
    return sendServerError(err);
  }
}
