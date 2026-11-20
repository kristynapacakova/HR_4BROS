export const dynamic = 'force-dynamic'

// Returns the deployed commit SHA so the client can detect a new deployment.
export async function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_DEPLOYMENT_ID ??
    'dev'
  return Response.json({ version }, { headers: { 'Cache-Control': 'no-store' } })
}
