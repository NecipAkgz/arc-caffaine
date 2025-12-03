'use client'

import { NetworkIcon } from '@web3icons/react/dynamic'

interface ChainIconProps {
  name: string
  size?: number
  className?: string
}

export function ChainIcon({ name, size = 32, className = '' }: ChainIconProps) {
  return (
    <NetworkIcon
      name={name}
      variant="branded"
      size={size}
      className={className}
    />
  )
}
