# Higgsfield Prompts — Capital Solutions & Logistics Website

Two assets for the new site: a **logo page-loader animation** and a **hero section video**.
Brand: deep navy `#0E2440` / `#16365C` + gold `#C19A3E`. Logo file to upload as reference:
`...\Capital Solutions & Logistics\drive-download-...\LOGO\Van Decal Logo 1.png` (globe + gold upward arrow).

Aspect ratios: hero = 16:9 (also render a 9:16 for mobile). Loader = 1:1 (square, loops).
Append these **negative constraints** to every generation:
`no text artifacts, no warped or distorted logo, no extra letters, no morphing faces, no extra fingers, no watermark, no flicker, no jitter`

---

## 1) Page-Loader Animation (animated logo)

Upload the CSL logo as the reference image, then run image-to-video.

**Model**: Kling 3.0 (image-to-video)  ·  fallback: Higgsfield DoP (Turbo)
**Aspect ratio**: 1:1   **Duration**: 3s (loopable)   **Style**: Cinematic, premium

```
Using the provided reference image of the Capital Solutions & Logistics logo (a blue world globe wrapped by a golden upward-arcing arrow), animate a clean premium brand reveal on a deep navy background. The golden arrow sweeps smoothly up and around the globe leaving a soft gold light trail, the globe holds crisp and steady, then a gentle gold shimmer passes across the mark as it settles. Subtle, elegant, corporate — logo stays perfectly intact and legible the whole time.
```

**Camera**: Locked-off with a very slow push-in (subtle)
**Motion preset**: Subtle shimmer / light-sweep (keep motion minimal so it loops seamlessly)

> Tip: render 3s, then set it to loop in the site's loader. Keep the last frame ≈ the first frame for a clean loop. Export with a transparent or solid-navy background to match the site.

---

## 2) Hero Section Video (medical courier)

**Model**: Kling 3.0 / Video O3 (best for realistic people)  ·  alt for more scale/motion: Seedance 2.0
**Aspect ratio**: 16:9 (also render 9:16 for mobile)   **Duration**: 8s   **Style**: Cinematic, warm professional

```
A confident professional Black medical courier — a Black man in his 30s wearing a clean navy company polo — carries a labeled medical specimen cooler and a small pharmacy delivery bag from a spotless white cargo van toward a modern Richmond, Virginia medical office at golden-hour morning. He moves with calm purpose, gives a subtle reassuring nod, and hands the sealed package to a waiting Black female clinic receptionist in scrubs at the glass entrance. Clean, trustworthy, healthcare-grade professionalism. Soft warm daylight, crisp focus on the courier, shallow depth of field, subtle navy-and-gold color grade.
```

**Camera**: Slow cinematic tracking push-in that follows the courier, then settles on the hand-off
**Motion preset**: Smooth Steadicam follow
**Cast direction (required)**: all on-screen people are Black. Courier = Black man, 30s; receptionist = Black woman in scrubs. Neat, professional, friendly.

**9:16 mobile variant**: same prompt, reframe to vertical, keep the courier centered.

---

### Optional: still hero image (fallback / poster frame)
If you want a poster image behind the video (or a static hero for mobile):

**Model**: Soul 2.0 (portrait realism)  ·  or Nano Banana 2
**Aspect ratio**: 16:9

```
Editorial photo of a professional Black male medical courier in a navy company polo holding a labeled medical specimen cooler beside a clean white cargo van outside a modern Richmond medical clinic, golden-hour light, confident friendly expression, healthcare-grade professionalism, shallow depth of field, navy-and-gold color grade, high-end commercial photography.
```

Use this as the `poster` image on the hero `<video>` so the section looks great before the video loads.
