export const Motion = {
  duration: {
    fast: 160,
    normal: 260,
    slow: 420,
  },
  stagger: 70,
  spring: {
    damping: 18,
    stiffness: 180,
    mass: 0.75,
  },
} as const

export const Elevation = {
  soft: {
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  raised: {
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
} as const
