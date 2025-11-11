import React, { useEffect, useRef, useState, useCallback } from 'react'

function App() {
  const [started, setStarted] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const audioRef = useRef(null)
  const heartsRef = useRef(null)
  const sparksRef = useRef(null)
  const dustCanvasRef = useRef(null)

  // Floating dust particles (depth layer)
  useEffect(() => {
    const canvas = dustCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const particles = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }))

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    let raf
    const render = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8)
        grad.addColorStop(0, `rgba(120,170,255,${p.a})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [replayKey])

  // Floating hearts occasionally
  useEffect(() => {
    const container = heartsRef.current
    if (!container) return

    const spawnHeart = () => {
      const heart = document.createElement('div')
      heart.className = 'floating-heart'
      heart.innerHTML = '❤'
      heart.style.left = Math.random() * 90 + '%'
      heart.style.opacity = String(0.6 + Math.random() * 0.4)
      heart.style.filter = 'drop-shadow(0 0 10px rgba(0,150,255,0.8))'
      container.appendChild(heart)
      setTimeout(() => container.removeChild(heart), 7000)
    }

    const interval = setInterval(spawnHeart, 2500)
    return () => clearInterval(interval)
  }, [replayKey])

  // Cursor/tap blue sparks trail
  useEffect(() => {
    const container = sparksRef.current
    if (!container) return

    const spawnSpark = (x, y) => {
      const spark = document.createElement('div')
      spark.className = 'spark'
      spark.style.left = x + 'px'
      spark.style.top = y + 'px'
      spark.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`
      spark.style.opacity = String(0.7 + Math.random() * 0.3)
      container.appendChild(spark)
      setTimeout(() => container.removeChild(spark), 600)
    }

    const onMove = (e) => {
      const x = e.clientX
      const y = e.clientY
      for (let i = 0; i < 2; i++) spawnSpark(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10)
    }

    const onTouch = (e) => {
      for (const t of Array.from(e.touches)) {
        for (let i = 0; i < 4; i++) spawnSpark(t.clientX + (Math.random() - 0.5) * 12, t.clientY + (Math.random() - 0.5) * 12)
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchstart', onTouch)
    window.addEventListener('touchmove', onTouch)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [replayKey])

  // Smooth lighting transitions on scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      const h = window.innerHeight || 1
      const t = Math.min(1, y / h)
      document.documentElement.style.setProperty('--light-shift', String(t))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleStart = useCallback(() => {
    setStarted(true)
    try {
      audioRef.current?.play().catch(() => {})
    } catch {}
  }, [])

  const handlePlayMusic = useCallback(() => {
    try {
      audioRef.current?.play()
    } catch {}
  }, [])

  const handleReplay = () => {
    setReplayKey((k) => k + 1)
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#05070D] text-white font-[Poppins] selection:bg-blue-700/40 selection:text-white">
      {/* Background gradient + animated flame layers */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_100%,rgba(0,80,160,0.25),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_90%,rgba(0,130,255,0.18),transparent_70%)] animate-flame-slow mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_90%_95%,rgba(0,60,140,0.22),transparent_70%)] animate-flame-fast mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#02030A,transparent_30%,transparent_70%,#02030A)]"></div>
      </div>

      {/* Floating dust canvas */}
      <canvas ref={dustCanvasRef} className="pointer-events-none fixed inset-0 -z-10 opacity-70" />

      {/* Spline hero cover background */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-[0.85]">
          <spline-viewer
            url="https://prod.spline.design/rvFZ5oikmZSIbmGQ/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          ></spline-viewer>
        </div>

        {/* overlay vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]"></div>

        {/* Center content */}
        <div key={replayKey} className="relative z-10 px-6 text-center max-w-3xl">
          <div className="animate-hero-enter">
            <h1 className="text-[9vw] sm:text-6xl md:text-7xl font-semibold tracking-wide leading-tight drop-shadow-[0_0_20px_rgba(0,150,255,0.35)] text-transparent bg-clip-text bg-gradient-to-br from-blue-200 via-blue-400 to-blue-200 [text-shadow:0_0_12px_rgba(30,144,255,0.65)]">
              gatau gabut, btw u cantik banget hari ini 💙
            </h1>
            <p className="mt-4 text-xl sm:text-2xl text-blue-200/90 font-[\'Great_Vibes\'] italic drop-shadow-[0_0_10px_rgba(0,120,255,0.5)]">
              from Khal
            </p>

            {/* CTA hearts */}
            <div className="mt-10 flex items-center justify-center gap-6">
              <button
                onClick={started ? handlePlayMusic : handleStart}
                className="group relative inline-flex items-center gap-3 rounded-full px-6 py-3 text-lg font-medium text-blue-100 transition-all hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-700/40 via-blue-500/30 to-blue-700/40 blur-[10px] opacity-80 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative z-10">Tap the heart for music</span>
                <span className="relative z-10 text-2xl animate-pulse-soft glow-heart">❤</span>
              </button>
            </div>

            {/* Optional replay */}
            <div className="mt-16">
              <button
                onClick={handleReplay}
                className="text-sm text-blue-300/80 hover:text-blue-200 transition-colors underline decoration-blue-500/50 underline-offset-4"
              >
                replay animation
              </button>
            </div>
          </div>
        </div>

        {/* hearts layer */}
        <div ref={heartsRef} className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"></div>

        {/* sparks container */}
        <div ref={sparksRef} className="pointer-events-none fixed inset-0 -z-0"></div>
      </section>

      {/* Subtle content section to allow scroll and lighting shift */}
      <section className="relative py-24 sm:py-28 md:py-32 px-6 md:px-10 bg-gradient-to-b from-transparent via-[#05070D] to-[#04050A]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-semibold text-blue-100/90">A note in blue</h2>
              <p className="text-blue-200/70 leading-relaxed">
                A quiet confession wrapped in neon and night — the kind of feeling that glows softly, like a flame that never burns out. Let the music set the mood. Breathe in the light. Stay a while.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 bg-blue-600/10 blur-2xl rounded-3xl"></div>
              <div className="relative rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0A0F1F]/70 to-[#04060C]/70 p-6 backdrop-blur-md shadow-[0_0_40px_rgba(0,120,255,0.15)]">
                <ul className="text-blue-200/80 space-y-3">
                  <li className="flex items-center gap-3"><span className="text-blue-300">•</span> Gentle animated flames in the dark</li>
                  <li className="flex items-center gap-3"><span className="text-blue-300">•</span> Floating hearts and dust for depth</li>
                  <li className="flex items-center gap-3"><span className="text-blue-300">•</span> Tap a glowing heart to play ambient music</li>
                  <li className="flex items-center gap-3"><span className="text-blue-300">•</span> Cursor sparks, soft glow, cinematic vibe</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audio element (user-gesture only) */}
      <audio ref={audioRef} loop preload="auto">
        <source src="https://cdn.pixabay.com/download/audio/2023/01/30/audio_ba1793b97c.mp3?filename=ambient-cinematic-140983.mp3" type="audio/mpeg" />
      </audio>

      {/* Page footer spacing */}
      <footer className="py-10 text-center text-blue-300/50 text-sm">Made with a blue flame</footer>
    </div>
  )
}

export default App
