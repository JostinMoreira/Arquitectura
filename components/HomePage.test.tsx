import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders the component', () => {
    render(<HomePage />)
    expect(screen.getByRole('main')).toBeDefined()
  })
})
