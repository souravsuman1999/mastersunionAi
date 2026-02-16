import { type NextRequest, NextResponse } from "next/server"
import { getDesignSystemPrompt, getTetrDesignSystemPrompt } from "@/config/design-system"

type GenerationTheme = "mastersunion" | "tetr" | "free"

async function generateWebpageOnServer(
  prompt: string,
  baseHtml?: string,
  imageData?: string,
  theme: GenerationTheme = "free",
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set")
  }

  // Log API key status (without exposing the actual key)
  console.log("[v0] API key status:", {
    exists: !!apiKey,
    length: apiKey.length,
    startsWithSkAnt: apiKey.startsWith("sk-ant-"),
    firstChars: apiKey.substring(0, 7),
  })

  if (!apiKey.startsWith("sk-ant-")) {
    console.warn("[v0] Warning: API key format may be incorrect. Anthropic API keys typically start with 'sk-ant-'")
  }

  const hasBaseHtml = typeof baseHtml === "string" && baseHtml.trim().length > 0

  // Separate design system prompts for different themes
  const designSystemPrompt =
    theme === "tetr" ? getTetrDesignSystemPrompt() : theme === "mastersunion" ? getDesignSystemPrompt() : ""

  // FREE MODE - Completely separate instructions (only applies when theme === "free")
  const freeModeInstructions = theme === "free" ? `
CRITICAL FOR FREE MODE:
- You have complete creative freedom - use any design approach, frameworks (Tailwind CSS, Bootstrap, etc.), or libraries you need
- You are allowed to build complex, application-style experiences (dashboards, admin panels, landing pages, multi-step flows, etc.)
- MANDATORY: Every webpage MUST have AT LEAST 6 distinct sections (e.g., Hero, Features, Services, About, Testimonials, Contact, Gallery, Pricing, Team, Portfolio, etc.)
- CRITICAL IMAGE REQUIREMENTS - IMAGES ARE MANDATORY:
  - EVERY section MUST include relevant, contextually appropriate images - NO text-only sections
  - Hero section: MUST have a high-quality hero image (background image or featured image) related to the content
  - Feature cards: EVERY feature card MUST have a relevant image icon or illustration
  - Service cards: EVERY service card MUST have an image representing that service
  - Product cards: EVERY product card MUST have product images
  - Team section: EVERY team member MUST have a profile photo
  - Testimonials: EVERY testimonial SHOULD have a customer photo or avatar
  - About section: MUST include relevant images (office photos, team photos, process illustrations, etc.)
  - Gallery/Portfolio: MUST have multiple high-quality images
  - Contact section: SHOULD include location images, office photos, or relevant visuals
  - Dashboard/Admin panels: MUST include relevant icons, illustrations, or data visualization images
  - Forms: Login/signup forms SHOULD have background images or side illustrations
  - Use ONLY high-quality, professional images from Unsplash (https://images.unsplash.com), Pexels (https://images.pexels.com), or similar free sources
  - Images MUST be contextually relevant to the content - if it's a tech product, use tech images; if it's a restaurant, use food images; if it's a fitness app, use fitness images
  - Search for images using relevant keywords that match the content (e.g., "technology", "business", "fitness", "food", "education", etc.)
  - Use proper <img> tags with src attributes pointing to publicly accessible image URLs
  - All images MUST have descriptive alt text for accessibility
  - Image sizes: Use appropriate dimensions (hero images: 1920x1080 or similar, cards: 400x300 or similar, avatars: 200x200)
  - NEVER create a section without images - every section should be visually rich
  - If user mentions a specific topic/industry, use images related to that topic/industry
  - Background images: Use relevant background images for hero sections, feature sections, or full-width sections
  - Icons: Use modern icon sets (Font Awesome, Heroicons) or custom SVG icons for features/services
  - Image quality: Only use high-resolution, professional-looking images - avoid low-quality or pixelated images
- MANDATORY PREMIUM DESIGN REQUIREMENTS:
  - Design MUST have a premium, professional, high-end feel - think modern SaaS products, luxury brands, enterprise software
  - Use sophisticated color palettes: prefer dark themes with accent colors, or light themes with subtle gradients and shadows
  - Typography: Use modern, clean fonts (Inter, Poppins, Montserrat, Roboto, or similar) with proper font weights (300-700 range)
  - Spacing: Generous whitespace, proper padding (minimum 24px-48px between sections, 16px-24px within elements)
  - Shadows: Use subtle, layered shadows for depth (box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.1) for cards)
  - Borders: Subtle borders (1px solid rgba(0,0,0,0.1) or rgba(255,255,255,0.1)) with border-radius (8px-16px for cards, 4px-8px for buttons)
  - Gradients: Use modern gradients sparingly for accents (linear-gradient for buttons, backgrounds, or text)
  - Hover effects: Smooth transitions (transition: all 0.3s ease) with subtle transforms (transform: translateY(-2px), scale(1.02))
  - Cards: Elevated cards with shadows, rounded corners, proper padding, and hover effects
  - Buttons: Modern button styles with hover states, proper padding (12px-24px), rounded corners, and smooth transitions
  - Forms: Clean, modern form inputs with focus states, proper spacing, and professional styling
  - Layout: Use CSS Grid or Flexbox for clean, organized layouts with proper alignment
  - Responsive: Ensure mobile-first responsive design with breakpoints (max-width: 768px for mobile, 1024px for tablet)
  - Animations: Subtle, smooth animations (fade-in, slide-up) using CSS transitions or keyframes - avoid jarring movements
  - Color contrast: Ensure proper contrast ratios for accessibility (WCAG AA minimum)
  - Icons: Use modern icon sets (Font Awesome, Heroicons, or inline SVG) with consistent sizing and styling
  - Professional polish: Every element should feel refined - no rough edges, consistent spacing, aligned elements
- If the user explicitly asks for multiple pages (e.g. "Home, About Us, Contact Us"), create a multi-page style experience:
  - Include a clear navigation (navbar/sidebar) with links for each page
  - Implement client-side routing using anchors, hash-based routing, or simple show/hide sections so it behaves like multiple pages
  - Each page (Home/About/Contact/etc.) should have its own well-structured section/content with at least 6 sections per page
  - Only create multiple pages when the user clearly asks for them; otherwise focus on a single main page with at least 6 sections
- For full-stack style apps in free mode:
  - You may implement rich front-end logic (forms, auth-like flows, CRUD UIs, dashboards, filters, search, etc.) using JavaScript
  - You may simulate a backend using localStorage/IndexedDB/in-memory data, or call external HTTP APIs if the user specifies them
  - Keep everything runnable from a single HTML file (no separate server files) so it works directly in the browser/iframe
- MANDATORY FOR AUTHENTICATION/LOGIN/SIGNUP FEATURES:
  - When user requests login, signup, or authentication features, you MUST create a FULLY FUNCTIONAL authentication system:
  - Signup functionality:
    * Create a signup form with fields (email, password, name, etc.) with proper validation
    * Validate email format, password strength (min 6-8 characters), and required fields
    * Store user data in localStorage with key like 'users' (array of user objects)
    * Hash passwords (simple hash or use a basic encoding) before storing
    * Show success/error messages
    * After successful signup, automatically log the user in and redirect to dashboard/home
  - Login functionality:
    * Create a login form with email/username and password fields
    * Validate credentials against stored users in localStorage
    * Compare hashed passwords correctly
    * Set a session token or flag in localStorage (e.g., 'currentUser' or 'isLoggedIn')
    * Show error messages for invalid credentials
    * After successful login, redirect to protected pages/dashboard
  - Session management:
    * Check authentication status on page load
    * Store current user data in localStorage (e.g., 'currentUser' object)
    * Implement logout functionality that clears session data
    * Protect routes/pages - show login page if not authenticated, show dashboard if authenticated
  - User interface:
    * Show different UI for logged-in vs logged-out users (e.g., "Welcome [Name]" vs "Login" button)
    * Include logout button when user is logged in
    * Toggle between login/signup forms if needed
  - Data persistence:
    * Use localStorage.setItem() to store users array: localStorage.setItem('users', JSON.stringify(usersArray))
    * Use localStorage.getItem() to retrieve: JSON.parse(localStorage.getItem('users') || '[]')
    * Initialize empty array if no users exist
    * Update localStorage whenever a new user signs up
  - Form validation:
    * Client-side validation for all fields (required, email format, password match, etc.)
    * Show inline error messages
    * Prevent form submission if validation fails
  - CRITICAL: All authentication code MUST be fully functional and working - test the logic mentally:
    * Signup should actually save users to localStorage
    * Login should actually check credentials and set session
    * Logout should clear session
    * Protected pages should check authentication status
    * Forms should have proper event listeners and preventDefault()
    * All buttons should have working onClick handlers
- MANDATORY JAVASCRIPT REQUIREMENTS FOR FREE MODE:
  - You MUST write complete, working JavaScript code - NO placeholder code, NO TODO comments, NO incomplete functions
  - ALL JavaScript code MUST be inside <script> tags before </body>
  - Use vanilla JavaScript - you can use any modern JS features (ES6+, async/await, arrow functions, etc.)
  - Forms MUST have addEventListener('submit', function(e) { e.preventDefault(); ... }) to prevent page reload
  - Example signup form handler structure:
    document.getElementById('signupForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const name = document.getElementById('name').value;
      // Validation
      if (!email || !password || !name) { showError('All fields required'); return; }
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) { showError('Invalid email'); return; }
      if (password.length < 6) { showError('Password must be at least 6 characters'); return; }
      // Get existing users
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      // Check if user exists
      if (users.find(u => u.email === email)) { showError('User already exists'); return; }
      // Hash password and save
      const hashedPassword = btoa(password);
      const newUser = { id: Date.now(), email, password: hashedPassword, name };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      // Show success and redirect
      alert('Signup successful!');
      window.location.href = '#dashboard';
      loadPage();
    });
  - Example login form handler structure:
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      // Validation
      if (!email || !password) { showError('Email and password required'); return; }
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      // Find user
      const user = users.find(u => u.email === email);
      if (!user) { showError('Invalid email or password'); return; }
      // Check password
      if (btoa(password) !== user.password) { showError('Invalid email or password'); return; }
      // Set current user
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Redirect
      alert('Login successful!');
      window.location.href = '#dashboard';
      loadPage();
    });
  - Example authentication check on page load:
    function checkAuth() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (currentUser) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        document.getElementById('userName').textContent = currentUser.name;
      } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('dashboardSection').style.display = 'none';
      }
    }
    window.addEventListener('DOMContentLoaded', checkAuth);
  - Example logout function:
    function logout() {
      localStorage.removeItem('currentUser');
      alert('Logged out successfully');
      checkAuth();
    }
  - CRITICAL: All JavaScript MUST be complete and executable - every function must have a body, every event listener must be properly attached, every variable must be defined
  - Use getElementById, querySelector, addEventListener - standard DOM APIs
  - Test all code paths mentally: signup flow, login flow, logout flow, auth check flow
- ALWAYS use high-quality images when they enhance the design - use images from Unsplash, Pexels, or other free image sources
- For hero sections, backgrounds, feature images, testimonials, team photos, product images, etc. - ALWAYS include relevant, high-quality images
- Use proper <img> tags with src attributes pointing to publicly accessible image URLs
- Ensure all images have proper alt text for accessibility
- Use images liberally to make the page visually appealing and professional
- If the user provides an image, analyze it and use it prominently in the design
- Don't create text-only pages when images would improve the design - always include images where appropriate
- Every card, feature box, service item, product card, team member card, testimonial card, etc. MUST have an associated image
` : ""

  // Build system prompt based on theme
  let systemPrompt = `You are an expert web developer. Generate complete, valid HTML pages based on user requests.

`

  // Add design system prompt ONLY for mastersunion and tetr themes
  if (theme === "mastersunion" || theme === "tetr") {
    systemPrompt += `${designSystemPrompt}

`
  }

  // Add Free mode instructions ONLY for free theme (completely separate)
  if (theme === "free") {
    systemPrompt += `${freeModeInstructions}

`
  }

  // Common output rules for all themes
  systemPrompt += `IMPORTANT OUTPUT RULES:
- Return ONLY the complete HTML code (including <!DOCTYPE html>, <html>, <head>, and <body> tags)
- Include inline CSS in a <style> tag in the <head>
- Include all interactive behavior inside a <script> tag that appears before </body>. Use clean, modern, vanilla JavaScript (no frameworks besides Swiper) and respect the provided class names/data attributes.
- Make the page responsive and professional
- DO NOT include any explanations, markdown code blocks, or extra text
- The output should be ready to render directly in an iframe
- If existing HTML is provided, this is a CONTINUOUS conversation - preserve ALL existing structure, styles, and content unless explicitly asked to change them
- When updating existing HTML, treat it as an iterative improvement, not a replacement
- Maintain design consistency across versions
- If an image is provided, use it as a reference for design, layout, colors, styling, or content. Analyze the image carefully and incorporate relevant visual elements, color schemes, layout patterns, or design inspiration into the generated webpage.
- Ensure all images use proper <img> tags with src attributes and alt text for accessibility
`

  // Theme-specific rules
  if (theme === "mastersunion" || theme === "tetr") {
    systemPrompt += `- The CSS MUST follow the design system rules above
- ALWAYS use images when they enhance the design - include hero images, feature images, product photos, team photos, testimonials with photos, etc. Use high-quality images from Unsplash (https://images.unsplash.com), Pexels (https://images.pexels.com), or similar free image sources
`
  }

  if (theme === "free") {
    systemPrompt += `- CRITICAL FOR FREE MODE - JAVASCRIPT USAGE:
  * You MUST write complete, working JavaScript code - use any modern JavaScript features (ES6+, async/await, arrow functions, classes, etc.)
  * ALL forms MUST have proper event listeners: form.addEventListener('submit', function(e) { e.preventDefault(); ... })
  * ALL buttons MUST have click handlers: button.addEventListener('click', function() { ... })
  * Use standard DOM APIs: getElementById, querySelector, addEventListener, innerHTML, textContent, style, etc.
  * localStorage operations MUST be complete: localStorage.setItem('key', JSON.stringify(data)), JSON.parse(localStorage.getItem('key') || '[]')
  * All functions MUST have complete implementations - no empty functions or TODO comments
  * Test all code paths: every if/else, every function call, every event handler must work
  * For authentication: write complete signup/login/logout functions with full logic
- MANDATORY FOR FREE MODE: The webpage MUST contain AT LEAST 6 distinct sections (Hero, Features, Services, About, Testimonials, Contact, Gallery, Pricing, Team, Portfolio, FAQ, etc.)
- CRITICAL: IMAGES ARE MANDATORY IN EVERY GENERATION - NO EXCEPTIONS:
  * EVERY section MUST have relevant, contextually appropriate images - NEVER create text-only sections
  * Hero section: MUST include a high-quality hero image (background or featured image) related to the page topic
  * Feature cards: EVERY feature MUST have a relevant image/icon - search Unsplash/Pexels using keywords matching the feature
  * Service cards: EVERY service MUST have an image representing that service
  * Product cards: EVERY product MUST have product images
  * Team section: EVERY team member MUST have a profile photo
  * Testimonials: EVERY testimonial SHOULD have a customer photo/avatar
  * About section: MUST include relevant images (office, team, process illustrations)
  * Gallery/Portfolio: MUST have multiple high-quality, relevant images
  * Contact section: SHOULD include location images, office photos, or relevant visuals
  * Dashboard/Admin: MUST include relevant icons, illustrations, or data visualization images
  * Forms: Login/signup forms SHOULD have background images or side illustrations
  * Image relevance: Images MUST match the content context - tech products = tech images, restaurant = food images, fitness = fitness images
  * Image sources: Use ONLY high-quality images from Unsplash (https://images.unsplash.com/photo-...) or Pexels (https://images.pexels.com/photos/...)
  * Image search: Use relevant keywords when selecting images (e.g., if content is about "AI", use "artificial intelligence", "technology", "robot" images)
  * Image quality: Only use professional, high-resolution images - avoid low-quality or pixelated images
  * Image implementation: Use proper <img> tags with src attributes and descriptive alt text
  * Background images: Use relevant background images for hero sections and full-width sections
  * Icons: Use modern icon sets (Font Awesome, Heroicons) or custom SVG for features/services
  * NEVER skip images - every section must be visually rich with relevant images
  * If user mentions a specific topic/industry, ALL images must relate to that topic/industry
- PREMIUM DESIGN REQUIREMENTS FOR FREE MODE:
  * Design MUST look premium, professional, and high-end - comparable to top-tier SaaS products, luxury brands, or enterprise software
  * Use sophisticated color schemes: dark themes (#0a0a0a to #1a1a1a backgrounds) with vibrant accents, or light themes (#ffffff to #f8f9fa) with subtle grays
  * Typography: Modern sans-serif fonts (Inter, Poppins, Montserrat, Roboto) with proper hierarchy - large headings (32px-64px), body text (16px-18px), subtle text (14px)
  * Spacing: Generous whitespace - sections: 80px-120px padding, cards: 24px-32px padding, elements: 16px-24px gap
  * Shadows: Multi-layer shadows for depth - cards: box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.1); buttons: 0 2px 4px rgba(0,0,0,0.1)
  * Borders: Subtle borders with transparency - border: 1px solid rgba(0,0,0,0.08) or rgba(255,255,255,0.1)
  * Border radius: Modern rounded corners - cards: 12px-16px, buttons: 6px-8px, inputs: 6px-8px
  * Gradients: Use sparingly for premium feel - linear-gradient(135deg, #667eea 0%, #764ba2 100%) for buttons or backgrounds
  * Hover effects: Smooth, subtle interactions - transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform: translateY(-2px) or scale(1.02)
  * Cards: Elevated design with shadows, rounded corners, proper padding, hover lift effect, and clean borders
  * Buttons: Modern styles with hover states, proper padding (14px 28px), rounded corners, smooth transitions, and clear hierarchy (primary/secondary)
  * Forms: Clean, modern inputs with focus states (border-color change, subtle shadow), proper spacing, labels above inputs, and professional styling
  * Layout: Use CSS Grid (grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))) or Flexbox for organized, responsive layouts
  * Responsive: Mobile-first approach with breakpoints - @media (max-width: 768px) for mobile, proper scaling
  * Animations: Subtle fade-in (opacity: 0 to 1), slide-up (transform: translateY(20px) to translateY(0)) with transition: 0.4s ease-out
  * Icons: Modern, consistent iconography (Font Awesome 6, Heroicons, or inline SVG) with proper sizing (20px-24px)
  * Professional polish: Every element aligned, consistent spacing, no visual clutter, clean lines, refined details
  * Color palette examples: Dark theme (#0f0f0f bg, #1a1a1a cards, #3b82f6 accent) or Light theme (#ffffff bg, #f8f9fa cards, #6366f1 accent)
  * The overall design should feel like a $100M+ company product - polished, refined, and professional
`
  }

  systemPrompt += `

CRITICAL INTERACTIVITY RULES:
- ALL interactive components (tabs, accordions, carousels, dropdowns, modals, etc.) MUST be fully functional with proper JavaScript
- For Swiper.js carousels: ALWAYS include the Swiper CDN script AND initialize with new Swiper() in the <script> tag
- For tabs: ALWAYS include the tab switching JavaScript that adds/removes 'active' classes on click
- For accordions: ALWAYS include click handlers that toggle content visibility
- For modals/popups: ALWAYS include open/close functionality with proper event listeners
- Test all interactivity mentally before outputting - if a button or tab doesn't have a click handler, add it
- DO NOT generate non-functional UI elements - every interactive element must have working JavaScript
${theme === "free" ? `
- MANDATORY FOR AUTHENTICATION FORMS (Login/Signup) - COMPLETE WORKING CODE REQUIRED:
  * ALL forms MUST have proper event listeners with preventDefault() to prevent page reload
  * Example signup form code structure (MUST be complete):
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const name = document.getElementById('signupName').value.trim();
      // Validation
      if (!email || !password || !name) {
        document.getElementById('signupError').textContent = 'All fields are required';
        return;
      }
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
        document.getElementById('signupError').textContent = 'Invalid email format';
        return;
      }
      if (password.length < 6) {
        document.getElementById('signupError').textContent = 'Password must be at least 6 characters';
        return;
      }
      // Get users from localStorage
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      // Check if email already exists
      if (users.some(u => u.email === email)) {
        document.getElementById('signupError').textContent = 'Email already registered';
        return;
      }
      // Create new user
      const hashedPassword = btoa(password);
      const newUser = { id: Date.now(), email, password: hashedPassword, name };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      // Success
      document.getElementById('signupError').textContent = '';
      alert('Signup successful! Welcome ' + name);
      window.location.reload();
    });
  * Example login form code structure (MUST be complete):
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      // Validation
      if (!email || !password) {
        document.getElementById('loginError').textContent = 'Email and password are required';
        return;
      }
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      // Find user
      const user = users.find(u => u.email === email);
      if (!user) {
        document.getElementById('loginError').textContent = 'Invalid email or password';
        return;
      }
      // Check password
      if (btoa(password) !== user.password) {
        document.getElementById('loginError').textContent = 'Invalid email or password';
        return;
      }
      // Set current user
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Success
      document.getElementById('loginError').textContent = '';
      alert('Login successful! Welcome ' + user.name);
      window.location.reload();
    });
  * Example authentication check on page load (MUST be complete):
    document.addEventListener('DOMContentLoaded', function() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (currentUser) {
        // User is logged in
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('signupSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        if (document.getElementById('userName')) {
          document.getElementById('userName').textContent = currentUser.name;
        }
        if (document.getElementById('logoutBtn')) {
          document.getElementById('logoutBtn').style.display = 'block';
        }
      } else {
        // User is not logged in
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('dashboardSection').style.display = 'none';
        if (document.getElementById('logoutBtn')) {
          document.getElementById('logoutBtn').style.display = 'none';
        }
      }
    });
  * Example logout function (MUST be complete):
    function logout() {
      localStorage.removeItem('currentUser');
      alert('Logged out successfully');
      window.location.reload();
    }
  * CRITICAL: Write COMPLETE, WORKING JavaScript code - every line must be executable, every function must have a body, every event listener must be properly attached
  * Use getElementById, querySelector, addEventListener - these are standard DOM APIs that work in all browsers
  * All code MUST be inside <script> tags before </body>
  * Test the complete flow: signup -> login -> logout -> check auth
` : ""}

SWIPER.JS REQUIREMENTS (when using carousels):
1. In <head>: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
2. Before </body>: <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
3. After Swiper script: <script> with new Swiper('.swiper', { /* config */ }) initialization
4. Use proper Swiper HTML structure: .swiper > .swiper-wrapper > .swiper-slide

TABS REQUIREMENTS (when using tabs):
1. Tab buttons must have data attributes (e.g., data-category="business") and click event listeners
2. Tab panels must have matching data attributes and 'active' class toggling
3. JavaScript must remove 'active' from all tabs/panels, then add to clicked tab/panel
4. Example structure from design system must be followed exactly
`

  // Add theme-specific closing statement
  if (theme === "mastersunion" || theme === "tetr") {
    systemPrompt += `Create beautiful, functional webpages with good typography, spacing, and visual hierarchy while strictly following the design system.`
  } else if (theme === "free") {
    systemPrompt += `Create premium, professional webpages with sophisticated design, modern aesthetics, and high-end polish. The design must feel like a top-tier product - use generous whitespace, subtle shadows, smooth animations, modern typography, and refined details. Every element should be carefully crafted for a premium, professional appearance that rivals enterprise software and luxury brands.

CRITICAL: EVERY section MUST include relevant, contextually appropriate images from Unsplash or Pexels. Images are MANDATORY - never create text-only sections. Use high-quality, professional images that match the content context. Search for images using relevant keywords related to the topic/industry.`
  } else {
    systemPrompt += `Create beautiful, functional webpages with good typography, spacing, and visual hierarchy.`
  }

  systemPrompt += ``

  const startTime = Date.now()
  console.log("[v0] Calling Claude API with model: claude-sonnet-4-5")
  console.log("[v0] Generation mode:", hasBaseHtml ? "edit-existing" : "create-new")
  console.log("[v0] Design system prompt length:", designSystemPrompt.length)
  if (hasBaseHtml) {
    console.log("[v0] Base HTML length:", baseHtml?.length ?? 0)
  }

  const editAwarePrompt = hasBaseHtml
    ? `You are updating an existing webpage. This is a CONTINUOUS conversation - you must preserve ALL existing HTML structure, CSS styles, and content unless the user explicitly asks to change or remove them.

CRITICAL RULES:
- Keep ALL existing HTML elements, classes, IDs, and structure
- Preserve ALL existing CSS styles and design tokens
- Preserve and extend any existing <script> logic unless the user explicitly asks to change or remove it
- Only modify or add what the user specifically requests
- If the user asks to "add" something, add it to the existing page without removing anything
- If the user asks to "change" something, only change that specific part
- Maintain the same overall design, layout, and styling unless explicitly asked to change it
- DO NOT regenerate the entire page from scratch
- DO NOT remove existing sections, styles, or content unless explicitly requested
- When adding new sections or content, ALWAYS include relevant images if they enhance the design (hero images, feature images, product photos, etc.)
${theme === "free" ? `
- CRITICAL FOR FREE MODE - IMAGES ARE MANDATORY:
  * When adding ANY new section, component, or content, you MUST include relevant, contextually appropriate images
  * If adding a feature card, it MUST have a feature image/icon
  * If adding a service, it MUST have a service-related image
  * If adding a team member, it MUST have a profile photo
  * If adding a product, it MUST have product images
  * If adding a testimonial, it SHOULD have a customer photo/avatar
  * Use high-quality images from Unsplash or Pexels that match the content context
  * Search for images using keywords related to the content (e.g., "technology", "business", "fitness", etc.)
  * NEVER add text-only sections or components - always include relevant images
  * If user mentions a specific topic, use images related to that topic
- If user asks to add/fix login, signup, or authentication:
  * Make sure signup form actually saves users to localStorage with key 'users' (array)
  * Make sure login form actually checks credentials against stored users
  * Ensure forms have preventDefault() to stop page reload
  * Add proper form validation (email format, password length, required fields)
  * Store current user in localStorage with key 'currentUser' after successful login/signup
  * Check authentication status on page load and show appropriate UI
  * Make logout functionality clear the 'currentUser' from localStorage
  * All authentication code MUST be fully functional - test the logic
  * If existing auth code doesn't work, fix it completely - don't leave broken code
  * Login/signup forms SHOULD have background images or side illustrations for premium look
` : ""}

REQUEST (what to change or add):
${prompt}

CURRENT_HTML (preserve this and apply changes):
${baseHtml}

Return the complete updated HTML document (including <!DOCTYPE>, <html>, <head>, <body>) with inline CSS that follows the design system.`
    : prompt

  // Build content array for Claude API
  const content: any[] = []
  
  // Add image if provided
  if (imageData) {
    // Parse base64 data URL (format: data:image/jpeg;base64,/9j/4AAQ...)
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (base64Match) {
      const mediaType = base64Match[1] // jpeg, png, etc.
      const base64String = base64Match[2] // actual base64 data
      
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: `image/${mediaType}`,
          data: base64String,
        },
      })
    }
  }
  
  // Enhance prompt with image usage instructions if image is provided
  let enhancedPrompt = editAwarePrompt
  if (imageData) {
    enhancedPrompt = `${editAwarePrompt}

IMPORTANT: A reference image has been provided above. You MUST:
- Analyze the image carefully and use it prominently in the generated webpage
- Incorporate the image's visual elements, colors, layout patterns, or design inspiration
- Use the image as a hero image, background, feature image, or in a relevant section
- If the image shows a design or layout, replicate similar styling and structure
- Include the image in your generated HTML using proper <img> tags or as a background image
- Don't just use it as inspiration - actually incorporate it into the design`
  }
  
  // Add text prompt
  content.push({
    type: "text",
    text: enhancedPrompt,
  })

  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout

  // Retry logic for transient errors
  const maxRetries = 3
  let lastError: any = null
  let data: any = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000)
        console.log(`[v0] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 18000, // Reduced from 18000 for faster generation
          messages: [
            {
              role: "user",
              content: content,
            },
          ],
          system: systemPrompt,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: { message: errorText } }
        }
        
        console.error(`[v0] Anthropic API error (attempt ${attempt + 1}):`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        
        // Handle specific error types
        if (response.status === 401) {
          clearTimeout(timeoutId)
          const errorMessage = errorData?.error?.message || "Invalid API key"
          throw new Error(
            `401 Unauthorized: ${errorMessage}. ` +
            "Please verify your ANTHROPIC_API_KEY is correct and set in Vercel environment variables. " +
            "Make sure to redeploy after adding the variable."
          )
        }
        
        // Retry on transient errors (429 rate limit, 529 overloaded, 503 service unavailable)
        const isRetryableError = response.status === 429 || response.status === 529 || response.status === 503
        if (isRetryableError && attempt < maxRetries - 1) {
          lastError = { status: response.status, errorData }
          console.log(`[v0] Retryable error ${response.status}, will retry...`)
          continue // Retry the request
        }
        
        // Non-retryable error or last attempt
        clearTimeout(timeoutId)
        if (response.status === 529) {
          throw new Error(
            "Claude API is temporarily overloaded. Please try again in a few moments. " +
            "If this persists, the API may be experiencing high traffic."
          )
        }
        if (response.status === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait a moment and try again. " +
            "You may be making too many requests too quickly."
          )
        }
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
      }

      // Success - parse response and break out of retry loop
      data = await response.json()
      clearTimeout(timeoutId)
      break
    } catch (error: any) {
      // If it's an abort error (timeout) or non-retryable error, throw immediately
      if (error.name === 'AbortError') {
        clearTimeout(timeoutId)
        throw new Error("Request timeout: Generation took too long. Please try again with a simpler prompt.")
      }
      
      // If it's a non-retryable error (like 401), throw it
      if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        throw error
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        clearTimeout(timeoutId)
        if (lastError) {
          if (lastError.status === 529) {
            throw new Error(
              "Claude API is temporarily overloaded after multiple retries. Please try again in a few moments."
            )
          }
          throw new Error(`Claude API error after ${maxRetries} attempts: ${lastError.status}`)
        }
        throw error
      }
      
      // Otherwise, continue to retry
      lastError = error
      console.log(`[v0] Request failed (attempt ${attempt + 1}), will retry...`, error.message)
    }
  }

  // Process the successful response
  if (!data) {
    throw new Error("Failed to get response from Claude API after retries")
  }

  const duration = Date.now() - startTime
  console.log("[v0] Claude API response received successfully")
  console.log("[v0] Generation took:", duration, "ms (", (duration / 1000).toFixed(2), "seconds)")

  const textSegments: string[] = Array.isArray(data?.content)
    ? data.content
        .filter((segment: any) => segment?.type === "text" && typeof segment.text === "string")
        .map((segment: any) => segment.text)
    : []

  if (textSegments.length === 0) {
    throw new Error("Unexpected response format from Claude")
  }

  let html = textSegments.join("").trim()

  if (html.startsWith("```html")) {
    html = html.replace(/^```html\n/, "").replace(/\n```$/, "")
  } else if (html.startsWith("```")) {
    html = html.replace(/^```\n/, "").replace(/\n```$/, "")
  }

  return html
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API route called")
    const body = await request.json()
    const { prompt, baseHtml, imageData, theme } = body as {
      prompt?: string
      baseHtml?: string
      imageData?: string
      theme?: GenerationTheme
    }

    if (!prompt && !imageData) {
      return NextResponse.json({ error: "Missing prompt or image" }, { status: 400 })
    }

    const selectedTheme: GenerationTheme =
      theme === "tetr" ? "tetr" : theme === "mastersunion" ? "mastersunion" : "free"

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
    if (!apiKey) {
      console.error("[v0] ANTHROPIC_API_KEY is missing from environment variables")
      return NextResponse.json(
        {
          error: "ANTHROPIC_API_KEY not configured. Please add it in Vercel's Environment Variables settings and redeploy.",
        },
        { status: 500 },
      )
    }
    
    // Log that API key exists (for debugging, without exposing the key)
    console.log("[v0] API key found in environment, length:", apiKey.length)

    console.log("[v0] Generating webpage with prompt:", prompt?.substring(0, 50) + "..." || "[Image only]")
    console.log("[v0] Using theme:", selectedTheme)
    if (imageData) {
      console.log("[v0] Image data provided, length:", imageData.length)
    }
    const html = await generateWebpageOnServer(prompt || "", baseHtml, imageData, selectedTheme)

    console.log("[v0] Webpage generated successfully")
    return NextResponse.json({ html })
  } catch (error: any) {
    console.error("[v0] Error generating webpage:", error)

    return NextResponse.json({ error: error.message || "Failed to generate webpage" }, { status: 500 })
  }
}
