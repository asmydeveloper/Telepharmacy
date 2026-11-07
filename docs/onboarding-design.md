# C112 onboarding redesign

Evidence: CDC Visual Communication recommends imagery supporting a clear main message, with headings and captions. https://www.cdc.gov/health-literacy/php/develop-materials/visual-communication.html

Design assumption: one subject per slide, concise readable text, optional skip and existing carousel controls. Not patient-tested.

Built-in image generation prompt set: premium soft dimensional pharmacy illustration; light ivory/mint and teal #035C67; soft daylight; no text or UI. Subjects: Thai female pharmacist and identity badge; neighborhood pharmacy storefront and clock; pharmacist explaining medicine to adult customer.

Assets saved in public/assets/onboarding/{pharmacist,pharmacy,consultation}-v2.webp, compressed for app use. Artwork is illustrative, not a real identity or licence.

Reference revision: layered, slightly rotated photo cards on a white canvas, with concise centered copy and a bottom CTA. Existing generated imagery is reused as code-composed collages to avoid extra image payload. This is a visual composition change; the three subjects, safety note and navigation remain unchanged.

## Photographic replacement — 7 November 2026
Generated with built-in image generation, not CLI. Saved in `public/assets/onboarding/{pharmacist,pharmacy,consultation}-photo-v3.webp`. Synthetic photographic subjects; not actual staff or branches. Existing collage composition and navigation preserved.

### pharmacist
Use case: photorealistic-natural. Asset: photo for MITRAREE pharmacy app onboarding card. A candid editorial photograph of a real Thai female pharmacist aged around 30, wearing a white coat over a teal blouse, standing behind the counter of a real bright neighborhood pharmacy in Bangkok. She looks warmly at camera, relaxed professional expression. Shelves of real medicine boxes softly out of focus. Waist-up portrait, centered subject, natural skin pores, realistic hands, authentic human proportions. Shot with a professional full-frame camera, 50mm lens, soft window daylight, subtle warm white and deep teal #035C67 accents, neutral true-to-life colors. Landscape 4:3 composition suitable for cropped portrait cards. MUST look like a real photograph. No cartoon, no illustration, no 3D render, no CGI, no clay, no plastic skin, no miniature, no floating objects, no drawn badges, no graphics, no UI, no readable text, no watermark.

### pharmacy
Use case: photorealistic-natural. Asset: photo for MITRAREE pharmacy app onboarding card. An architectural lifestyle photograph of a real small modern neighborhood pharmacy in Bangkok. Full glass storefront, white facade and subtle deep teal awning, welcoming entrance, medicine shelves visible inside. A real Thai female pharmacist in white coat standing at the open doorway. Plants beside door, natural city sidewalk, no fantasy architecture. Frame entire storefront with space around it. Shot with a professional full-frame camera, 50mm lens, soft window daylight, subtle warm white and deep teal #035C67 accents, neutral true-to-life colors. Landscape 4:3 composition suitable for cropped portrait cards. MUST look like a real photograph. No cartoon, no illustration, no 3D render, no CGI, no clay, no plastic skin, no miniature, no floating objects, no drawn badges, no graphics, no UI, no readable text, no watermark.

### consultation
Use case: photorealistic-natural. Asset: photo for MITRAREE pharmacy app onboarding card. A candid documentary photograph inside a real Bangkok pharmacy: a Thai female pharmacist wearing a white coat and teal blouse explaining a plain medicine box to a Thai adult woman across the counter. Both are real humans with natural skin texture, realistic anatomy, conversational expressions, natural hands. Medium two-person scene, shelves of medicines softly blurred behind them. Shot with a professional full-frame camera, 50mm lens, soft window daylight, subtle warm white and deep teal #035C67 accents, neutral true-to-life colors. Landscape 4:3 composition suitable for cropped portrait cards. MUST look like a real photograph. No cartoon, no illustration, no 3D render, no CGI, no clay, no plastic skin, no miniature, no floating objects, no drawn badges, no graphics, no UI, no readable text, no watermark.
