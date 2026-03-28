import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getFromR2 } from "@/lib/r2"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const key = req.nextUrl.searchParams.get("key")
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 })
  }

  // Only allow access to the requesting user's own files
  if (!key.startsWith(`uploads/${session.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let r2Response: Awaited<ReturnType<typeof getFromR2>>
  try {
    r2Response = await getFromR2(key)
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const { body, contentType, contentLength } = r2Response
  const asAttachment = req.nextUrl.searchParams.get("download") === "1"
  const rawName = req.nextUrl.searchParams.get("filename") ?? key.split("/").pop() ?? "download"
  // Strip characters that would break the Content-Disposition header value
  const safeName = rawName.replace(/[\r\n"]/g, "").trim() || "download"
  const encodedName = encodeURIComponent(safeName)
  const disposition = asAttachment ? "attachment" : "inline"

  const headers: Record<string, string> = {
    "Content-Type": contentType ?? "application/octet-stream",
    "Content-Disposition": `${disposition}; filename="${safeName}"; filename*=UTF-8''${encodedName}`,
    "Cache-Control": "private, max-age=3600",
  }

  if (contentLength !== undefined) {
    headers["Content-Length"] = String(contentLength)
  }

  return new NextResponse(body as BodyInit, { headers })
}
