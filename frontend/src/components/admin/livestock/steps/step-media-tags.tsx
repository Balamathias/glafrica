"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X, Play, Image as ImageIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLivestockForm } from "../livestock-form-context"
import { MediaUploadZone } from "../form-fields/media-upload-zone"
import { TagMultiSelect } from "../form-fields/tag-multi-select"

export function StepMediaTags() {
  const { state, updateField, addMedia, removeMedia, setFeaturedMedia } = useLivestockForm()
  const { errors, mediaFiles, featuredIndex, tag_ids } = state

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-semibold">Media & Tags</h3>
        <p className="text-sm text-muted-foreground">
          Upload photos and videos, then add tags to help buyers find this listing.
        </p>
      </div>

      {/* Media Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Photos & Videos <span className="text-destructive">*</span>
        </label>

        <MediaUploadZone onFilesAdded={addMedia} />

        {/* Error */}
        {errors.mediaFiles && (
          <motion.div
            className="flex items-center gap-2 text-sm text-destructive"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="h-4 w-4" />
            {errors.mediaFiles}
          </motion.div>
        )}

        {/* Media Preview Grid */}
        {mediaFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {mediaFiles.length} file{mediaFiles.length !== 1 ? "s" : ""} selected • Click the
              star to set featured image
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <AnimatePresence mode="popLayout">
                {mediaFiles.map((media, index) => (
                  <motion.div
                    key={media.id}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-muted/30"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    {/* Preview */}
                    {media.type === "image" ? (
                      <img
                        src={media.preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="relative h-full w-full">
                        <video
                          src={media.preview}
                          className="h-full w-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="rounded-full bg-white/90 p-2">
                            <Play className="h-6 w-6 text-foreground" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {index === featuredIndex && (
                      <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Featured
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {/* Set Featured */}
                      <button
                        type="button"
                        onClick={() => setFeaturedMedia(index)}
                        className={cn(
                          "rounded-full p-2 transition-colors",
                          index === featuredIndex
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/20 text-white hover:bg-white/30"
                        )}
                        title="Set as featured"
                      >
                        <Star
                          className="h-5 w-5"
                          fill={index === featuredIndex ? "currentColor" : "none"}
                        />
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeMedia(media.id)}
                        className="rounded-full p-2 bg-white/20 text-white hover:bg-destructive hover:text-white transition-colors"
                        title="Remove"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Type indicator */}
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white flex items-center gap-1">
                      {media.type === "video" ? (
                        <>
                          <Play className="h-3 w-3" />
                          Video
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-3 w-3" />
                          Image
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Tags <span className="text-muted-foreground text-xs font-normal">(optional)</span>
        </label>
        <TagMultiSelect
          value={tag_ids}
          onChange={(value) => updateField("tag_ids", value)}
        />
        <p className="text-xs text-muted-foreground">
          Tags help buyers discover your listing. You can select existing tags or create new ones.
        </p>
      </div>

      {/* Summary Preview */}
      {mediaFiles.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
          <h4 className="font-medium text-sm">Upload Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Images</p>
              <p className="font-semibold">
                {mediaFiles.filter((m) => m.type === "image").length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Videos</p>
              <p className="font-semibold">
                {mediaFiles.filter((m) => m.type === "video").length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Featured</p>
              <p className="font-semibold">
                {mediaFiles[featuredIndex]?.type === "video" ? "Video" : "Image"} #{featuredIndex + 1}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tags</p>
              <p className="font-semibold">{state.tag_ids.length} selected</p>
            </div>
          </div>
        </div>
      )}

      {/* Helper card */}
      <div className="rounded-xl bg-muted/50 p-4 space-y-3">
        <h4 className="font-medium text-sm">Media Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Upload high-quality images with good lighting</li>
          <li>• Include multiple angles - front, side, and full body shots</li>
          <li>• Short videos (under 1 minute) showcase movement and temperament</li>
          <li>• The featured image will be shown in search results and galleries</li>
          <li>• Use relevant tags to improve discoverability</li>
        </ul>
      </div>
    </div>
  )
}
