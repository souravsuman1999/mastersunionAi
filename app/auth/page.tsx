"use client"

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

const CORRECT_PASSWORD = "mu12356"
const USER_STORE_KEY = "mu_auth_users"

const initialFormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
}

type AuthMode = "login" | "signup" | "forgot"
type PasswordField = "password" | "confirmPassword"
type StoredUser = {
  fullName: string
  password: string
}
type StoredUsers = Record<string, StoredUser>

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

const readStoredUsers = (): StoredUsers => {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(USER_STORE_KEY)
    return raw ? (JSON.parse(raw) as StoredUsers) : {}
  } catch {
    return {}
  }
}

const writeStoredUsers = (users: StoredUsers) => {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_STORE_KEY, JSON.stringify(users))
}

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
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthenticated = localStorage.getItem("mu_auth") === "true"
      if (isAuthenticated) {
        router.push("/")
      }
    }
  }, [router])

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) return
    setMode(nextMode)
    setError("")
    setMessage("")
    setIsLoading(false)
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
    if (isLoading) return true
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

    await new Promise((resolve) => setTimeout(resolve, 400))

    const friendlyEmail = formValues.email.trim()
    const normalizedEmail = friendlyEmail.toLowerCase()

    if (mode === "login") {
      const storedUsers = readStoredUsers()
      const existingUser = storedUsers[normalizedEmail]

      if (existingUser && existingUser.password === formValues.password) {
        localStorage.setItem("mu_auth", "true")
        router.push("/")
        return
      }

      if (formValues.password === CORRECT_PASSWORD) {
        localStorage.setItem("mu_auth", "true")
        router.push("/")
        return
      }
      setError("Incorrect email or password. Please try again.")
      setIsLoading(false)
      return
    }

    if (mode === "signup") {
      const storedUsers = readStoredUsers()
      if (storedUsers[normalizedEmail]) {
        setError("This email already has access. Try logging in instead.")
        setIsLoading(false)
        return
      }

      const trimmedFullName = formValues.fullName.trim()

      if (formValues.password.length < 6) {
        setError("Use at least 6 characters for your password.")
        setIsLoading(false)
        return
      }
      if (formValues.password !== formValues.confirmPassword) {
        setError("Passwords do not match.")
        setIsLoading(false)
        return
      }
      const updatedUsers: StoredUsers = {
        ...storedUsers,
        [normalizedEmail]: {
          fullName: trimmedFullName,
          password: formValues.password,
        },
      }
      writeStoredUsers(updatedUsers)
      localStorage.setItem("mu_auth", "true")
      router.push("/")
      return
    }

    const storedUsers = readStoredUsers()
    const hasAccount = Boolean(storedUsers[normalizedEmail])
    setMessage(
      hasAccount
        ? `We've sent a secure reset link to ${friendlyEmail}. Check your inbox.`
        : `If an account exists for ${friendlyEmail}, you'll receive reset instructions shortly.`,
    )
    setIsLoading(false)
  }

  const handleGoogleAuth = async () => {
    if (isLoading) return
    setError("")
    setMessage("")
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 350))
    localStorage.setItem("mu_auth", "true")
    router.push("/")
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
        disabled={isLoading}
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
            disabled={isLoading}
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => togglePasswordVisibility(field)}
            disabled={isLoading}
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
        disabled={isLoading}
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
            className={`${styles.modeButton} ${
              mode === "login" ? styles.modeButtonActive : ""
            }`}
            onClick={() => handleModeChange("login")}
            disabled={isLoading}
          >
            Login
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${
              mode === "signup" ? styles.modeButtonActive : ""
            }`}
            onClick={() => handleModeChange("signup")}
            disabled={isLoading}
          >
            Sign up
          </button>
        </div>

        {showGoogleButton && (
          <button
            type="button"
            className={styles.googleButton}
            onClick={handleGoogleAuth}
            disabled={isLoading}
          >
            <span className={styles.googleIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21.6 12.2273C21.6 11.5182 21.5364 10.8364 21.4182 10.1818H12V14.05H17.3818C17.15 15.3 16.4455 16.3409 15.3818 17.0591V19.5727H18.6182C20.5091 17.8364 21.6 15.2727 21.6 12.2273Z"
                  fill="#4285F4"
                />
                <path
                  d="M11.9998 22C14.6998 22 16.9635 21.1045 18.618 19.5727L15.3817 17.0591C14.4908 17.6591 13.3453 18.0227 11.9998 18.0227C9.39526 18.0227 7.1908 16.2682 6.39526 13.9091H3.05896V16.4954C4.70444 19.7727 8.0908 22 11.9998 22Z"
                  fill="#34A853"
                />
                <path
                  d="M6.39545 13.9091C6.19545 13.3091 6.09091 12.6682 6.09091 12C6.09091 11.3318 6.19545 10.6909 6.39545 10.0909V7.50455H3.05909C2.38545 8.85455 2 10.3818 2 12C2 13.6182 2.38545 15.1455 3.05909 16.4955L6.39545 13.9091Z"
                  fill="#FBBC05"
                />
                <path
                  d="M11.9998 5.97727C13.4634 5.97727 14.7816 6.48182 15.8361 7.48182L18.6907 4.62727C16.959 3.01818 14.6953 2 11.9998 2C8.0908 2 4.70444 4.22727 3.05994 7.50455L6.39625 10.0909C7.1918 7.73182 9.39626 5.97727 11.9998 5.97727Z"
                  fill="#EA4335"
                />
              </svg>
            </span>
            {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
          </button>
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
              disabled={isLoading}
            >
              {mode === "forgot" ? "Back to login" : "Forgot password?"}
            </button>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitDisabled()}>
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

