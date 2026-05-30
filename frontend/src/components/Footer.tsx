export default function Footer() {
  return (
    <footer className="bg-raised text-muted py-12 border-t border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-gold text-lg mb-4 tracking-wide">PowerLog</h3>
            <p className="text-sm text-muted">Your ultimate powerlifting companion. Track, analyze, and improve your lifts.</p>
          </div>
          <div>
            <h4 className="text-champagne font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>1RM Calculator</li>
              <li>Lift Tracking</li>
              <li>Exercise Library</li>
              <li>Warmup &amp; Cooldown</li>
            </ul>
          </div>
          <div>
            <h4 className="text-champagne font-semibold mb-3">Pricing</h4>
            <ul className="space-y-2 text-sm">
              <li>Free Plan</li>
              <li>Pro Plan</li>
            </ul>
          </div>
          <div>
            <h4 className="text-champagne font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>support@powerlog.app</li>
              <li>Instagram</li>
              <li>YouTube</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-hairline mt-8 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} PowerLog. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
