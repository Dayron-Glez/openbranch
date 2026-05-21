import { revalidateTag } from "next/cache"
import { createHmac, timingSafeEqual } from "crypto"

function verifyHmac(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-hub-signature-256")
  const body = await req.text()

  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    console.warn("[revalidate] REVALIDATE_SECRET not set, rejecting webhook")
    return new Response("Not configured", { status: 500 })
  }

  if (!verifyHmac(body, signature, secret)) {
    return new Response("Invalid signature", { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = JSON.parse(body)
  const modifiedFiles: string[] =
    payload.commits?.flatMap(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => [...(c.modified ?? []), ...(c.added ?? [])]
    ) ?? []

  let revalidated = 0
  for (const file of modifiedFiles) {
    const match = /^content\/docs\/(.+)\.(?:en\.)?mdx$/.exec(file)
    if (match) {
      revalidateTag(`revisions:${match[1]}`, "max")
      revalidated++
    }
  }

  return Response.json({ ok: true, revalidated })
}
