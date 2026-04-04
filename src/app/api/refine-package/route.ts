// import { refineLaunchPackage } from "@/server/launch/engine";
// import type { LaunchPackageResponse } from "@/types/launch";

export const runtime = "nodejs";

export async function POST(request: Request) {
  void request;

  // Follow-up chat refinement is intentionally paused for now.
  // The implementation remains commented here for the next phase.
  //
  // try {
  //   const body = (await request.json()) as {
  //     payload: LaunchPackageResponse;
  //     history: Array<{ role: "user" | "assistant"; content: string }>;
  //     question: string;
  //   };
  //
  //   const answer = await refineLaunchPackage({
  //     brief: body.payload.brief,
  //     research: body.payload.research,
  //     launchPackage: body.payload.package,
  //     history: body.history,
  //     question: body.question,
  //   });
  //
  //   return Response.json({ answer });
  // } catch (error) {
  //   const message =
  //     error instanceof Error
  //       ? error.message
  //       : "Unable to refine launch package.";
  //
  //   return Response.json({ error: message }, { status: 500 });
  // }

  return Response.json(
    { error: "Follow-up chat is paused for now." },
    { status: 501 },
  );
}
