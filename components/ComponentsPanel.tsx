"use client"

import { useState } from "react"
import styles from "./ComponentsPanel.module.css"

interface ComponentsPanelProps {
  html: string
  onHtmlChange: (newHtml: string) => void
  selectedTheme?: "mastersunion" | "tetr"
}

interface ComponentVersion {
  id: string
  name: string
  html: string
  preview: string // Image URL or preview description
}

interface ComponentCategory {
  id: string
  name: string
  versions: ComponentVersion[]
}

// Hero Section Versions
const heroSectionVersions: ComponentVersion[] = [
  {
    id: "hero-1",
    name: "Hero Section 1",
    html: `<section class="heroSection">
        <div class="heroSectionImg">
            <img loading="eager" src="https://images.mastersunion.link/uploads/11122025/v1/Frame113.webp" alt="Glimpse"
                class="mob-hide">

            <img loading="eager" src="https://images.mastersunion.link/uploads/11122025/v1/Frame114.webp" alt="Glimpse"
                class="mob-visible">
        </div>
        

        <div class="heroSectionContent">
            <h1 class="go-HeroTitle font-white">
Make Your Company  New‑age
            </h1>
            <p class="go-HeroSubtitle ">
                Premium learning experiences designed by industry leaders.<br class="mob-hide"> We diagnose  gaps and
                prescribe solutions that drive measurable business impact.
            </p>
            <div class="heroSectionBtnWrap">
                <a href="#" class="btnWhite " onclick="bookacallpopup()" id="applyNowLinkUG_TBM">Book Discovery Call
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12.3982 3.94694C12.4215 3.85968 12.4618 3.77789 12.5168 3.70622C12.5718 3.63455 12.6403 3.57441 12.7185 3.52924C12.7967 3.48407 12.8831 3.45475 12.9726 3.44296C13.0622 3.43117 13.1532 3.43714 13.2404 3.46053C14.5149 3.79306 15.6777 4.45933 16.6091 5.39072C17.5405 6.3221 18.2068 7.48493 18.5393 8.75944C18.5627 8.84667 18.5687 8.93766 18.5569 9.02721C18.5451 9.11675 18.5158 9.2031 18.4706 9.28131C18.4254 9.35952 18.3653 9.42806 18.2936 9.48303C18.2219 9.53799 18.1402 9.57829 18.0529 9.60162C17.9948 9.61688 17.935 9.62467 17.875 9.62483C17.7235 9.62482 17.5763 9.57478 17.4561 9.48246C17.336 9.39015 17.2497 9.26075 17.2107 9.11436C16.9395 8.07393 16.3957 7.12465 15.6355 6.36438C14.8752 5.6041 13.9259 5.06033 12.8855 4.78912C12.7981 4.76588 12.7163 4.72564 12.6445 4.67072C12.5727 4.6158 12.5125 4.54727 12.4672 4.46905C12.422 4.39083 12.3926 4.30445 12.3807 4.21487C12.3689 4.12528 12.3748 4.03423 12.3982 3.94694ZM12.198 7.53912C13.3831 7.85537 14.1445 8.61678 14.4607 9.80186C14.4997 9.94825 14.586 10.0777 14.7061 10.17C14.8263 10.2623 14.9735 10.3123 15.125 10.3123C15.185 10.3122 15.2448 10.3044 15.3029 10.2891C15.3902 10.2658 15.4719 10.2255 15.5436 10.1705C15.6153 10.1156 15.6754 10.047 15.7206 9.96881C15.7658 9.8906 15.7951 9.80425 15.8069 9.71471C15.8187 9.62516 15.8127 9.53417 15.7893 9.44694C15.3493 7.80037 14.1995 6.65053 12.5529 6.21053C12.3767 6.16346 12.1891 6.18831 12.0312 6.27961C11.8733 6.37091 11.7582 6.52118 11.7111 6.69737C11.6641 6.87355 11.6889 7.06121 11.7802 7.21907C11.8715 7.37693 12.0218 7.49206 12.198 7.53912ZM19.2397 15.7333C19.0865 16.8977 18.5146 17.9666 17.6309 18.7403C16.7471 19.5139 15.612 19.9394 14.4375 19.9373C7.61407 19.9373 2.06251 14.3858 2.06251 7.56233C2.0604 6.38781 2.48591 5.25269 3.25956 4.36897C4.03321 3.48525 5.10209 2.91337 6.26657 2.76014C6.56104 2.72418 6.85924 2.78443 7.11665 2.93187C7.37407 3.07932 7.57689 3.30607 7.69485 3.57826L9.50985 7.63022V7.64053C9.60016 7.84889 9.63746 8.07637 9.61841 8.30266C9.59937 8.52894 9.52457 8.74699 9.40071 8.93733C9.38524 8.96053 9.36891 8.98201 9.35173 9.0035L7.56251 11.1244C8.20618 12.4324 9.57431 13.7885 10.8995 14.4339L12.9912 12.6541C13.0117 12.6369 13.0332 12.6208 13.0556 12.606C13.2458 12.4792 13.4646 12.4017 13.6922 12.3807C13.9199 12.3597 14.1491 12.3958 14.3593 12.4857L14.3705 12.4908L18.419 14.305C18.6917 14.4225 18.919 14.6252 19.0669 14.8826C19.2148 15.1401 19.2755 15.4385 19.2397 15.7333ZM17.875 15.5614C17.875 15.5614 17.869 15.5614 17.8656 15.5614L13.8265 13.7524L11.7339 15.5322C11.7136 15.5494 11.6924 15.5654 11.6703 15.5803C11.4725 15.7123 11.2437 15.7907 11.0065 15.8079C10.7693 15.8251 10.5316 15.7804 10.3168 15.6783C8.7072 14.9005 7.10274 13.3081 6.32415 11.7157C6.22105 11.5024 6.17478 11.2662 6.18984 11.0298C6.2049 10.7934 6.28076 10.5649 6.41009 10.3665C6.42466 10.3432 6.44104 10.321 6.45907 10.3003L8.25001 8.17678L6.44532 4.13772C6.44498 4.13429 6.44498 4.13083 6.44532 4.1274C5.61195 4.23611 4.84678 4.64489 4.29311 5.27717C3.73945 5.90946 3.43526 6.72189 3.43751 7.56233C3.44069 10.4787 4.60064 13.2748 6.66285 15.337C8.72506 17.3992 11.5211 18.5591 14.4375 18.5623C15.2774 18.5652 16.0896 18.2621 16.7223 17.7096C17.3549 17.1572 17.7647 16.3932 17.875 15.5605V15.5614Z"
                            fill="#090909" />
                    </svg>

                </a>
                <button class="btnWhite outline " onclick="openPopup('IyMIGNBmRrg')">

                    <svg class="" xmlns="https://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18"
                        fill="none">
                        <path
                            d="M16.875 9.00002C16.8755 9.191 16.8265 9.37886 16.7329 9.54532C16.6392 9.71178 16.5041 9.85117 16.3406 9.94994L6.21 16.1473C6.0392 16.2519 5.84358 16.309 5.64334 16.3127C5.44309 16.3164 5.24549 16.2666 5.07094 16.1684C4.89805 16.0717 4.75402 15.9307 4.65368 15.76C4.55333 15.5892 4.50029 15.3947 4.5 15.1967L4.5 2.80337C4.50029 2.60529 4.55333 2.41086 4.65368 2.24008C4.75402 2.0693 4.89805 1.92832 5.07094 1.83166C5.24549 1.73346 5.44309 1.68365 5.64334 1.68736C5.84358 1.69107 6.0392 1.74816 6.21 1.85275L16.3406 8.05009C16.5041 8.14886 16.6392 8.28826 16.7329 8.45471C16.8265 8.62117 16.8755 8.80903 16.875 9.00002Z"
                            fill="black"></path>
                    </svg>

                    Watch Now
                </button>
            </div>
        </div>
    </section>`,
    preview: "https://images.mastersunion.link/uploads/11122025/v1/Frame113.webp"
  },
  {
    id: "hero-2",
    name: "Hero Section 2",
    html: `<section class="homeHeroSection">
        <div class="bgHeroVideoWrap">
            <div class="animationweb">
                <img src="https://images.mastersunion.link/uploads/23122025/v1/herosection1.webp" fetchpriority="high"
                    class="bgHeroImage mob-hide" alt="Learn business">
                <img src="https://images.mastersunion.link/uploads/24122025/v1/Group1171280098.webp"
                    fetchpriority="high" class="bgHeroImage mob-hide" alt="Learn business">

            </div>
            <div class="animationmob mobVisible">
                <img src="https://images.mastersunion.link/uploads/23122025/v1/herosection3.webp" fetchpriority="high"
                    class="bgHeroImage " alt="mobileHomepageBackground">
                <img src="https://images.mastersunion.link/uploads/24122025/v1/Frame1321317322.webp"
                    fetchpriority="high" class="bgHeroImage " alt="mobileHomepageBackground">

            </div>
        </div>
        <div class="container">
            <div class="overlayHero">
                <div class="heroLeft">
                    <h1 class="homeheroHeading"> Learn <br> <span class="mobhr"> by </span>

                        <span class="muvectorhero"> Doing </span>
                    </h1>


                    <div class="muHeroButtonWrap">
                        <div class="heroRightButtons">
                            <a href="https://www.youtube.com/watch?feature=shared&v=IyMIGNBmRrg" target="_blank"
                                class="btnWhite">
                                Watch Intro Video
                                <span class="arrowWrap">
                                    <img class="arrow arrow1"
                                        src="https://images.mastersunion.link/uploads/18022025/v1/black_arrow_image.svg"
                                        alt="arrow" />
                                    <img class="arrow arrow2"
                                        src="https://images.mastersunion.link/uploads/18022025/v1/black_arrow_image.svg"
                                        alt="arrow" />
                                </span>
                            </a>
                            <a href="https://files.mastersunion.link/media/Masters_Union_Year_Book.pdf" target="_blank"
                                class="btnWhite blurBg">

                                Download Yearbook

                                <svg class="icon-Download" xmlns="https://www.w3.org/2000/svg" width="19" height="20"
                                    viewBox="0 0 19 20" fill="none" plerdy-tracking-id="79912533601">
                                    <!-- Arrow path -->
                                    <path class="arrowDownload"
                                        d="M9.07992 11.6076C9.13506 11.6628 9.20055 11.7066 9.27263 11.7365C9.34471 11.7663 9.42197 11.7817 9.5 11.7817C9.57803 11.7817 9.65529 11.7663 9.72737 11.7365C9.79945 11.7066 9.86494 11.6628 9.92008 11.6076L12.8888 8.63883C12.944 8.58366 12.9878 8.51817 13.0176 8.44609C13.0475 8.37402 13.0628 8.29677 13.0628 8.21875C13.0628 8.14073 13.0475 8.06348 13.0176 7.99141C12.9878 7.91933 12.944 7.85384 12.8888 7.79867C12.8337 7.74351 12.7682 7.69975 12.6961 7.66989C12.624 7.64004 12.5468 7.62467 12.4688 7.62467C12.3907 7.62467 12.3135 7.64004 12.2414 7.66989C12.1693 7.69975 12.1038 7.74351 12.0487 7.79867L10.0938 9.75434V2.875C10.0938 2.71753 10.0312 2.56651 9.91985 2.45516C9.8085 2.34381 9.65747 2.28125 9.5 2.28125C9.34253 2.28125 9.19151 2.34381 9.08016 2.45516C8.96881 2.56651 8.90625 2.71753 8.90625 2.875V9.75434L6.95133 7.79867C6.83992 7.68726 6.68881 7.62467 6.53125 7.62467C6.37369 7.62467 6.22258 7.68726 6.11117 7.79867C5.99976 7.91008 5.93717 8.06119 5.93717 8.21875C5.93717 8.37631 5.99976 8.52742 6.11117 8.63883L9.07992 11.6076Z"
                                        fill="#090909"></path>

                                    <!-- Bottom line path -->
                                    <path
                                        d="M16.625 11.1875V15.9375C16.625 16.095 16.5624 16.246 16.4511 16.3573C16.3397 16.4687 16.1887 16.5312 16.0312 16.5312H2.96875C2.81128 16.5312 2.66026 16.4687 2.54891 16.3573C2.43756 16.246 2.375 16.095 2.375 15.9375V11.1875C2.375 11.03 2.43756 10.879 2.54891 10.7677C2.66026 10.6563 2.81128 10.5938 2.96875 10.5938C3.12622 10.5938 3.27724 10.6563 3.38859 10.7677C3.49994 10.879 3.5625 11.03 3.5625 11.1875V15.3438H15.4375V11.1875C15.4375 11.03 15.5001 10.879 15.6114 10.7677C15.7228 10.6563 15.8738 10.5938 16.0312 10.5938C16.1887 10.5938 16.3397 10.6563 16.4511 10.7677C16.5624 10.879 16.625 11.03 16.625 11.1875Z"
                                        fill="#090909"></path>
                                </svg>
                            </a>
                        </div>
                        <div class="muHeroLogos">
                            <img src="https://images.mastersunion.link/uploads/28082025/v1/BSISPartners.webp"
                                alt="BSIS Partners">
                            <img src="https://files.mastersunion.link/media/img/Legacy-tbm/footer-Pic.webp"
                                alt="EFMD Global Member">
                            <img src="https://files.mastersunion.link/media/img/Legacy-tbm/footer-PicUpdate.webp"
                                alt="Business Education Alliance">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`,
    preview: "https://images.mastersunion.link/uploads/23122025/v1/herosection1.webp"
  },
  {
    id: "hero-3",
    name: "Hero Section 3",
    html: `<div class="intersectHero techHeroSection">

        <div class="intersectHeroWrapper techHeroSectionWrapper">
            <div class="heroSectionImg masterImage">

                <img src="https://images.mastersunion.link/uploads/27052025/v1/studentEnterHero.webp" alt="Glimpse"
                    class="mob-hide">

                <img src="https://images.mastersunion.link/uploads/27052025/v1/studentEnterMob.webp" alt="Glimpse"
                    class="mob-visible">
            </div>

            <div class="studentWrapperHeadingDiv">
                <div class="heroHeading">
                    <p class="studentPara font-white">Fueling the next generation of
                        founders—where <br> <span class="font_italic studentPBold">ideas </span> turn into <span
                            class="font_italic studentPBold"> ventures </span> & <br> <span
                            class="font_italic studentPBold"> students</span>
                        become <span class="font_italic studentPBold">
                            entrepreneurs.</span>
                    </p>
                </div>

                <div class="intersectHeroBtn">
                    <button onclick="openPopup('uI12CiRkylM')" class="whiteFillButton">
                        Want to Know More
                        <img src="https://images.mastersunion.link/uploads/18022025/v1/black_arrow_image.svg"
                            alt="arrow_image_black">
                    </button>

                    <a href="https://files.mastersunion.link/Report/Entrepreneurship_Report.pdf" class="btnWhite outline" target="_blank">

                        Download Entrepreneurship Report


                        <svg class="icon-Download" xmlns="https://www.w3.org/2000/svg" width="22" height="24"
                            viewBox="0 0 19 20" fill="none" plerdy-tracking-id="79912533601">
                            <!-- Arrow path -->
                            <path class="arrowDownload"
                                d="M9.07992 11.6076C9.13506 11.6628 9.20055 11.7066 9.27263 11.7365C9.34471 11.7663 9.42197 11.7817 9.5 11.7817C9.57803 11.7817 9.65529 11.7663 9.72737 11.7365C9.79945 11.7066 9.86494 11.6628 9.92008 11.6076L12.8888 8.63883C12.944 8.58366 12.9878 8.51817 13.0176 8.44609C13.0475 8.37402 13.0628 8.29677 13.0628 8.21875C13.0628 8.14073 13.0475 8.06348 13.0176 7.99141C12.9878 7.91933 12.944 7.85384 12.8888 7.79867C12.8337 7.74351 12.7682 7.69975 12.6961 7.66989C12.624 7.64004 12.5468 7.62467 12.4688 7.62467C12.3907 7.62467 12.3135 7.64004 12.2414 7.66989C12.1693 7.69975 12.1038 7.74351 12.0487 7.79867L10.0938 9.75434V2.875C10.0938 2.71753 10.0312 2.56651 9.91985 2.45516C9.8085 2.34381 9.65747 2.28125 9.5 2.28125C9.34253 2.28125 9.19151 2.34381 9.08016 2.45516C8.96881 2.56651 8.90625 2.71753 8.90625 2.875V9.75434L6.95133 7.79867C6.83992 7.68726 6.68881 7.62467 6.53125 7.62467C6.37369 7.62467 6.22258 7.68726 6.11117 7.79867C5.99976 7.91008 5.93717 8.06119 5.93717 8.21875C5.93717 8.37631 5.99976 8.52742 6.11117 8.63883L9.07992 11.6076Z"
                                fill="#FFFFFF"></path>

                            <!-- Bottom line path -->
                            <path
                                d="M16.625 11.1875V15.9375C16.625 16.095 16.5624 16.246 16.4511 16.3573C16.3397 16.4687 16.1887 16.5312 16.0312 16.5312H2.96875C2.81128 16.5312 2.66026 16.4687 2.54891 16.3573C2.43756 16.246 2.375 16.095 2.375 15.9375V11.1875C2.375 11.03 2.43756 10.879 2.54891 10.7677C2.66026 10.6563 2.81128 10.5938 2.96875 10.5938C3.12622 10.5938 3.27724 10.6563 3.38859 10.7677C3.49994 10.879 3.5625 11.03 3.5625 11.1875V15.3438H15.4375V11.1875C15.4375 11.03 15.5001 10.879 15.6114 10.7677C15.7228 10.6563 15.8738 10.5938 16.0312 10.5938C16.1887 10.5938 16.3397 10.6563 16.4511 10.7677C16.5624 10.879 16.625 11.03 16.625 11.1875Z"
                                fill="#FFFFFF"></path>
                        </svg>



                    </a>
                </div>
            </div>
        </div>

    </div>`,
    preview: "https://images.mastersunion.link/uploads/27052025/v1/studentEnterHero.webp"
  }
]

// Hero Section Styles - using exact code provided
const heroSectionStyles = `
<style>
     .homeHeroSection {
    position: relative;
    z-index: 9;
    padding: 0 0 0;
    overflow: hidden;
    min-height: 100vh;
    background: var(--black);

    .homeheroHeading {
      font: 128px "go-regular";
      color: var(--white);
      line-height: 100%;

      .muvectorhero {
        font-family: "fraunces", serif;
        font-weight: 350;
        color: var(--white);
        line-height: 100%;
        font-style: italic;
      }
    }

    .overlayHero {
      position: absolute;
      bottom: 80px;
      width: 100%;
      z-index: 10;
    }

    .heroRightButtons {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .muHeroButtonWrap {
      display: flex;
      justify-content: space-between;
      margin-top: 75px;
      align-items: center;
    }

    .muHeroLogos {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .muHeroLogos img {
      max-width: 86px;
    }

    .muHeroLogos img:first-child {
      max-width: 63px;
    }
  }

      .heroSection {
        position: relative;
        line-height: 0;
        z-index: 9;
        padding: 0;
        overflow: hidden;
        /* min-height: 100vh; */
        background: #020202;

        .imgH90vh {
            height: 90vh;
        }

        .overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to top, rgba(0, 0, 0, 1.9), transparent);
            pointer-events: none;
        }


        .heroSectionContent .go-HeroSubtitle {
            color: var(--grey4);
        }

        .heroSectionContent {
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

        .go-HeroSubtitle {
            margin-top: 16px;

            .textHighlight {
                color: var(--white);
            }
        }

        .heroSectionBtnWrap {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-top: 24px;
            margin-top: 24px;
        }

        .heroSectionImg {
            /* height: 90vh; */

            .video-container {
                max-width: 100%;

                video {
                    width: 100%;
                }
            }


            .mobilevideo {
                width: 100%;
            }

        }


    }

    .intersectHero {
                background: var(--black);
        padding: 0px 0;
        line-height: 0;

            .techHeroSectionWrapper {
        position: relative;
    }
    .masterImage {
    width: 100%;
    position: relative;
    line-height: 0;
    border-radius: 8px;
    overflow: hidden;
}
    .studentWrapperHeadingDiv {
        position: absolute;
        display: flex;
        flex-direction: column;
        gap: 16px;
        left: 100px;
        z-index: 5;
        bottom: 77px;
    }
        .heroHeading {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
        .studentPara {
        font-size: 24px;
        font-family: var(--go-regular);
        line-height: 120%;
    }
        .font_italic {
        font-family: "Fraunces", serif;
    }
        .studentPBold {
        font-size: 28px;
        line-height: 120%;
    }
        .font_italic {
        font-style: italic !important;
    }        .intersectHeroBtn {
            display: flex;
            gap: 16px;
            align-items: center;
            width: 100%;
            margin-top: 16px;
        }
            .whiteFillButton {
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


    }


      @media (max-width: 767px){

            .heroSection {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            max-height: 90vh !important;
            overflow: hidden;

            .heroSectionContent {
                width: 100%;
                padding: 0 12px;
                transform: translate(-50%, -20%);
                gap: 20px;
            }

            .heroSectionContent.heroContentMob {
                transform: translate(-50%, -50%);
                gap: 8px;
            }

            .heroSectionBtnWrap {
                width: 100%;
                align-items: flex-start;
                gap: 12px;
                flex-direction: column;


                a,
                button {
                    width: 100%;
                    line-height: 0 !important;
                }
            }

            .heroHeadingWrap {
                gap: 8px;
            }

            .heroSectionImg {
                height: 80vh;
            }
        }


            .homeHeroSection {
            .heroSubHeading {
                font-size: 14px;
            }

            .homeheroHeading {
                font: 30px "go-regular";

                .FrHeading {
                    font-size: 32px;

                }
            }

            .overlayHero {
                /* padding-inline: 16px; */
                bottom: 20px;
                left: 0;
            }

            .bgHeroImage {
                filter: grayscale(0);
            }

            .bgHeroVideoWrap {
                height: 90vh;
            }

            .heroTag {
                padding-block: 18px;
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-bottom: unset;
            }

            .heroImpactButton {
                gap: 8px;
                align-items: center;
                padding: 8px 14px;
            }

            .impactText {
                font-size: 13px;
                font-family: var(--go-medium);
            }

            .impactMob {
                font-size: 10px;
                font-family: var(--go-regular);
                line-height: 120%;
                text-transform: uppercase;
                align-items: center;
                letter-spacing: 1px;
                color: var(--grey4);
            }

            .mobBtn {
                display: flex;
                flex-direction: column;
                gap: 8px;
                justify-content: center;
                align-items: center;
            }

                        .homeheroHeading {
                font-size: 96px;
                width: fit-content;
                display: flex;
                flex-direction: column;
                align-items: end;
                justify-content: end;
                
            color: var(--white);
            line-height: 100%;
            }
                .muvectorhero {
        font-weight: 300 !important;
            position: relative;
    z-index: 1;
    }
    .homeHeroSection .muHeroButtonWrap {
            flex-direction: column;
            gap: 20px;
        }
        .homeHeroSection .muHeroButtonWrap
 {
            flex-direction: column;
            gap: 20px;
        }
         .heroRightButtons {
            padding-left: unset;
            gap: 12px;
        }
                    .muHeroLogos {
                margin: 0;
            }
                        .btnWhite {
                width: 100%;
            }
                        .heroLeft {
                padding: 16px;
            }
            .muvectorhero {
        font-weight: 300 !important;
    }
    .muHeroLogos{
        justify-content: center;
    }
            



        }

        .intersectHero{
                        padding-top: 47px !important; 

                                .techHeroSectionWrapper {
            width: 100%;
        }
            .techHeroSectionWrapper {
        position: relative;
    }

    .masterImage {
    width: 100%;
    position: relative;
    line-height: 0;
    border-radius: 8px;
    overflow: hidden;
}
        .studentWrapperHeadingDiv {
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

                .heroHeading {
                    display: flex;
        flex-direction: column;
            gap: 16px;
            padding-inline: 5px;
        }
                .studentPara {
            font-size: 22px;
        }
                .studentPBold {
            font-size: 24px;
        }
                .techHeroSection .intersectHeroBtn {
            width: 100%;
            align-items: flex-start;
            gap: 12px;
            flex-direction: column;
        }
                 .intersectHeroBtn {
            width: 100%;
            align-items: flex-start;
            gap: 12px;
            flex-direction: column;
        }
        .whiteFillButton{
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
        .btnWhite.outline {
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


      }
</style>
`

// Component Categories
const componentCategories: ComponentCategory[] = [
  {
    id: "hero",
    name: "Hero Section",
    versions: heroSectionVersions
  },
  {
    id: "one-column",
    name: "One Column",
    versions: [] // Will be added later
  },
  {
    id: "two-column",
    name: "Two Column",
    versions: [] // Will be added later
  }
]

export default function ComponentsPanel({
  html,
  onHtmlChange,
  selectedTheme = "mastersunion"
}: ComponentsPanelProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(["hero"]) // Hero section open by default
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleComponentSelect = (componentHtml: string) => {
    // Check if styles are already in the HTML
    const hasHeroStyles = html.includes('homeHeroSection') || html.includes('heroSection') || html.includes('intersectHero')
    
    if (!html || html.trim() === "") {
      // If no HTML exists, create a basic structure with styles
      const newHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  ${hasHeroStyles ? '' : heroSectionStyles}
</head>
<body>
${componentHtml}
</body>
</html>`
      onHtmlChange(newHtml)
      return
    }

    // Parse existing HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    
    // Get head content
    let headContent = doc.head ? doc.head.innerHTML : ""
    
    // Add hero styles if not already present
    if (!hasHeroStyles && (componentHtml.includes('homeHeroSection') || componentHtml.includes('heroSection') || componentHtml.includes('intersectHero'))) {
      headContent = headContent + heroSectionStyles
    }
    
    // Get body content
    const bodyContent = doc.body ? doc.body.innerHTML : ""
    
    // Insert component at the top of body
    const newBodyContent = componentHtml + "\n" + bodyContent
    
    // Reconstruct HTML
    const newHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headContent}
</head>
<body>
${newBodyContent}
</body>
</html>`
    
    onHtmlChange(newHtml)
    setSelectedVersion(null)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Components</p>
        <p className={styles.subtitle}>Select a component to add</p>
      </div>

      <div className={styles.categoriesList}>
        {componentCategories.map(category => (
          <div key={category.id} className={styles.categoryItem}>
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={styles.categoryHeader}
            >
              <span className={styles.categoryName}>{category.name}</span>
              <svg
                className={`${styles.chevron} ${
                  openCategories.includes(category.id) ? styles.chevronOpen : ""
                }`}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {openCategories.includes(category.id) && (
              <div className={styles.versionsList}>
                {category.versions.length === 0 ? (
                  <div className={styles.emptyVersions}>
                    <p>Coming soon</p>
                  </div>
                ) : (
                  category.versions.map(version => (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => handleComponentSelect(version.html)}
                      className={`${styles.versionItem} ${
                        selectedVersion === version.id ? styles.versionItemSelected : ""
                      }`}
                    >
                      <div className={styles.versionPreview}>
                        {version.preview ? (
                          <img
                            src={version.preview}
                            alt={version.name}
                            className={styles.previewImage}
                          />
                        ) : (
                          <div className={styles.previewPlaceholder}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className={styles.versionName}>{version.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

