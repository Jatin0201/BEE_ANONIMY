import { Link } from 'react-router-dom';
import { Bookmark, MoreHorizontal } from 'lucide-react';
import { landingPreviewPosts } from '@/data/mockData';
import { formatRelativeTime } from '@/lib/utils';
import type { Post } from '@/types';

// ─── Blob shapes — hand-drawn organic SVG blobs ──────────────────────────
// Top-fade mask: blobs near the top fade from transparent → opaque
const topFadeMask = 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 18%, rgba(0,0,0,0.7) 45%, black 75%)';

function BlobShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none">

      {/* ── LEFT SIDE ──────────────────────────────────────────────────── */}

      {/* Left — large sage blob, top-left — LUMPY with a concave notch on left shoulder, FADES at top */}
      <div className="absolute" style={{
        top: '60px', left: '-90px', width: '340px', height: '310px',
        WebkitMaskImage: topFadeMask,
        maskImage: topFadeMask,
      }}>
        <svg viewBox="0 0 340 310" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M196 10 C238 -18, 308 8, 330 72 C352 138, 318 208, 262 248
               C228 270, 182 282, 134 272 C88 262, 46 232, 22 190
               C-4 146, -8 84, 28 50 C52 26, 86 48, 108 38
               C138 24, 162 26, 196 10 Z"
            fill="#B5C4AC" fillOpacity="0.54"
          />
        </svg>
      </div>

      {/* Left — sand blob, mid-left — wide flat kidney with a deep waist dip on top edge */}
      <div className="absolute" style={{ top: '38%', left: '-28px', width: '200px', height: '108px' }}>
        <svg viewBox="0 0 200 108" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M32 72 C8 54, 4 24, 38 10 C62 0, 92 14, 108 6
               C128 -4, 158 2, 178 24 C200 48, 196 82, 168 96
               C144 108, 108 98, 84 104 C60 110, 56 90, 32 72 Z"
            fill="#D9CDBF" fillOpacity="0.55"
          />
        </svg>
      </div>

      {/* Left — terracotta blob, bottom-left — chunky asymmetric wedge, heavy on one side */}
      <div className="absolute" style={{ bottom: '20px', left: '-50px', width: '270px', height: '230px' }}>
        <svg viewBox="0 0 270 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M80 14 C118 -10, 194 -4, 234 40 C264 74, 260 130, 236 170
               C212 210, 158 232, 102 224 C48 216, 6 178, -10 126
               C-26 72, 16 32, 46 20 C58 14, 68 18, 80 14 Z"
            fill="#C2806C" fillOpacity="0.46"
          />
        </svg>
      </div>

      {/* ── RIGHT SIDE ─────────────────────────────────────────────────── */}

      {/* Right — cream blob, top-right, floating — ELONGATED crescent with a concave bottom, FADES at top */}
      <div className="absolute" style={{
        top: '48px', right: '100px', width: '148px', height: '72px',
        WebkitMaskImage: topFadeMask,
        maskImage: topFadeMask,
      }}>
        <svg viewBox="0 0 148 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M20 50 C2 34, 6 10, 38 4 C62 -2, 96 8, 118 4
               C136 0, 150 14, 144 30 C138 46, 116 58, 90 62
               C62 66, 26 58, 20 50 Z"
            fill="#DDD7D0" fillOpacity="0.70"
          />
        </svg>
      </div>

      {/* Right — large sage blob, right edge, upper-mid — AMOEBA with a bulging lobe at bottom-right, FADES at top */}
      <div className="absolute" style={{
        top: '110px', right: '-80px', width: '340px', height: '300px',
        WebkitMaskImage: topFadeMask,
        maskImage: topFadeMask,
      }}>
        <svg viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M180 14 C228 -10, 298 18, 324 80 C342 126, 328 178, 296 214
               C274 238, 240 252, 212 268 C186 282, 152 294, 118 278
               C82 262, 54 228, 38 188 C20 144, 24 90, 58 54
               C88 22, 138 -2, 180 14 Z"
            fill="#9AAF91" fillOpacity="0.42"
          />
        </svg>
      </div>

      {/* Right — muted rose blob, right lower-mid — SQUASHED irregular oval with a lumpy top-right bump */}
      <div className="absolute" style={{ bottom: '140px', right: '4px', width: '180px', height: '128px' }}>
        <svg viewBox="0 0 180 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M148 18 C168 2, 184 30, 178 58 C174 78, 158 90, 148 108
               C136 126, 108 136, 80 128 C50 120, 16 100, 6 72
               C-4 46, 14 18, 44 8 C68 0, 100 16, 126 14
               C136 12, 142 22, 148 18 Z"
            fill="#C9A898" fillOpacity="0.42"
          />
        </svg>
      </div>

      {/* Right — sage green blob, bottom-right — WIDE comma/comma-tail shape, partially off screen */}
      <div className="absolute" style={{ bottom: '-30px', right: '-50px', width: '300px', height: '260px' }}>
        <svg viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M260 30 C290 58, 302 108, 284 156 C268 198, 230 228, 186 244
               C148 258, 102 256, 66 234 C28 212, 4 168, -2 120
               C-8 72, 18 26, 62 12 C94 2, 124 20, 148 10
               C172 0, 190 -8, 218 6 C238 16, 252 18, 260 30 Z"
            fill="#87A08D" fillOpacity="0.42"
          />
        </svg>
      </div>

      {/* ── SCATTERED TERRACOTTA DOTS ──────────────────────────────────── */}
      <div className="absolute" style={{ top: '30%',  left: '18%',  width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#C07B5A', opacity: 0.50 }} />
      <div className="absolute" style={{ top: '42%',  right: '32%', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#C07B5A', opacity: 0.40 }} />
      <div className="absolute" style={{ top: '55%',  left: '12%',  width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#C07B5A', opacity: 0.38 }} />
      <div className="absolute" style={{ bottom: '28%', right: '22%', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#C07B5A', opacity: 0.48 }} />
      <div className="absolute" style={{ bottom: '16%', left: '26%',  width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#C07B5A', opacity: 0.35 }} />
      <div className="absolute" style={{ top: '22%',  right: '18%', width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#C07B5A', opacity: 0.38 }} />
    </div>
  );
}

// ─── Preview post card ────────────────────────────────────────────────────
function PreviewPostCard({ post }: { post: Post }) {
  return (
    <div
      className="rounded-2xl flex flex-col gap-4 p-5"
      style={{ backgroundColor: '#e1dfdfff', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col leading-tight">
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {post.alias.name}
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>
        <button
          className="p-1 rounded-md opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
          aria-label="More options"
        >
          <MoreHorizontal size={16} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>

      {/* Post content */}
      <p
        className="text-[15px] leading-snug"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-ui)' }}
      >
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span
          className="text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {post.commentCount} comments
        </span>
        <button
          className="opacity-30 hover:opacity-60 transition-opacity cursor-pointer"
          aria-label="Save post"
        >
          <Bookmark size={15} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: '#e4dfcaff',
        fontFamily: 'var(--font-ui)',
        height: '100vh',
        maxHeight: '100vh',
      }}
    >
      {/* Decorative blobs — positioned behind all content */}
      <BlobShapes />

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-10 py-5">
        {/* Wordmark */}
        <Link
          to="/"
          className="text-sm font-semibold tracking-[0.18em] uppercase"
          style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.18em', fontSize:'1rem' }}
        >
          ANONIMY
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          <a
            href="#about"
            className="text-sm transition-colors duration-150"
            style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            About
          </a>
        
          <Link
            to="/login"
            className="text-sm transition-colors duration-150"
            style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium px-5 py-2 rounded-full transition-colors duration-150"
            style={{
              backgroundColor: 'var(--color-text-primary)',
              color: '#FFFFFF',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2D2D2D')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-text-primary)')}
          >
            Sign up
          </Link>
        </nav>
      </header>

      {/* ── Hero section ────────────────────────────────────────────────── */}
      <main className="relative z-10 px-10 pt-6 pb-10 max-w-3xl m-auto">
        {/* Headline */}
        <h1
          className="leading-[1.1] mb-6"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(48px, 6vw, 68px)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          You don't have{' '}
          <br />
          to be{' '}
          <span
            style={{
              color: 'var(--color-accent)',
              textDecoration: 'underline',
              textDecorationThickness: '2px',
              textUnderlineOffset: '5px',
              fontStyle: 'italic',
            }}
          >
            someone
          </span>{' '}
          here.
        </h1>

        {/* Subtext */}
        <p
          className="mb-10 leading-relaxed"
          style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-ui)',
            maxWidth: '380px',
          }}
        >
          Share your thoughts, confessions, questions
          <br />
          and everything in between. Anonymously.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-6">
          <Link
            to="/signup"
            className="text-sm font-medium px-7 py-3 rounded-full transition-colors duration-150"
            style={{
              backgroundColor: 'var(--color-text-primary)',
              color: '#FFFFFF',
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2D2D2D')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-text-primary)')}
          >
            Get started
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-1.5 text-sm transition-colors duration-150"
            style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          >
            See how it works
            <span aria-hidden="true" style={{ fontSize: '14px' }}>↓</span>
          </a>
        </div>
      </main>

      {/* ── Preview post cards ───────────────────────────────────────────── */}
      <section
        className="relative z-10 px-10 pb-16 pt-8"
        aria-label="Sample posts"
      >
        <div className="grid grid-cols-2 gap-5 max-w-2xl mx-auto">
          {landingPreviewPosts.map(post => (
            <PreviewPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
