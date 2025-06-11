import { signIn } from "next-auth/react";

export function SignInPrompt() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-neutral-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome to AI Chat</h1>
      <p className="text-neutral-400 mb-8">Sign in to start chatting with AI</p>
      <button
        onClick={() => signIn("github")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
