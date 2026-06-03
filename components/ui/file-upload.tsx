import * as React from "react"
import { Upload, X, File, Image, FileText } from "lucide-react"

import { cva, type VariantProps, cn } from "@/lib/utils"

const fileUploadVariants = cva(
  "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border-gray-200 hover:border-purple-400 hover:bg-purple-600/5",
        error:
          "border-red-500 hover:border-red-500 hover:bg-red-500/5",
        success:
          "border-green-500 hover:border-green-500 hover:bg-green-500/5",
      },
      size: {
        default: "p-8",
        sm: "p-4",
        lg: "p-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface FileUploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">,
    VariantProps<typeof fileUploadVariants> {
  onChange?: (files: File[]) => void
  accept?: string
  maxFiles?: number
  maxSize?: number
  showPreview?: boolean
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className,
      variant,
      size,
      onChange,
      accept,
      maxFiles = 1,
      maxSize = 5 * 1024 * 1024,
      showPreview = true,
      multiple,
      ...props
    },
    ref
  ) => {
    const [files, setFiles] = React.useState<File[]>([])
    const [error, setError] = React.useState<string>("")
    const [isDragging, setIsDragging] = React.useState(false)

    const handleFiles = (newFiles: FileList | null) => {
      if (!newFiles) return

      const fileArray = Array.from(newFiles)
      const validFiles: File[] = []

      for (const file of fileArray) {
        if (files.length + validFiles.length >= maxFiles) {
          setError(`Maximum ${maxFiles} file(s) allowed`)
          break
        }
        if (maxSize && file.size > maxSize) {
          setError(`File ${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`)
          continue
        }
        validFiles.push(file)
      }

      if (validFiles.length > 0) {
        const updatedFiles = [...files, ...validFiles]
        setFiles(updatedFiles)
        onChange?.(updatedFiles)
        setError("")
      }
    }

    const removeFile = (index: number) => {
      const updatedFiles = files.filter((_, i) => i !== index)
      setFiles(updatedFiles)
      onChange?.(updatedFiles)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = () => {
      setIsDragging(false)
    }

    const getFileIcon = (type: string) => {
      if (type.startsWith("image/")) return Image
      if (type.includes("pdf") || type.includes("document")) return FileText
      return File
    }

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return bytes + " B"
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
      return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    }

    return (
      <div className="space-y-4">
        <label
          className={cn(
            fileUploadVariants({ variant: error ? "error" : variant, size }),
            isDragging && "border-purple-500 bg-purple-600/10",
            className
          )}
        >
          <input
            ref={ref}
            type="file"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            accept={accept}
            multiple={multiple || maxFiles > 1}
            {...props}
          />
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-purple-600/10 p-3">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                Click or drag file here
              </p>
              <p className="text-xs text-gray-500">
                {accept ? `Accepted: ${accept}` : "Any file"}
                {maxSize && ` • Max: ${formatFileSize(maxSize)}`}
              </p>
            </div>
          </div>
        </label>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {showPreview && files.length > 0 && (
          <ul className="space-y-2">
            {files.map((file, index) => {
              const Icon = getFileIcon(file.type)
              return (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-purple-600" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="rounded-md p-1 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }
)
FileUpload.displayName = "FileUpload"

export { FileUpload, fileUploadVariants }
