import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    window.localStorage.clear()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({
          player: { public_id: 'player-1234', share_code: 'ABCD1234' },
          state: {
            points: 0,
            spins_used: 0,
            spins_remaining: null,
            spin_limit: null,
            config_version: 1,
            outcomes: [
              { id: '10', label: '10', points: 10 },
              { id: '100', label: '100', points: 100 },
            ],
            last_results: [
              { spin_id: 'spin-1', outcome_id: '10', points_awarded: 10, created_at: '2026-10-12T00:00:00Z' },
              { spin_id: 'spin-2', outcome_id: '100', points_awarded: 100, created_at: '2026-10-12T00:00:00Z' },
            ],
          },
        }),
      }),
    )
  })

  it('shows the bilingual landing page and does not start a game before play is selected', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Play & Win iPhone 17 Pro Max!/i })).toBeInTheDocument()
    expect(screen.getByText('दशैं धमाका')).toBeInTheDocument()
    expect(screen.getByText('खेल्नुहोस् र जित्नुहोस् — iPhone 17 Pro Max!')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /वास्तविक पुरस्कार होइन/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /PLAY NOW.*खेल सुरु गर्नुहोस्/ })).toBeInTheDocument()
    expect(screen.getByText(/cannot be exchanged for an actual iPhone/i)).toBeInTheDocument()
    expect(screen.getByText(/वास्तविक iPhone सँग साट्न मिल्दैन/)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('navigates to the game only after the landing call to action is clicked', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /PLAY NOW.*खेल सुरु गर्नुहोस्/ }))

    expect(await screen.findByRole('heading', { name: 'अङ्कको थैली' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/play')
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/v1/sessions', expect.objectContaining({
      body: JSON.stringify({ locale: 'ne', ref: null }),
    })))
  })

  it('loads a Nepali session and shows the virtual-points result after a spin', async () => {
    window.history.pushState({}, '', '/play')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const isSpinRequest = String(input).includes('/v1/spins')
        const payload = isSpinRequest
          ? {
              spin: { outcome_id: '10', points_awarded: 10, replayed: false },
              state: {
                points: 10,
                spins_used: 1,
                spins_remaining: null,
                spin_limit: null,
                config_version: 1,
                outcomes: [{ id: '10', label: '10', points: 10 }],
                last_results: [],
              },
            }
          : {
              player: { public_id: 'player-1234', share_code: 'ABCD1234' },
              state: {
                points: 0,
                spins_used: 0,
                spins_remaining: null,
                spin_limit: null,
                config_version: 1,
                outcomes: [{ id: '10', label: '10', points: 10 }],
                last_results: [],
              },
            }

        return Promise.resolve({
          ok: true,
          text: async () => JSON.stringify(payload),
        })
      }),
    )

    render(<App />)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/v1/sessions', expect.objectContaining({
        body: JSON.stringify({ locale: 'ne', ref: null }),
      }))
    })
    fireEvent.click(await screen.findByRole('button', { name: 'स्पिन गर्नुहोस्' }))

    const resultDialog = await screen.findByRole('dialog', {}, { timeout: 6000 })
    expect(screen.getByRole('heading', { name: 'बधाई छ!' })).toBeInTheDocument()
    expect(resultDialog).toHaveTextContent('10 अङ्क')
    expect(resultDialog).toHaveTextContent('कुनै वास्तविक पुरस्कार दिइँदैन।')
    expect(resultDialog).not.toHaveTextContent('iPhone')
    expect(document.querySelector('.wheel')).toHaveStyle({ transform: 'rotate(2340deg)' })
    expect(document.querySelector('.wallet-total')).toHaveTextContent('10 अङ्क')
    expect(screen.getByText('असीमित स्पिन · 1 स्पिन खेलियो')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'बन्द गर्नुहोस्' })).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  }, 8000)

  it('shows a Nepali message for a server error', async () => {
    window.history.pushState({}, '', '/play')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => JSON.stringify({
          detail: { code: 'TEMPORARILY_UNAVAILABLE', message: 'Service temporarily unavailable' },
        }),
      }),
    )

    render(<App />)
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('सेवा अहिले उपलब्ध छैन।')
    expect(alert).not.toHaveTextContent('Service temporarily unavailable')
  })

  it('copies the referral link and confirms the action in Nepali', async () => {
    window.history.pushState({}, '', '/play')
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(<App />)
    await screen.findByText('http://localhost:3000/?r=ABCD1234')
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('http://localhost:3000/?r=ABCD1234'))
    expect(await screen.findByRole('status')).toHaveTextContent('Share गर्नुभयो! 1,000 अङ्क थपियो।')
  })

  it('shows aligned wheel values and the current points and spin totals', async () => {
    window.history.pushState({}, '', '/play')
    render(<App />)

    const wheel = await screen.findByRole('img', { name: 'अङ्क जित्ने चक्र: 10 अङ्क, 100 अङ्क' })
    const wallet = screen.getByRole('heading', { name: 'अङ्कको थैली' }).closest('article')
    expect(wheel).toHaveStyle({ backgroundImage: expect.stringContaining('conic-gradient') })
    expect(wallet?.compareDocumentPosition(wheel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(wallet).toHaveTextContent('100,000 अङ्क = iPhone लक्ष्य')
    expect(wallet).toHaveTextContent('भर्चुअल लक्ष्य मात्र — वास्तविक iPhone पुरस्कार होइन।')
    expect(wallet).not.toHaveTextContent('10 अङ्क10/12/2026')
    expect(screen.getByText('0 अङ्क')).toBeInTheDocument()
    expect(screen.getByText('असीमित स्पिन · 0 स्पिन खेलियो')).toBeInTheDocument()
    expect(screen.getByText('यो निःशुल्क भर्चुअल खेल हो। अङ्कको नगद मूल्य छैन र पुरस्कारसँग साट्न मिल्दैन।')).toBeInTheDocument()
    expect(wallet?.compareDocumentPosition(screen.getByText('यो निःशुल्क भर्चुअल खेल हो। अङ्कको नगद मूल्य छैन र पुरस्कारसँग साट्न मिल्दैन।'))).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(screen.queryByText(/सम्भावित नतिजा:/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Share to win' })).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'iPhone लक्ष्यतर्फको प्रगति' })).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('iPhone लक्ष्यसम्म 100% बाँकी')).toBeInTheDocument()
    expect(screen.queryByText(/WhatsApp\/Facebook को share window/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
    expect(screen.getByRole('banner').querySelector('.brand-wrap')).toBeNull()
    expect(screen.getByRole('contentinfo').querySelector('.footer-brand')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toHaveTextContent('दशैँको रमाइलो खेल')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Dashain Dhamaka')
  })

  it('awards 1,000 points for sharing and restores the points from local storage', async () => {
    window.history.pushState({}, '', '/play')
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    const firstRender = render(<App />)
    await screen.findByText('http://localhost:3000/?r=ABCD1234')
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))

    expect(await screen.findByText('1000 अङ्क')).toBeInTheDocument()
    expect(window.localStorage.getItem('dashain-dhamaka-points:player-1234')).toBe('1000')
    expect(screen.getByRole('progressbar', { name: 'iPhone लक्ष्यतर्फको प्रगति' })).toHaveAttribute('aria-valuenow', '1')
    firstRender.unmount()

    render(<App />)
    expect(await screen.findByText('1000 अङ्क')).toBeInTheDocument()
    expect(screen.getByText('iPhone लक्ष्यसम्म 99% बाँकी')).toBeInTheDocument()
  })

  it('shares to Messenger and Instagram through the native app chooser', async () => {
    window.history.pushState({}, '', '/play')
    const originalShare = Object.getOwnPropertyDescriptor(navigator, 'share')
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })

    try {
      render(<App />)
      await screen.findByText('http://localhost:3000/?r=ABCD1234')

      fireEvent.click(screen.getByRole('button', { name: 'Messenger' }))
      await waitFor(() => expect(share).toHaveBeenCalledTimes(1))
      expect(share).toHaveBeenLastCalledWith({
        title: 'Dashain Dhamaka',
        url: 'http://localhost:3000/?r=ABCD1234',
      })

      fireEvent.click(screen.getByRole('button', { name: 'Instagram DM' }))
      await waitFor(() => expect(share).toHaveBeenCalledTimes(2))
    } finally {
      if (originalShare) {
        Object.defineProperty(navigator, 'share', originalShare)
      } else {
        Reflect.deleteProperty(navigator, 'share')
      }
    }
  })

  it('redirects to WhatsApp and Facebook share composers with the referral link', async () => {
    window.history.pushState({}, '', '/play')
    const originalOpen = window.open
    const open = vi.fn()
    window.open = open

    try {
      render(<App />)
      await screen.findByText('http://localhost:3000/?r=ABCD1234')

      fireEvent.click(screen.getByRole('button', { name: 'WhatsApp' }))
      expect(open).toHaveBeenLastCalledWith(
        `https://wa.me/?text=${encodeURIComponent('http://localhost:3000/?r=ABCD1234')}`,
        '_self',
      )

      fireEvent.click(screen.getByRole('button', { name: 'Facebook' }))
      expect(open).toHaveBeenLastCalledWith(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('http://localhost:3000/?r=ABCD1234')}`,
        '_self',
      )
    } finally {
      window.open = originalOpen
    }
  })

  it('gives a referred friend their own unlimited-spin session', async () => {
    window.history.pushState({}, '', '/?r=ABCD1234')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /PLAY NOW.*खेल सुरु गर्नुहोस्/ }))

    expect(await screen.findByText('असीमित स्पिन · 0 स्पिन खेलियो')).toBeInTheDocument()
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/v1/sessions', expect.objectContaining({
      body: JSON.stringify({ locale: 'ne', ref: 'ABCD1234' }),
    })))
  })

  it('copies the referral link with app-specific instructions when native sharing is unavailable', async () => {
    window.history.pushState({}, '', '/play')
    const originalShare = Object.getOwnPropertyDescriptor(navigator, 'share')
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

    try {
      render(<App />)
      await screen.findByText('http://localhost:3000/?r=ABCD1234')

      fireEvent.click(screen.getByRole('button', { name: 'Messenger' }))
      expect(await screen.findByRole('status')).toHaveTextContent('Share गर्नुभयो! 1,000 अङ्क थपियो।')
      expect(writeText).toHaveBeenLastCalledWith('http://localhost:3000/?r=ABCD1234')

      fireEvent.click(screen.getByRole('button', { name: 'Instagram DM' }))
      expect(await screen.findByRole('status')).toHaveTextContent('Share गर्नुभयो! 1,000 अङ्क थपियो।')
    } finally {
      if (originalShare) {
        Object.defineProperty(navigator, 'share', originalShare)
      } else {
        Reflect.deleteProperty(navigator, 'share')
      }
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', originalClipboard)
      } else {
        Reflect.deleteProperty(navigator, 'clipboard')
      }
    }
  })

  it('opens the Nepali game rules from the navigation', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: /Game Rules/ }))

    expect(await screen.findByRole('heading', { name: 'चक्रका नतिजा र सम्भावना' })).toBeInTheDocument()
    expect(document.title).toBe('खेलका नियम — Dashain Dhamaka')
  })
})
