"use client"

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

const initialFormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
}


function parseJwt(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}



type AuthMode = "login" | "signup" | "forgot"
type PasswordField = "password" | "confirmPassword"

type IconProps = {
  className?: string
}

const EyeIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 19c-7 0-11-7-11-7a18 18 0 013.22-4.24" />
    <path d="M6.12 6.12A10.07 10.07 0 0112 5c7 0 11 7 11 7a17.8 17.8 0 01-1.67 2.63" />
    <path d="M1 1l22 22" />
    <path d="M9.88 9.88A3 3 0 0114.12 14.12" />
  </svg>
)

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [formValues, setFormValues] = useState(initialFormState)
  const [passwordVisibility, setPasswordVisibility] = useState<Record<PasswordField, boolean>>({
    password: false,
    confirmPassword: false,
  })
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const SIGNUP_API = "https://api.mastersunion.org/api/registerAIUser"
  const LOGIN_API = "https://api.mastersunion.org/api/loginAIUser"
  const GOOGLE_CLIENT_ID = "512709816866-vh5vpmcvll1l6qamudif1kceqq72059c.apps.googleusercontent.com"

  // Check if authenticated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthenticated = localStorage.getItem("mu_auth") === "true"
      if (isAuthenticated) {
        router.push("/")
      }
    }
  }, [router])

  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if script is already loaded
    const scriptId = "google-identity-script"
    if (document.getElementById(scriptId)) {
      initializeGoogleAuth()
      return
    }

    const script = document.createElement("script")
    script.id = scriptId
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log("Google Identity Services script loaded")
      initializeGoogleAuth()
    }
    script.onerror = () => {
      console.error("Failed to load Google Identity Services script")
      setError("Failed to load Google Sign-In. Please refresh the page.")
    }
    
    document.body.appendChild(script)

    return () => {
      const script = document.getElementById(scriptId)
      if (script) script.remove()
    }
  }, [])

  // Initialize Google Auth
  const initializeGoogleAuth = () => {
    if (typeof window === "undefined" || !window.google) {
      return
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        ux_mode: "popup",
      })

      // Render the Google Sign-In button
      renderGoogleButton()
      
    } catch (error) {
      console.error("Error initializing Google Auth:", error)
    }
  }

  // Render Google Sign-In button
  const renderGoogleButton = () => {
    if (typeof window === "undefined" || !window.google || !window.google.accounts) return

    const container = document.getElementById("googleSignInButton")
    if (!container) return

    try {
      window.google.accounts.id.renderButton(
        container,
        {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: "100%", // Full width to match your custom button
        }
      )
      
      // Also show the One Tap prompt for returning users
    } catch (error) {
      console.error("Error rendering Google button:", error)
    }
  }

  // Re-render Google button when mode changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.google && window.google.accounts) {
      setTimeout(renderGoogleButton, 100)
    }
  }, [mode])







  // Handle Google credential response
 const handleGoogleCredentialResponse = async (response: any) => {
  setIsGoogleLoading(true);
  setError("");
  setMessage("");

  try {
    const token = response?.credential;
    if (!token) throw new Error("No credential received from Google");

    const decoded = parseJwt(token);
    const { email, name } = decoded || {};
    if (!email) throw new Error("No email received from Google");

    const emailLower = email.toLowerCase();

    // First try login (quick path)
    let res = await fetch(LOGIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailLower, isGoogle: true }),
    });

    // If login returned 200 and success true -> done
    if (res.ok) {
      const data = await safeParseJson(res);
      if (data?.success) {
        persistAndRedirect(data);
        return;
      }
      // if success false but meaningful message (e.g. user not found), continue to signup
      if (data?.message && /not found|not exists|doesn't exist/i.test(data.message)) {
        // fall through to signup
      } else {
        // some other server-side error — show and stop
        throw new Error(data?.message || "Login failed");
      }
    } else {
      // non-OK from login — try signup (maybe user doesn't exist)
      // but if 5xx, we still may try signup — let's attempt signup
    }

    // Try signup
    res = await fetch(SIGNUP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailLower, fullName: name, isGoogle: true }),
    });

    if (!res.ok) {
      const data = await safeParseJson(res);
      throw new Error(data?.message || `Signup failed (status ${res.status})`);
    }

    const data = await safeParseJson(res);
    if (!data?.success) throw new Error(data?.message || "Signup failed");

    // success
    persistAndRedirect(data);

  } catch (err: any) {
    console.error("Google auth error:", err);
    setError(err?.message || "Server error");
  } finally {
    setIsGoogleLoading(false);
  }
};

// helper: parse JSON safely
async function safeParseJson(res: Response) {
  try {
    return await res.json();
  } catch (e) {
    return { success: false, message: `Invalid JSON response (status ${res.status})` };
  }
}

// helper: save session and redirect
function persistAndRedirect(data: any) {
  localStorage.setItem("mu_auth", "true");
  localStorage.setItem("mu_email", data.data.email);
  localStorage.setItem("mu_fullName", data.data.fullName || data.data.email.split("@")[0]);
  localStorage.setItem("mu_isGoogle", "true");
  router.push("/");
}


  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) return
    setMode(nextMode)
    setError("")
    setMessage("")
    setIsLoading(false)
    setIsGoogleLoading(false)
    setPasswordVisibility({
      password: false,
      confirmPassword: false,
    })
    setFormValues((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }))
  }

  const handleInputChange =
    (field: keyof typeof initialFormState) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setFormValues((prev) => ({
          ...prev,
          [field]: event.target.value,
        }))
        setError("")
        setMessage("")
      }

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const primaryButtonLabel = () => {
    if (isLoading) {
      if (mode === "login") return "Signing in..."
      if (mode === "signup") return "Creating account..."
      return "Sending link..."
    }
    if (mode === "login") return "Sign in"
    if (mode === "signup") return "Create account"
    return "Send reset link"
  }

  const isSubmitDisabled = () => {
    if (isLoading || isGoogleLoading) return true
    if (mode === "login") {
      return !formValues.email.trim() || !formValues.password.trim()
    }
    if (mode === "signup") {
      return (
        !formValues.fullName.trim() ||
        !formValues.email.trim() ||
        !formValues.password.trim() ||
        !formValues.confirmPassword.trim()
      )
    }
    return !formValues.email.trim()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) return

    setError("")
    setMessage("")
    setIsLoading(true)

    const email = formValues.email.trim().toLowerCase()
    const password = formValues.password.trim()
    const fullName = formValues.fullName.trim()

    try {
      if (mode === "login") {
        const res = await fetch(LOGIN_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!data.success) {
          setError(data.message || "Invalid email or password")
          setIsLoading(false)
          return
        }

        localStorage.setItem("mu_auth", "true")
        localStorage.setItem("mu_email", data.data.email)
        const name = data.data.fullName || data.data.email.split("@")[0]
        localStorage.setItem("mu_fullName", name)
        
        if (data.data.token) {
          localStorage.setItem("mu_token", data.data.token)
        }
        
        router.push("/")
        return
      }

      if (mode === "signup") {
        if (!fullName || fullName.length < 2) {
          setError("Please enter a valid full name.")
          setIsLoading(false)
          return
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters.")
          setIsLoading(false)
          return
        }
        if (password !== formValues.confirmPassword) {
  setError("Passwords do not match.");
  setIsLoading(false);
  return;
}


        const res = await fetch(SIGNUP_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            confirmPassword: formValues.confirmPassword, 
            fullName,
            isGoogle: false
          }),
        })

        const data = await res.json()

        if (!data.success) {
          setError(data.message || "Signup failed")
          setIsLoading(false)
          return
        }

        localStorage.setItem("mu_auth", "true")
        localStorage.setItem("mu_email", data.data.email)
        const name = data.data.fullName || data.data.email.split("@")[0]
        localStorage.setItem("mu_fullName", name)
        
        if (data.data.token) {
          localStorage.setItem("mu_token", data.data.token)
        }

        setMessage("Account created successfully! Redirecting...")
        setTimeout(() => router.push("/"), 600)
        return
      }

      if (mode === "forgot") {
        setMessage(`If ${email} exists, you will receive reset instructions.`)
        setIsLoading(false)
        return
      }

    } catch (error) {
      console.error(error)
      setError("Network Error! Please try again.")
      setIsLoading(false)
    }
  }

  const renderEmailField = () => (
    <label className={styles.fieldLabel}>
      Email address
      <input
        type="email"
        value={formValues.email}
        onChange={handleInputChange("email")}
        placeholder="name@mastersunion.org"
        className={styles.input}
        autoComplete="email"
        disabled={isLoading || isGoogleLoading}
        required
      />
    </label>
  )

  const renderPasswordField = ({
    field = "password",
    label,
    placeholder,
    autoComplete,
  }: {
    field?: PasswordField
    label?: string
    placeholder?: string
    autoComplete?: string
  } = {}) => {
    const finalLabel = label ?? (field === "confirmPassword" ? "Confirm password" : "Password")
    const finalPlaceholder =
      placeholder ??
      (field === "confirmPassword" ? "Re-enter your password" : "Enter your password")
    const finalAutoComplete =
      autoComplete ?? (field === "confirmPassword" ? "new-password" : "current-password")
    const inputType = passwordVisibility[field] ? "text" : "password"

    return (
      <label className={`${styles.fieldLabel} ${styles.passwordField}`}>
        {finalLabel}
        <div className={styles.passwordInputWrapper}>
          <input
            type={inputType}
            value={formValues[field]}
            onChange={handleInputChange(field)}
            placeholder={finalPlaceholder}
            className={`${styles.input} ${styles.passwordInput}`}
            autoComplete={finalAutoComplete}
            disabled={isLoading || isGoogleLoading}
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => togglePasswordVisibility(field)}
            disabled={isLoading || isGoogleLoading}
            aria-label={passwordVisibility[field] ? "Hide password" : "Show password"}
            title={passwordVisibility[field] ? "Hide password" : "Show password"}
          >
            {passwordVisibility[field] ? (
              <EyeOffIcon className={styles.passwordToggleIcon} />
            ) : (
              <EyeIcon className={styles.passwordToggleIcon} />
            )}
          </button>
        </div>
      </label>
    )
  }

  const renderFullNameField = () => (
    <label className={styles.fieldLabel}>
      Full name
      <input
        type="text"
        value={formValues.fullName}
        onChange={handleInputChange("fullName")}
        placeholder="Jane Doe"
        className={styles.input}
        autoComplete="name"
        disabled={isLoading || isGoogleLoading}
        required
      />
    </label>
  )

  const showGoogleButton = mode !== "forgot"

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoContainer}>
          <img
            loading="lazy"
            src="https://files.mastersunion.link/resources/animateds/logoanimationblack.gif"
            alt="Masters' Union logo"
            className={styles.logo}
          />
        </div>
        <h1 className={styles.title}>
          {mode === "signup" ? "Create your WebStudio ID" : "Welcome back to WebStudio"}
        </h1>
        <p className={styles.subtitle}>
          {mode === "signup"
            ? "Spin up a new account with the same MU Labs theme you already love."
            : "Access the Masters' Union creative stack to keep building faster."}
        </p>

        <div className={styles.modeSwitch}>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === "login" ? styles.modeButtonActive : ""
              }`}
            onClick={() => handleModeChange("login")}
            disabled={isLoading || isGoogleLoading}
          >
            Login
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === "signup" ? styles.modeButtonActive : ""
              }`}
            onClick={() => handleModeChange("signup")}
            disabled={isLoading || isGoogleLoading}
          >
            Sign up
          </button>
        </div>

        {showGoogleButton && (
          <>
            {/* Custom Google Button */}
            <button
              type="button"
              className={styles.googleButton}
              onClick={() => window.google.accounts.id.prompt()}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? "Connecting..." : (
                mode === "signup" ? "Sign up with Google" : "Continue with Google"
              )}
            </button>
            
            {/* Hidden container for Google's button - will be rendered by Google */}
            <div id="googleSignInContainer" style={{ display: 'none' }}>
              <div id="googleSignInButton"></div>
            </div>
          </>
        )}

        {showGoogleButton && (
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or continue with email</span>
            <span className={styles.dividerLine} />
          </div>
        )}

        {!showGoogleButton && (
          <div className={styles.infoBanner}>
            <p>
              Can't remember your password? We'll email you instructions to reset it
              securely.
            </p>
          </div>
        )}

        {error && (
          <p className={`${styles.statusMessage} ${styles.statusError}`}>{error}</p>
        )}
        {message && (
          <p className={`${styles.statusMessage} ${styles.statusSuccess}`}>{message}</p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "signup" && (
            <>
              {renderFullNameField()}
              {renderEmailField()}
              {renderPasswordField({
                field: "password",
                autoComplete: "new-password",
                placeholder: "Create a password",
              })}
              {renderPasswordField({
                field: "confirmPassword",
                autoComplete: "new-password",
              })}
            </>
          )}

          {mode === "login" && (
            <>
              {renderEmailField()}
              {renderPasswordField()}
            </>
          )}

          {mode === "forgot" && (
            <>
              {renderEmailField()}
            </>
          )}

          <div className={styles.helperRow}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => handleModeChange(mode === "forgot" ? "login" : "forgot")}
              disabled={isLoading || isGoogleLoading}
            >
              {mode === "forgot" ? "Back to login" : "Forgot password?"}
            </button>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={isSubmitDisabled()}
          >
            {primaryButtonLabel()}
          </button>
        </form>

        <p className={styles.supportText}>
          Need workspace access?{" "}
          <a href="mailto:labs@mastersunion.org" className={styles.supportLink}>
            Contact MU Labs
          </a>
        </p>
      </div>
    </div>
  )
}