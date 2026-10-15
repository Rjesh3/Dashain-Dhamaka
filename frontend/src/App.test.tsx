import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia')

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    window.localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia)
    } else {
      Reflect.deleteProperty(window, 'matchMedia')
    }
  })

  it('shows the Nepali landing page and the khasi artwork without contacting an API', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'दशैंमा खसी जित्ने मौका' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /खसीको चित्र/ })).toHaveAttribute('src', '/khasi.png')
    expect(screen.getByText(/no real goat is awarded/i)).toBeInTheDocument()
    expect(screen.getByText(/वास्तविक खसी दिइँदैन/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /PLAY NOW.*खेल सुरु गर्नुहोस्/ })).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('starts a local game after the landing call to action is selected', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /PLAY NOW.*खेल सुरु गर्नुहोस्/ }))

    expect(await screen.findByRole('heading', { name: 'अङ्कको थैली' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/play')
    expect(screen.getByText(/^http:\/\/localhost:3000\/\?r=[A-Z0-9]{8}$/)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('spins locally, awards points, and persists the result', async () => {
    window.history.pushState({}, '', '/play')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    })

    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'स्पिन गर्नुहोस्' }))

    const resultDialog = await screen.findByRole('dialog')
    expect(resultDialog).toHaveTextContent('10 अङ्क')
    expect(resultDialog).toHaveTextContent('वास्तविक खसी दिइँदैन।')
    expect(document.querySelector('.wallet-total')).toHaveTextContent('10 अङ्क')
    expect(screen.getByText('असीमित स्पिन · 1 स्पिन खेलियो')).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('dashain-dhamaka-game') ?? '{}')).toMatchObject({
      points: 10,
      spins_used: 1,
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows the wheel, khasi target progress, and local-only game rules', async () => {
    window.history.pushState({}, '', '/play')
    render(<App />)

    const wheel = await screen.findByRole('img', {
      name: 'अङ्क जित्ने चक्र: 10 अङ्क, 100 अङ्क, 200 अङ्क, 500 अङ्क, 700 अङ्क, 1,000 अङ्क, 10,000 अङ्क',
    })
    const wallet = screen.getByRole('heading', { name: 'अङ्कको थैली' }).closest('article')
    expect(wheel).toHaveStyle({ backgroundImage: expect.stringContaining('conic-gradient') })
    expect(wallet).toHaveTextContent('100,000 अङ्क = खसी लक्ष्य')
    expect(wallet).toHaveTextContent('भर्चुअल लक्ष्य मात्र — वास्तविक खसी पुरस्कार होइन।')
    expect(screen.getByRole('progressbar', { name: 'खसी लक्ष्यतर्फको प्रगति' })).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('खसी लक्ष्यसम्म 100% बाँकी')).toBeInTheDocument()
    expect(screen.getByText(/नतिजा यही ब्राउजरमा अनियमित रूपमा छानिन्छ/)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('awards share points and restores both points and the share code from local storage', async () => {
    window.history.pushState({}, '', '/play')
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

    const firstRender = render(<App />)
    const shareLink = await screen.findByText(/^http:\/\/localhost:3000\/\?r=[A-Z0-9]{8}$/)
    const savedLink = shareLink.textContent
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(savedLink))
    expect(await screen.findByRole('status')).toHaveTextContent('Share गर्नुभयो! 1,000 अङ्क थपियो।')
    expect(JSON.parse(window.localStorage.getItem('dashain-dhamaka-game') ?? '{}')).toMatchObject({
      points: 1000,
      spins_used: 0,
    })
    firstRender.unmount()

    render(<App />)
    expect(await screen.findByText('1000 अङ्क')).toBeInTheDocument()
    expect(screen.getByText('खसी लक्ष्यसम्म 99% बाँकी')).toBeInTheDocument()
    expect(screen.getByText(savedLink as string)).toBeInTheDocument()
  })

  it('shares through the native chooser and awards points only after the share completes', async () => {
    window.history.pushState({}, '', '/play')
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })

    render(<App />)
    const shareLink = await screen.findByText(/^http:\/\/localhost:3000\/\?r=[A-Z0-9]{8}$/)

    fireEvent.click(screen.getByRole('button', { name: 'Messenger' }))
    await waitFor(() => expect(share).toHaveBeenCalledWith({
      title: 'Dashain Dhamaka',
      url: shareLink.textContent,
    }))
    expect(await screen.findByRole('status')).toHaveTextContent('Share गर्नुभयो! 1,000 अङ्क थपियो।')
  })

  it('opens WhatsApp and Facebook share composers with the referral link', async () => {
    window.history.pushState({}, '', '/play')
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<App />)
    const shareLink = await screen.findByText(/^http:\/\/localhost:3000\/\?r=[A-Z0-9]{8}$/)
    const url = shareLink.textContent as string

    fireEvent.click(screen.getByRole('button', { name: 'WhatsApp' }))
    expect(open).toHaveBeenLastCalledWith(`https://wa.me/?text=${encodeURIComponent(url)}`, '_self')

    fireEvent.click(screen.getByRole('button', { name: 'Facebook' }))
    expect(open).toHaveBeenLastCalledWith(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_self',
    )
  })

  it('opens the Nepali game rules from the navigation', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: /Game Rules/ }))

    expect(await screen.findByRole('heading', { name: 'चक्रका नतिजा र सम्भावना' })).toBeInTheDocument()
    expect(document.title).toBe('खेलका नियम — Dashain Dhamaka')
    expect(fetch).not.toHaveBeenCalled()
  })
})
