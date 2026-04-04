import { validateStartupBrief } from "@/lib/launch-validation";
import { buildLaunchPackage } from "@/server/launch/engine";
import { classifyLaunchError } from "@/server/launch/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateStartupBrief(body);

    if (!validation.ok) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const result = await buildLaunchPackage(validation.brief);

    return Response.json(result);
  } catch (error) {
    const classified = classifyLaunchError(error);

    return Response.json({ error: classified.userMessage }, { status: 500 });
  }
}
