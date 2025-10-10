"use client"

import {
  motion,
  MotionValue,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion"
import Link from "next/link"

import { useId } from "react"

function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: {
  width: number
  height: number
  x: number | string
  y?: number | string
  squares?: [number, number][]
  className?: string
}) {
  let patternId = useId()

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  )
}

function CardPattern({
  mouseX,
  mouseY,
  ...gridProps
}: {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  [key: string]: any
}) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] group-hover:opacity-50">
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-warm-grey-2/[0.02] stroke-warm-grey-2/5"
          {...gridProps}
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-warm-grey-2/20 to-warm-grey-1/20 opacity-0 transition duration-300 group-hover:opacity-100"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
        style={style}
      >
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-warm-grey-2/50 stroke-warm-grey-2/70"
          {...gridProps}
        />
      </motion.div>
    </div>
  )
}

export default function CategoryCard({
  href,
  name,
  description,
  icon,
  pattern,
}: {
  href: string
  name: string
  description: string
  icon: React.ReactNode
  pattern: {
    y: number
    squares: [number, number][]
  }
}) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: {
    currentTarget: HTMLDivElement
    clientX: number
    clientY: number
  }) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      key={href}
      onMouseMove={onMouseMove}
      className="group relative flex rounded-2xl bg-warm-grey-2/10 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-warm-grey-2/5"
    >
      <CardPattern {...pattern} mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-warm-grey-2/20 group-hover:ring-warm-grey-2/30" />
      <div className="relative rounded-2xl p-6 pt-16">
        <div className="[&>*]:text-warm-white/60 [&>*]:group-hover:text-warm-white/80">
          {icon}
        </div>
        <h3 className="mt-4 font-semibold leading-7 text-warm-white">
          <Link href={href}>
            <span className="absolute inset-0 rounded-2xl" />
            {name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-warm-white/80">{description}</p>
      </div>
    </div>
  )
}
