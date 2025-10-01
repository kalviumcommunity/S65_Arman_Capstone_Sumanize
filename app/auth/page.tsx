"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { GithubLogo } from "@phosphor-icons/react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: name || email.split('@')[0],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // After successful registration, sign in the user
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Registration successful, but login failed. Please try logging in.")
      } else {
        const session = await getSession()
        if (session) {
          router.push("/")
        }
      }
    } catch (error) {
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError("Invalid email or password")
        } else {
          // Check session to confirm login
          const session = await getSession()
          if (session) {
            router.push("/")
          }
        }
      } else {
        await handleRegister()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setLoading(true)
    try {
      await signIn("github", { callbackUrl: "/" })
    } catch {
      setError("Failed to sign in with GitHub")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#86B0BD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-stone-900 mb-2">Sumanize</h1>
          <h2 className="mt-2 text-center text-2xl font-bold text-stone-800">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-sm space-y-3">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-[#B8C4A9] placeholder-stone-600 text-stone-900 rounded-lg bg-[#FFF0DD] focus:outline-none focus:ring-2 focus:ring-[#6FA4AF] focus:border-[#6FA4AF] focus:z-10 text-base"
                  placeholder="Full Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-[#B8C4A9] placeholder-stone-600 text-stone-900 rounded-lg bg-[#FFF0DD] focus:outline-none focus:ring-2 focus:ring-[#6FA4AF] focus:border-[#6FA4AF] focus:z-10 text-base"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-[#B8C4A9] placeholder-stone-600 text-stone-900 rounded-lg bg-[#FFF0DD] focus:outline-none focus:ring-2 focus:ring-[#6FA4AF] focus:border-[#6FA4AF] focus:z-10 text-base"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-[#B8C4A9] placeholder-stone-600 text-stone-900 rounded-lg bg-[#FFF0DD] focus:outline-none focus:ring-2 focus:ring-[#6FA4AF] focus:border-[#6FA4AF] focus:z-10 text-base"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-700 bg-red-100 border-2 border-red-300 rounded-lg px-4 py-2 text-sm text-center font-medium">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-[#6FA4AF] hover:bg-[#5a8a94] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6FA4AF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : (isLogin ? "Sign in" : "Sign up")}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[#B8C4A9]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#86B0BD] text-stone-800 font-medium">Or continue with</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border-2 border-[#B8C4A9] text-base font-semibold rounded-lg text-stone-900 bg-[#FFF0DD] hover:bg-[#f5e5cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6FA4AF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <GithubLogo className="w-5 h-5 mr-2" weight="fill" />
              Continue with GitHub
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
                setConfirmPassword("")
                setName("")
              }}
              className="text-stone-900 hover:text-stone-700 text-sm font-medium underline decoration-2 decoration-[#6FA4AF] underline-offset-2 hover:decoration-[#5a8a94] transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
