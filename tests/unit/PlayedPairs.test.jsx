import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PlayedPairs from '../../src/components/game/PlayedPairs/PlayedPairs'

describe('PlayedPairs Component', () => {
  const mockPairs = [
    {
      id: 'pair1',
      cards: [
        { id: 'card1', name: 'Fish', emoji: '🐟', color: 'blue', value: 1 },
        { id: 'card2', name: 'Fish', emoji: '🐟', color: 'blue', value: 1 }
      ],
      hasEffect: true,
      effectText: '+2'
    },
    {
      id: 'pair2',
      cards: [
        { id: 'card3', name: 'Crab', emoji: '🦀', color: 'red', value: 2 },
        { id: 'card4', name: 'Crab', emoji: '🦀', color: 'red', value: 2 }
      ],
      hasEffect: false
    }
  ]

  describe('Full View', () => {
    it('renders empty state when no pairs', () => {
      render(<PlayedPairs pairs={[]} />)
      expect(screen.getByText('No pairs played yet')).toBeInTheDocument()
    })

    it('renders played pairs correctly', () => {
      render(<PlayedPairs pairs={mockPairs} />)
      expect(screen.getByText('YOUR PLAYED PAIRS')).toBeInTheDocument()
      expect(screen.getAllByText('🐟')).toHaveLength(2)
      expect(screen.getAllByText('🦀')).toHaveLength(2)
    })

    it('shows effect indicator when pair has effect', () => {
      render(<PlayedPairs pairs={mockPairs} />)
      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('handles pair click', () => {
      const onPairClick = vi.fn()
      render(<PlayedPairs pairs={mockPairs} onPairClick={onPairClick} />)

      const firstPair = screen.getByLabelText('Pair of Fish')
      fireEvent.click(firstPair)

      expect(onPairClick).toHaveBeenCalledWith(mockPairs[0])
    })
  })

  describe('Compact View', () => {
    it('renders compact view for opponents', () => {
      render(<PlayedPairs pairs={mockPairs} isCompact={true} />)
      expect(screen.getByText('Played:')).toBeInTheDocument()
      expect(screen.getByText('🐟🐟')).toBeInTheDocument()
      expect(screen.getByText('🦀🦀')).toBeInTheDocument()
    })

    it('shows None when no pairs in compact view', () => {
      render(<PlayedPairs pairs={[]} isCompact={true} />)
      expect(screen.getByText('None')).toBeInTheDocument()
    })
  })

  describe('Collapsible Behavior', () => {
    it('toggles collapsed state when header is clicked', () => {
      render(<PlayedPairs pairs={mockPairs} isCollapsible={true} />)

      const header = screen.getByRole('button', { name: /YOUR PLAYED PAIRS/i })
      expect(screen.getByText('▼')).toBeInTheDocument()

      fireEvent.click(header)
      expect(screen.getByText('▶')).toBeInTheDocument()
    })

    it('respects defaultCollapsed prop', () => {
      render(<PlayedPairs pairs={mockPairs} isCollapsible={true} defaultCollapsed={true} />)
      expect(screen.getByText('▶')).toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('applies custom className', () => {
      const { container } = render(<PlayedPairs pairs={[]} className="custom-class" />)
      expect(container.firstChild).toHaveClass('played-pairs', 'custom-class')
    })

    it('applies correct modifiers', () => {
      const { container } = render(
        <PlayedPairs pairs={[]} isCompact={true} isCollapsible={true} />
      )
      expect(container.firstChild).toHaveClass(
        'played-pairs',
        'played-pairs--compact',
        'played-pairs--collapsible'
      )
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<PlayedPairs pairs={mockPairs} isCollapsible={true} />)

      const header = screen.getByRole('button', { name: /YOUR PLAYED PAIRS/i })
      expect(header).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(header)
      expect(header).toHaveAttribute('aria-expanded', 'false')
    })

    it('provides meaningful labels for pairs', () => {
      render(<PlayedPairs pairs={mockPairs} onPairClick={vi.fn()} />)
      expect(screen.getByLabelText('Pair of Fish')).toBeInTheDocument()
      expect(screen.getByLabelText('Pair of Crab')).toBeInTheDocument()
    })
  })
})