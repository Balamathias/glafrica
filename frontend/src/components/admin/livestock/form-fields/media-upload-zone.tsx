"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Upload, Image, Video, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]

interface MediaUploadZoneProps {
  onFilesAdded: (files: File[]) => void
}

export function MediaUploadZone({ onFilesAdded }: MediaUploadZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = []
    const errors: string[] = []

    for (const file of files) {
      const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type)
      const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type)

      if (!isImage && !isVideo) {
        errors.push(`${file.name}: Unsupported file type`)
        continue
      }

      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
      if (file.size > maxSize) {
        const maxMB = maxSize / (1024 * 1024)
        errors.push(`${file.name}: File too large (max ${maxMB}MB)`)
        continue
      }

      valid.push(file)
    }

    return { valid, errors }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const { valid, errors } = validateFiles(Array.from(files))

    if (errors.length > 0) {
      setError(errors.join("; "))
      setTimeout(() => setError(null), 5000)
    }

    if (valid.length > 0) {
      onFilesAdded(valid)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset input so the same file can be selected again
    e.target.value = ""
  }

  return (
    <div className="space-y-2">
      {/* Drop Zone */}
      <motion.div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed transition-all",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border/50 bg-muted/30"
        )}
        animate={{
          scale: isDragging ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(",")}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center py-10 px-6">
          <motion.div
            className={cn(
              "rounded-full p-4 mb-4",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}
            animate={{
              y: isDragging ? -5 : 0,
            }}
          >
            <Upload
              className={cn(
                "h-8 w-8",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </motion.div>

          <p className="text-sm font-medium text-center">
            {isDragging ? (
              <span className="text-primary">Drop files here</span>
            ) : (
              <>
                <span className="text-primary">Click to upload</span> or drag and drop
              </>
            )}
          </p>

          <p className="mt-1 text-xs text-muted-foreground text-center">
            Images (JPG, PNG, WebP) up to 10MB
            <br />
            Videos (MP4, WebM) up to 50MB
          </p>

          {/* File type icons */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Image className="h-4 w-4" />
              Images
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Video className="h-4 w-4" />
              Videos
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-xs">{error}</span>
        </motion.div>
      )}
    </div>
  )
}
