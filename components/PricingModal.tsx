"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./PricingModal.module.css"

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTheme?: "mastersunion" | "tetr"
}

export default function PricingModal({
  isOpen,
  onClose,
  selectedTheme = "mastersunion"
}: PricingModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleContactSales = () => {
    router.push('/contact')
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={styles.content}>
          <h2 className={styles.title}>Advanced Mode Pricing</h2>
          <p className={styles.subtitle}>Unlock powerful features with our flexible pricing plans</p>

          <div className={styles.pricingCards}>
            {/* Free Plan */}
            <div className={styles.pricingCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>Free</h3>
                <div className={styles.price}>
                  <span className={styles.priceAmount}>$0</span>
                  <span className={styles.pricePeriod}>/month</span>
                </div>
              </div>
              <ul className={styles.features}>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Basic page generation
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  5 generations per day
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Basic templates
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Community support
                </li>
              </ul>
              <button 
                className={`${styles.planButton} ${styles.planButtonSecondary}`}
                onClick={onClose}
              >
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
              <div className={styles.featuredBadge}>Most Popular</div>
              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>Pro</h3>
                <div className={styles.price}>
                  <span className={styles.priceAmount}>$29</span>
                  <span className={styles.pricePeriod}>/month</span>
                </div>
              </div>
              <ul className={styles.features}>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Advanced Mode access
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Unlimited generations
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Output sections panel
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Priority support
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Premium templates
                </li>
              </ul>
              <button className={`${styles.planButton} ${styles.planButtonPrimary}`}>
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className={styles.pricingCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>Enterprise</h3>
                <div className={styles.price}>
                  <span className={styles.priceAmount}>$99</span>
                  <span className={styles.pricePeriod}>/month</span>
                </div>
              </div>
              <ul className={styles.features}>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Everything in Pro
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Custom branding
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  API access
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Dedicated support
                </li>
                <li className={styles.feature}>
                  <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Team collaboration
                </li>
              </ul>
              <button 
                className={`${styles.planButton} ${styles.planButtonSecondary}`}
                onClick={handleContactSales}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

