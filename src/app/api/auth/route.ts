import { fetchAction } from "convex/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/get-error-message";

const cookieConfig = {
  maxAge: 60 * 60 * 24 * 30,
};

function jsonResponse(body: unknown, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
    status,
  });
}

function getCookieNames(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const isLocalhost =
    host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const prefix = isLocalhost ? "" : "__Host-";

  return {
    refreshToken: `${prefix}__convexAuthRefreshToken`,
    token: `${prefix}__convexAuthJWT`,
    verifier: `${prefix}__convexAuthOAuthVerifier`,
  };
}

function applyCookie(
  response: NextResponse,
  name: string,
  value: string | null,
  request: NextRequest,
) {
  const host = request.headers.get("host") ?? "";
  const isLocalhost =
    host.startsWith("localhost") || host.startsWith("127.0.0.1");

  if (value === null) {
    response.cookies.set(name, "", {
      expires: new Date(0),
      httpOnly: true,
      maxAge: undefined,
      path: "/",
      sameSite: "lax",
      secure: !isLocalhost,
    });
    return;
  }

  response.cookies.set(name, value, {
    httpOnly: true,
    maxAge: cookieConfig.maxAge,
    path: "/",
    sameSite: "lax",
    secure: !isLocalhost,
  });
}

function clearAuthCookies(response: NextResponse, request: NextRequest) {
  const names = getCookieNames(request);
  applyCookie(response, names.token, null, request);
  applyCookie(response, names.refreshToken, null, request);
  applyCookie(response, names.verifier, null, request);
}

function setAuthCookies(
  response: NextResponse,
  request: NextRequest,
  tokens: { refreshToken: string; token: string } | null,
) {
  const names = getCookieNames(request);

  if (tokens === null) {
    clearAuthCookies(response, request);
    return;
  }

  applyCookie(response, names.token, tokens.token, request);
  applyCookie(response, names.refreshToken, tokens.refreshToken, request);
  applyCookie(response, names.verifier, null, request);
}

export async function POST(request: NextRequest) {
  const { action, args } = (await request.json()) as {
    action?: string;
    args?: Record<string, unknown> & {
      params?: Record<string, unknown>;
      refreshToken?: string;
    };
  };

  if (action !== "auth:signIn" && action !== "auth:signOut") {
    return jsonResponse({ error: "Invalid action" }, 400);
  }

  const names = getCookieNames(request);
  const token = request.cookies.get(names.token)?.value;
  const refreshToken = request.cookies.get(names.refreshToken)?.value;

  if (action === "auth:signIn") {
    const nextArgs = { ...(args ?? {}) };

    if (nextArgs.refreshToken !== undefined) {
      if (!refreshToken) {
        return jsonResponse({ tokens: null });
      }

      nextArgs.refreshToken = refreshToken;
    }

    try {
      const result = (await fetchAction(
        "auth:signIn" as never,
        nextArgs as never,
        {
          token:
            nextArgs.refreshToken !== undefined ||
            nextArgs.params?.code !== undefined
              ? undefined
              : token,
        },
      )) as {
        redirect?: string;
        tokens?: { refreshToken: string; token: string } | null;
      };

      if (result && typeof result === "object" && "redirect" in result) {
        return jsonResponse({ redirect: result.redirect });
      }

      if (result && typeof result === "object" && "tokens" in result) {
        const response = jsonResponse({
          tokens:
            result.tokens !== null && result.tokens !== undefined
              ? { refreshToken: "dummy", token: result.tokens.token }
              : null,
        });
        setAuthCookies(
          response,
          request,
          result.tokens === undefined ? null : result.tokens,
        );
        return response;
      }

      return jsonResponse(result);
    } catch (error) {
      const response = jsonResponse(
        {
          error: getErrorMessage(
            error,
            "Unable to authenticate. Check your details and try again.",
          ),
        },
        400,
      );
      clearAuthCookies(response, request);
      return response;
    }
  }

  try {
    await fetchAction("auth:signOut" as never, (args ?? {}) as never, {
      token,
    });
  } catch {
    // Clear local cookies even if the remote sign-out fails.
  }

  const response = jsonResponse(null);
  clearAuthCookies(response, request);
  return response;
}
