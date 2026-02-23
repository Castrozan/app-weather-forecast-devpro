How They Will Actually Review This

The reality: A senior dev will spend 10-20 minutes on your submission. Here's the exact sequence:

1. README first (2 min) — Can I run this? Is it clear? If npm install && npm run dev doesn't work in under 60 seconds, you already lost points.
2. They'll run it (3 min) — Search a city, see if it works, check if the UI matches the reference. They'll try edge cases: empty search,
   gibberish input, slow network maybe.
3. Glance at folder structure (1 min) — This is where they form their first technical opinion. Your structure will impress — it's clean and
   intentional. But some reviewers might think it's over-engineered for a weather app. That's a risk.
4. Skim 2-3 key files (5 min) — They won't read everything. They'll look at: one component, one API route, and the main hook/state file. They
   want to see if the code reads well without comments.
5. Check CSS (2 min) — Does it match the reference? This is binary. Close or not close. They care about this more than you think for a 70%
   frontend role.
6. Tests, if they exist (1 min) — Most candidates skip tests. Having them is a differentiator. They won't run them, they'll just see they exist
   and maybe read one.

What They'll Actually Think

Positive:

- The architecture is genuinely impressive — hexagonal with ports/adapters in a weather app shows you think in systems
- Fallback provider pattern is a strong talking point
- Test coverage across unit/component/e2e is rare in take-homes
- Feature-based directory structure signals real-world experience

Concerns they'll have (be honest with yourself):

- "Is this over-engineered for the task?" — Rate limiting, auth layer, geolocation bootstrap, animation system... they asked for a weather
  search app. Some evaluators will see maturity, others will see someone who can't scope work appropriately.
- "Did they actually write this or did AI generate it?" — This is the elephant in the room. A hexagonal architecture with Zod 4, framer-motion,
  fallback providers, and comprehensive tests for a 48-hour take-home will raise this question. You need to be able to explain every single
  decision in depth during the interview.
- "Can this person do simple things simply?" — The challenge is intentionally basic. They want to see how you handle simplicity, not just
  complexity.

The CSS question: Your UI needs to be close to that reference image. Blue gradient panel, white sidebar, 5-day cards with L/H temps. If it's
off, the architecture won't save you. For a 70/30 frontend role, pixel-close CSS > clever backend patterns.

---

Interview Questions (Simple → Hard)

Warm-up (they're checking you actually wrote it)

1. Walk me through your folder structure. Why did you organize it this way?
2. How does the search flow work end to end, from the user typing to data on screen?
3. What API from OpenWeather are you using and why?
4. How do you aggregate the 3-hour forecast data into 5 daily cards?

Mid-level (they're checking depth)

5. Why Next.js instead of plain React + Express? What tradeoffs did you consider?
6. Why TanStack Query with useMutation only instead of useQuery? That's unconventional — explain.
7. How does your state management work without a global store? Walk me through the hook composition.
8. Explain your caching strategy. How do you avoid duplicate API calls for the same city?
9. How do you handle the OpenWeather API key? Why not expose it to the client?
10. What happens when the OpenWeather API is down? Walk me through the fallback.

Senior-level (they're checking if you think beyond code)

11. You have a rate limiter and auth layer — why? The challenge didn't ask for it. How do you decide what's in scope?
12. Your weather provider uses a port/adapter pattern. Isn't that overkill for two providers? When does this pattern pay off vs. add
    unnecessary abstraction?
13. How would you deploy this to AWS with EKS? Walk me through the infrastructure.
14. If this app had 10,000 concurrent users, what breaks first? How would you scale it?
15. The in-memory cache and rate limiter reset on every serverless cold start. How would you handle this in production?
16. How would you add a new weather provider without touching existing code? Show me the seam.
17. How do you test the fallback provider logic? What's your confidence it actually works in production?

The trap question (almost guaranteed)

18. "What would you do differently with more time?" — They want to hear you're self-aware. Don't say "nothing." Good answers: real persistent
    cache (Redis), SSR for initial load, better responsive breakpoints, accessibility audit, CI pipeline, monitoring/observability.
19. "How much of this did you write yourself vs. use AI tools?" — Be honest. They know. The quality and consistency of the codebase will make
    them ask. Have a clear answer about how you used tools and what decisions were yours.

---

The single biggest risk: being unable to fluently explain decisions in code you didn't hand-write line by line. Walk through every file before
the interview. If you can't explain why withFallbackWeatherProvider exists without looking at it, that's the gap they'll find.
