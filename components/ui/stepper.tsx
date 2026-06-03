import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const stepperVariants = cva(
  "flex items-center",
  {
    variants: {
      orientation: {
        horizontal: "flex-row w-full",
        vertical: "flex-col h-full",
      },
      size: {
        default: {
          step: "h-10 w-10 text-sm",
          icon: "h-5 w-5",
          line: "h-0.5 min-w-[50px]",
        },
        sm: {
          step: "h-8 w-8 text-xs",
          icon: "h-4 w-4",
          line: "h-0.5 min-w-[30px]",
        },
        lg: {
          step: "h-12 w-12 text-base",
          icon: "h-6 w-6",
          line: "h-1 min-w-[70px]",
        },
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      size: "default",
    },
  }
)

export interface Step {
  id: string
  title: string
  description?: string
}

export interface StepperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stepperVariants> {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, orientation, size, steps, currentStep, onStepClick, ...props }, ref) => {
    const getSizeClasses = (key: 'step' | 'icon' | 'line') => {
      const sizeKey = size || 'default'
      const sizes = {
        default: { step: "h-10 w-10 text-sm", icon: "h-5 w-5", line: "h-0.5 min-w-[50px]" },
        sm: { step: "h-8 w-8 text-xs", icon: "h-4 w-4", line: "h-0.5 min-w-[30px]" },
        lg: { step: "h-12 w-12 text-base", icon: "h-6 w-6", line: "h-1 min-w-[70px]" },
      }
      return sizes[sizeKey as keyof typeof sizes][key]
    }

    return (
      <div
        ref={ref}
        className={cn(stepperVariants({ orientation, className }))}
        {...props}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1
          const isClickable = onStepClick && index < currentStep
          const stepClass = getSizeClasses('step')
          const iconClass = getSizeClasses('icon')
          const lineClass = getSizeClasses('line')

          return (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "flex items-center gap-3",
                  orientation === "vertical" && "flex-row"
                )}
              >
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full border-2 font-medium transition-all",
                    stepClass,
                    isCompleted && "bg-green-600 border-green-600 text-white",
                    isCurrent && "border-purple-500 bg-purple-600/20 text-purple-400",
                    !isCompleted && !isCurrent && "border-purple-600/30 text-gray-500",
                    isClickable && "cursor-pointer hover:border-purple-400",
                    !isClickable && "cursor-default"
                  )}
                >
                  {isCompleted ? (
                    <Check className={cn("text-white", iconClass)} />
                  ) : (
                    index + 1
                  )}
                </button>

                <div className={cn(
                  "flex flex-col",
                  orientation === "vertical" && "ml-3"
                )}>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-purple-400",
                      isCompleted && "text-green-400",
                      !isCompleted && !isCurrent && "text-gray-500"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-gray-500 hidden sm:block">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "flex-1 mx-3",
                    orientation === "vertical" && "h-8 w-0.5 ml-[19px]",
                    orientation === "horizontal" && "h-0.5 flex-1"
                  )}
                >
                  <div
                    className={cn(
                      "w-full transition-colors",
                      lineClass,
                      isCompleted ? "bg-green-600" : "bg-purple-600/30"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }
)
Stepper.displayName = "Stepper"

export { Stepper, stepperVariants }
