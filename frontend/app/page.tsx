"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

import { useRouter } from "next/navigation"
import { getAuthUrl, checkAuthStatus } from "@/lib/api"
import { useState, useEffect } from "react"

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const status = await checkAuthStatus()
      if (status.authenticated) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Auth check failed", error)
    }
  }

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const authUrl = await getAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error("Login failed:", error)
      setLoading(false)
    }
  }
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[80%] rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-[100px] animate-pulse" />
        <div className="absolute -bottom-[40%] -right-[20%] h-[80%] w-[80%] rounded-full bg-gradient-to-tl from-accent/30 via-primary/20 to-transparent blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[60%] w-[60%] rounded-full bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-[80px] animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Logo/Brand */}
          <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Form<span className="text-primary animate-in fade-in duration-1000 delay-200">AI</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground animate-in fade-in duration-700 delay-300">
              Create intelligent forms with AI
            </p>
          </div>

          {/* Glassmorphic Card */}
          <div className="rounded-2xl border border-border bg-card/40 p-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="space-y-6">
              <div className="space-y-3 text-center animate-in fade-in duration-500 delay-300">
                <h2 className="text-3xl font-semibold tracking-tight text-card-foreground">
                  Welcome to FormAI
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sign in with your Google account to start creating intelligent forms powered by AI
                </p>
              </div>

              {/* Google Sign In */}
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-14 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:scale-[1.02] border border-border/50 text-card-foreground font-semibold text-base transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 delay-400 shadow-lg hover:shadow-xl"
                size="lg"
              >
                {loading ? (
                  <span className="animate-pulse">Connecting...</span>
                ) : (
                  <>
                    <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>

              <div className="pt-2 text-center text-xs text-muted-foreground/80 animate-in fade-in duration-500 delay-500">
                Secure authentication powered by Google
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground animate-in fade-in duration-500 delay-800">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline hover:text-foreground transition-colors duration-200">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-foreground transition-colors duration-200">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
