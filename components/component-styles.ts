// Component Styles - Exports CSS from component-styles.css file
// This file contains the root file (globals.css) CSS by default

export const componentStyles = `
/* Component Styles - Includes Root File (globals.css) CSS by default */

/* CSS Variables from globals.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);

  /* Masters' Union Color Palette */
  --yellow: #fad133;
  --darkYellow: #c5b64d;
  --white: #ffffff;
  --white3: #fafafa;
  --white2: #e6e6e6;
  --white4: #f5f5f5;
  --black: #090909;
  --black2: #1e1e1e;
  --black3: #060606;
  --black4: #101010;
  --black5: #262626;
  --black6: #343434;
  --black7: #1b1818;
  --black8: #0000;
  --grey: #737373;
  --grey2: #595959;
  --grey3: #404040;
  --grey4: #e5e5e5;
  --grey5: #b3b3b3;
  --grey6: #999999;
  --grey7: #f6f6f6;
  --grey8: #8e8e8e;
  --grey9: #3b3b3b;
  --grey10: #a3a3a3;
  --grey11: #e0e0e0;
  --grey12: #e7e7e7;
  --grey13: #5b5b5b;
  --grey14: #f3f3f3;
  --grey15: #525252;
  --grey16: #f5f5f5;
  --grey17: #171717;
  --grey18: #d4d4d4;
  --grey19: #dddddd;
  --grey20: #d9d9d9;
  --grey21: #5c5c5c;
  --grey22: #e7dbdb;
  --grey23: #dfdeda;
  --grey24: #474747;
  --grey26: #0e0e0e;
  --red: #9b0909;
  --red1: #b2212a;
  --warning: #dc0000;
  --gradient: linear-gradient(90deg, #39b6d8 6.41%, #f7d344 51.47%, #e38330 96.52%);
  --gradient2: linear-gradient(90deg, #39b6d8 6.41%, #f7d344 51.47%);
  --orange: #eca63919;
  --darkOrange: #e38330;
  --green: #8cbe5019;
  --darkGreen: #648937;
  --green2: #1c7c54;
  --blue: #5bbcbd19;
  --darkBlue: #399394;
  --newYellow: #febe00;
  --newWhite: #f1f1f1;
  --lowYellow: #fefcf5;

  /* Font families */
  --go-thin: "go-thin";
  --go-regular: "go-regular";
  --go-medium: "go-medium";
  --go-semibold: "go-semibold";
  --go-bold: "go-bold";
  --go-extrabold: "go-extrabold";
  --ss-semibold: "ss-semibold";
  --fr-thin: "fr-thin";
  --fr-light: "fr-light";
  --fr-regular: "fr-regular";
  --fr-medium: "fr-medium";
  --fr-semibold: "fr-semibold";
  --fr-bold: "fr-bold";
  --fr-extrabold: "fr-extrabold";
}

/* Base Styles from globals.css */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  width: 100%;
  height: 100%;
  font-family: var(--go-regular), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: var(--black2);
  color: var(--white);
}

button {
  font-family: inherit;
}

input,
textarea,
select {
  font-family: inherit;
}

[contenteditable="true"], 
input, 
textarea {
  caret-color: white;
}

@supports (-webkit-caret-color: white) {
  [contenteditable="true"] {
    caret-color: white;
    text-shadow: 0 0 0 white;
  }
}

/* Global Scrollbar Styles */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

*::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

*::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

*::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  transition: background 0.2s ease;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

*::-webkit-scrollbar-thumb:active {
  background: rgba(250, 209, 51, 0.4);
}

/* Font face definitions from globals.css */
@font-face {
  font-family: "go-thin";
  src: url("https://files.mastersunion.link/resources/fonts/GalanoGrotesqueThin.otf");
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "go-regular";
  src: url("https://files.mastersunion.link/resources/fonts/GalanoGrotesqueRegular.otf");
  font-style: normal;
  font-display: swap;
  font-weight: 400;
}

@font-face {
  font-family: "go-medium";
  src: url("https://files.mastersunion.link/resources/fonts/GalanoGrotesqueMedium.otf");
  font-style: normal;
  font-display: swap;
  font-weight: 500;
}

@font-face {
  font-family: "go-semibold";
  src: url("https://files.mastersunion.link/resources/fonts/GalanoGrotesqueSemiBold.otf");
  font-style: normal;
  font-display: swap;
  font-weight: 600;
}

@font-face {
  font-family: "go-bold";
  src: url("https://files.mastersunion.link/resources/fonts/GalanoGrotesqueBold.otf");
  font-style: normal;
  font-display: swap;
  font-weight: 700;
}

@font-face {
  font-family: "go-extrabold";
  src: url("https://files.mastersunion.link/resources/fonts/GalanoGrotesqueExtraBold.otf");
  font-style: normal;
  font-display: swap;
  font-weight: 800;
}

@font-face {
  font-family: "ss-semibold";
  src: url("https://cdn.mastersunion.link/assets/fontV2/SourceSerifPro-SemiBold.eot");
  src: url("https://cdn.mastersunion.link/assets/fontV2/SourceSerifPro-SemiBold.eot?#iefix") format("embedded-opentype"),
    url("https://cdn.mastersunion.link/assets/fontV2/SourceSerifPro-SemiBold.woff2") format("woff2"),
    url("https://cdn.mastersunion.link/assets/fontV2/SourceSerifPro-SemiBold.woff") format("woff"),
    url("https://cdn.mastersunion.link/assets/fontV2/SourceSerifPro-SemiBold.ttf") format("truetype"),
    url("https://cdn.mastersunion.link/assets/fontV2/SourceSerifPro-SemiBold.svg#SourceSerifPro-SemiBold") format("svg");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Fraunces";
  src: url("https://files.mastersunion.link/uploads/21022025/v1/Fraunces_72ptThin.ttf") format("truetype");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Fraunces";
  src: url("https://files.mastersunion.link/uploads/21022025/v1/Fraunces_72ptRegular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Fraunces";
  src: url("https://files.mastersunion.link/uploads/21022025/v1/Fraunces_144ptSemiBold.ttf") format("truetype");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Fraunces";
  src: url("https://files.mastersunion.link/uploads/21022025/v1/Fraunces_72ptBold.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Utility classes */
.mob-hide {
  display: block;
}

.mob-visible {
  display: none;
}

@media (max-width: 767px) {
  .mob-hide {
    display: none;
  }
  
  .mob-visible {
    display: block;
  }
}

.font-white {
  color: var(--white);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.btnWhite {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-family: var(--go-medium);
  line-height: 150%;
  color: var(--black);
  background: var(--white);
  border: none;
  border-radius: 54px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btnWhite:hover {
  background: var(--grey4);
}

.btnWhite.outline {
  background: transparent;
  border: 1px solid var(--white);
  color: var(--white);
}

.btnWhite.outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Hero Section Styles */
.homeHeroSection {
  position: relative;
  z-index: 9;
  padding: 0 0 0;
  overflow: hidden;
  min-height: 100vh;
  background: var(--black);
}

.homeHeroSection .homeheroHeading {
  font: 128px "go-regular";
  color: var(--white);
  line-height: 100%;
}

.homeHeroSection .homeheroHeading .muvectorhero {
  font-family: "fraunces", serif;
  font-weight: 350;
  color: var(--white);
  line-height: 100%;
  font-style: italic;
}

.homeHeroSection .overlayHero {
  position: absolute;
  bottom: 80px;
  width: 100%;
  z-index: 10;
}

.homeHeroSection .heroRightButtons {
  display: flex;
  gap: 20px;
  align-items: center;
}

.homeHeroSection .muHeroButtonWrap {
  display: flex;
  justify-content: space-between;
  margin-top: 75px;
  align-items: center;
}

.homeHeroSection .muHeroLogos {
  display: flex;
  gap: 16px;
  align-items: center;
}

.homeHeroSection .muHeroLogos img {
  max-width: 86px;
}

.homeHeroSection .muHeroLogos img:first-child {
  max-width: 63px;
}

.heroSection {
  position: relative;
  
  z-index: 9;
  padding: 0;
  overflow: hidden;
  background: #020202;
}

.heroSection .imgH90vh {
  height: 90vh;
}

.heroSection .overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 1.9), transparent);
  pointer-events: none;
}

.heroSection .heroSectionContent .go-HeroSubtitle {
  color: var(--grey4);
}

.heroSection .heroSectionContent {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, -30%);
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  width: 100%;
}

.heroSection .go-HeroSubtitle {
  margin-top: 16px;
}

.heroSection .go-HeroSubtitle .textHighlight {
  color: var(--white);
}

.heroSection .heroSectionBtnWrap {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 24px;
}

.heroSection .heroSectionImg .video-container {
  max-width: 100%;
}

.heroSection .heroSectionImg .video-container video {
  width: 100%;
}

.heroSection .heroSectionImg .mobilevideo {
  width: 100%;
}

.intersectHero {
  background: var(--black);
  padding: 0px 0;
}

.intersectHero .techHeroSectionWrapper {
  position: relative;
}

.intersectHero .masterImage {
  width: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.intersectHero .studentWrapperHeadingDiv {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 16px;
  left: 100px;
  z-index: 5;
  bottom: 77px;
}

.intersectHero .heroHeading {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.intersectHero .studentPara {
  font-size: 24px;
  font-family: var(--go-regular);
  line-height: 120%;
}

.intersectHero .font_italic {
  font-family: "Fraunces", serif;
}

.intersectHero .studentPBold {
  font-size: 28px;
  line-height: 120%;
}

.intersectHero .font_italic {
  font-style: italic !important;
}

.intersectHero .intersectHeroBtn {
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  margin-top: 16px;
}

.intersectHero .whiteFillButton {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 16px;
  font-family: var(--go-medium);
  line-height: 24px;
  color: var(--black);
  cursor: pointer;
  background: var(--white);
  border-radius: 54px;
  width: 100%;
  max-width: fit-content;
}

@media (max-width: 767px) {
  .heroSection {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    max-height: 90vh !important;
    overflow: hidden;
  }

  .heroSection .heroSectionContent {
    width: 100%;
    padding: 0 12px;
    transform: translate(-50%, -20%);
    gap: 20px;
  }

  .heroSection .heroSectionContent.heroContentMob {
    transform: translate(-50%, -50%);
    gap: 8px;
  }

  .heroSection .heroSectionBtnWrap {
    width: 100%;
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }

  .heroSection .heroSectionBtnWrap a,
  .heroSection .heroSectionBtnWrap button {
    width: 100%;
    line-height: 0 !important;
  }

  .heroSection .heroSectionImg {
    height: 80vh;
  }

  .homeHeroSection .heroSubHeading {
    font-size: 14px;
  }

  .homeHeroSection .homeheroHeading {
    font: 30px "go-regular";
  }

  .homeHeroSection .homeheroHeading .FrHeading {
    font-size: 32px;
  }

  .homeHeroSection .overlayHero {
    bottom: 20px;
    left: 0;
  }

  .homeHeroSection .bgHeroImage {
    filter: grayscale(0);
  }

  .homeHeroSection .bgHeroVideoWrap {
    height: 90vh;
  }

  .homeHeroSection .homeheroHeading {
    font-size: 96px;
    width: fit-content;
    display: flex;
    flex-direction: column;
    align-items: end;
    justify-content: end;
    color: var(--white);
    line-height: 100%;
  }

  .homeHeroSection .muvectorhero {
    font-weight: 300 !important;
    position: relative;
    z-index: 1;
  }

  .homeHeroSection .muHeroButtonWrap {
    flex-direction: column;
    gap: 20px;
  }

  .homeHeroSection .heroRightButtons {
    padding-left: unset;
    gap: 12px;
  }

  .homeHeroSection .muHeroLogos {
    margin: 0;
    justify-content: center;
  }

  .homeHeroSection .btnWhite {
    width: 100%;
  }

  .homeHeroSection .heroLeft {
    padding: 16px;
  }

  .intersectHero {
    padding-top: 47px !important;
  }

  .intersectHero .techHeroSectionWrapper {
    width: 100%;
    position: relative;
  }

  .intersectHero .masterImage {
    width: 100%;
    position: relative;
    
    border-radius: 8px;
    overflow: hidden;
  }

  .intersectHero .studentWrapperHeadingDiv {
    position: relative;
    bottom: 82px;
    left: 0;
    padding-inline: 15px;
    width: 100%;
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .intersectHero .heroHeading {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-inline: 5px;
  }

  .intersectHero .studentPara {
    font-size: 22px;
  }

  .intersectHero .studentPBold {
    font-size: 24px;
  }

  .intersectHero .techHeroSection .intersectHeroBtn {
    width: 100%;
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }

  .intersectHero .intersectHeroBtn {
    width: 100%;
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }

  .intersectHero .whiteFillButton {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 24px;
    font-size: 16px;
    font-family: var(--go-medium);
    line-height: 24px;
    color: var(--black);
    cursor: pointer;
    background: var(--white);
    border-radius: 54px;
    width: 100%;
    max-width: 100%;
    justify-content: center;
  }

  .intersectHero .btnWhite.outline {
    background: transparent;
    border: 1px solid white;
    color: white;
    width: 100%;
    padding: 14px 24px;
    cursor: pointer;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    font: 16px 'go-medium';
    line-height: 150% !important;
    border-radius: 54px;
  }
}
`

