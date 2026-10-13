This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Prefer Docker (same pattern as `backend/`):

```bash
cd frontend
cp -n .env.example .env.local   # if needed
docker compose run --rm npm install
docker compose up
# if host port 3000 is taken:
# FRONTEND_PORT=3001 docker compose up
```

Any npm command via the tools service:

```bash
docker compose run --rm npm install <package>
docker compose run --rm npm run lint
docker compose run --rm npm run build
```

Or locally (requires Node 20+ and `npm install` first):

```bash
npm install
npm run dev
```

Open [http://localhost:9091](http://localhost:9091) with your browser (default Docker host port).

Cross-domain deploy: set `NEXT_PUBLIC_API_URL` to the full HTTPS API URL. Backend must allow this origin in `FRONTEND_ORIGINS` and use `SameSite=None` cookies (see `backend/README.md`).

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
