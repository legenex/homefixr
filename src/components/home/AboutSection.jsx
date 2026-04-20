export default function AboutSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-soft">
                <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-soft">
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" className="w-full h-full object-cover" alt="" />
              </div>
            </div>
            <div className="space-y-4 pt-10">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-soft">
                <img src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-soft">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80" className="w-full h-full object-cover" alt="" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">About HomeFixr</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance mb-6">
              We built this because hiring the right pro shouldn't be hard.
            </h2>
            <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
              <p>
                HomeFixr.com helps connect homeowners with the best local service providers based on their own requirements and budget. Not the biggest lead-seller. Not a faceless directory.
              </p>
              <p>
                We built HomeFixr because we were tired of filling out the same form 10 times, getting called by pros out of our price range, and never knowing who was actually vetted. So we fixed it.
              </p>
              <p>
                Today, thousands of homeowners use HomeFixr every month to find pros they can trust — for projects big and small, from a leaky faucet to a full home addition.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-border">
              <div>
                <p className="font-display text-3xl font-semibold text-secondary">10k+</p>
                <p className="text-sm text-muted-foreground mt-1">Homeowners helped</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-secondary">4.9</p>
                <p className="text-sm text-muted-foreground mt-1">Average rating</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-secondary">50 US</p>
                <p className="text-sm text-muted-foreground mt-1">States served</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}