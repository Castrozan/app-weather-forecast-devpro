When you let users type a city name like “Springfield”, “San Jose”, “Porto Alegre”, “London”, “Santiago”, there’s a real ambiguity problem.

### The “Springfield problem”

Many cities share the same name.

If your app calls the weather API like:

- `q=Springfield`

the provider may:

- return the “wrong” Springfield (there are many in the US alone)
- return different results depending on popularity, language, or user region
- fail when the name is not unique or is spelled differently

That creates a bad UX and looks sloppy in an assessment.

### What “geocoding step” means

Instead of going straight from “city name string” to “weather”, you do:

1. **Geocode** the user input (turn name -> exact location)

- Input: `"Springfield"`
- Output: a list of matches with:
  - `name`
  - `state` or `admin region`
  - `country`
  - `lat`, `lon`

2. Let the user pick the correct city OR pick the best match safely

- Show: “Springfield, IL, US” vs “Springfield, MA, US” etc.

3. Fetch weather using **lat/lon**
   Weather APIs are most accurate and unambiguous with coordinates.

### Why this is strategic for your take home

It signals:

- you think about edge cases
- you design predictable data flow
- you care about correctness, not just “it works on my machine”
- you understand real world product behavior

### How this looks with OpenWeather (typical approach)

OpenWeather offers a Geocoding API (direct geocoding):

- query city name -> returns candidates with lat/lon

Then you call:

- Current weather by lat/lon
- Forecast by lat/lon

### Minimal UX that still looks senior

You do not need a complex autocomplete.

Simplest solid solution:

- User searches
- If geocode returns multiple results:
  - show a small list: `City, State/Region, Country`
  - user clicks one

- then show current + 5 day

If only one result:

- auto select it

### What they might ask in interview

“Why did you add geocoding?”

Answer:
“City names are ambiguous and lead to incorrect forecasts. Using geocoding to resolve to coordinates makes the result deterministic and improves UX. It also separates concerns cleanly: search is identification, forecast is weather retrieval.”

If you paste the PDF page that talks about the API usage (or tell me which OpenWeather endpoints they expect), I’ll suggest the cleanest endpoint combo and the exact data transformation for the 5 day cards.
