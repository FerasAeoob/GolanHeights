This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Admin place photo uploads

Before deploying admin photo uploads, ensure these existing server-only variables
are configured in the hosting provider's **Production** environment:

- `CLOUDINARY_URL` (`cloudinary://<api_key>:<api_secret>@<cloud_name>`).
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, or the existing
  `KV_REST_API_URL` and `KV_REST_API_TOKEN` equivalents.

No new environment-variable names or dependencies are introduced. Local `.env.local`
settings do not establish production configuration. Privileged uploads use the
existing sensitive rate limiter (60 requests per hour per admin) and return 503
when production Redis configuration is missing or unavailable, rather than falling
back to process-local protection.

`POST /api/admin/place-images/upload` accepts one nonempty JPEG, PNG or WebP per
request, up to **4 MiB**; multipart bodies are capped at 4 MiB plus 64 KiB, below
Vercel's 4.5 MB function payload limit. Cloudinary stores WebP in `golan-places/admin`
with automatic quality and an aspect-preserving 2560 × 2560 cap without upscaling.
EXIF orientation is handled by Cloudinary's incoming transformation.

Reverse proxies must preserve the external Host (or `X-Forwarded-Host`) and
`X-Forwarded-Proto` so the endpoint can validate browser Origin correctly. The
PlaceForm sends `X-Requested-With: PlaceForm`; the endpoint does not enable CORS.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
