import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { uploadToR2 } from "@/lib/r2"
import { randomUUID } from "crypto"
import path from "path"

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
])

const FILE_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  // .toml may arrive as either of these depending on OS/browser
  "application/toml",
  "text/toml",
])

// Extensions whose MIME type browsers report inconsistently (e.g. as
// application/octet-stream). We accept these by extension as a fallback.
const ALLOWED_FILE_EXTENSIONS = new Set([
  ".ini", ".toml", ".yaml", ".yml",
])

const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024  // 10 MB

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const mimeType = file.type
  const fileExt = path.extname(file.name).toLowerCase()
  const isImage = IMAGE_MIME_TYPES.has(mimeType)
  // Accept by MIME type or by extension fallback for browsers that send
  // application/octet-stream for text-based formats like .ini and .toml
  const isFile = FILE_MIME_TYPES.has(mimeType) ||
    (mimeType === "application/octet-stream" && ALLOWED_FILE_EXTENSIONS.has(fileExt))

  if (!isImage && !isFile) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
  if (file.size > maxSize) {
    const limitMb = maxSize / 1024 / 1024
    return NextResponse.json(
      { error: `File exceeds ${limitMb} MB limit` },
      { status: 400 }
    )
  }

  const ext = path.extname(file.name).toLowerCase()
  const key = `uploads/${session.user.id}/${randomUUID()}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    await uploadToR2(key, buffer, mimeType)
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }

  return NextResponse.json({
    key,
    fileName: file.name,
    fileSize: file.size,
    mimeType,
    isImage,
  })
}
