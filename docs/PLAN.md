fullstack means they still want backend shaped thinking: API integration, clean data layer, maybe a small Node proxy, clear run steps, production quality.

What the intention is

They tell you exactly what they will evaluate:
architecture and scaffolding
clean maintainable components
solid best practices
clear data flow and state management
strong CSS layout skill 

And the app requirements are explicit:
search city
show current weather
show next 5 days
match the provided reference styling as closely as possible 

So your main focus should be:

1. UI match and CSS layout (highest signal)
2. Component design and state management clarity
3. API integration correctness and edge cases
4. Production quality README + decisions 


You are my senior tech lead and interviewer coach. Help me plan and execute a take home assessment for an Intermediate/Senior React + Node role where frontend is 70% of the job and backend 30%.

CONTEXT ABOUT ME
- I work on a mission critical government platform used in 100+ cities, maintaining 99.7% availability and building low latency and high throughput systems (notifications, OAuth auth, permissions, auditing, data sync, pipelines).
- I need to maximize interview conversion by delivering a production quality, clean, well explained solution.

ASSESSMENT REQUIREMENTS (must follow)
- Build a weather forecast application for any searchable city.
- User can search for any city and get the weather forecast.
- In the search result, user sees the current weather status.
- User sees weather for the next 5 days.
- Using CSS, style the front end to match the provided reference image as closely as possible.
- Recommended stack: React, TypeScript, Node.js in ES6, CSS.
- Provide clear instructions to run and test, plus a high level explanation of architectural decisions.
- Use Inter font. Include the provided disclaimer text in the UI.
- Use OpenWeather as the API and optionally weather icons.

GOAL
I want a strategic plan that maximizes the signals evaluators care about: architecture, component design, best practices, data flow, state management, and CSS layout. I also want to preempt the questions they will ask in the technical interview.

DELIVERABLES I WANT FROM YOU
1) A prioritized focus list for what matters most for scoring and why, aligned to the role being frontend heavy.
2) A recommended architecture with a component tree and folder structure.
   - Include explicit decisions: Next.js vs plain React, state management approach, API client layer.
   - Optional: recommend whether to include a minimal Node/Express proxy to keep the OpenWeather API key server side.
3) A data flow plan:
   - How search works
   - How you resolve city names properly (suggest a geocoding step)
   - How you transform forecast into 5 daily cards
   - Loading, error, empty states
4) UI and CSS plan based on the reference image:
   - layout: left search panel, main weather panel, 5 day cards
   - typography, spacing, responsive behavior
   - accessibility basics (keyboard navigation, labels)
5) A README outline that makes me look senior:
   - run steps, env vars, tests
   - architectural decisions and tradeoffs
   - what I would improve with more time
6) A test plan:
   - minimal unit tests for transformation logic
   - basic component test for rendering states
7) A short list of interview questions they are likely to ask about my solution and the best answers.
   - examples: why this architecture, how you handled edge cases, how you grouped 5 days, how you managed state, why CSS decisions, how you would scale this, how you would deploy to AWS/EKS.

CONSTRAINTS
- Keep it production quality but not over engineered.
- Prioritize clear code, predictable state, correct data handling, and pixel close UI.
- Always justify tradeoffs like a senior engineer.
- Assume I have 48 hours.

OUTPUT FORMAT
Provide the plan in sections, with checklists and concrete recommendations. Include a proposed folder structure and a component list. Include a short script I can use to describe my solution in the interview in 60 seconds.

