# Connected Travel Companion Design

**Date:** 2026-08-09

**Status:** Approved design

**Product:** Golan Wiki

## Summary

Add a premium trip-planning experience that turns the existing multilingual place directory into a connected travel companion. A visitor answers five short groups of questions and receives an editable one-to-three-day itinerary built only from verified place records. Deterministic rules select and schedule places; optional AI generates localized explanatory copy but never supplies factual place, schedule, price, route, or booking data.

The planner works for guests without authentication. Guest plans persist in the browser, can be shared through a public link, and can be imported into an account after sign-in for permanent cross-device access.

## Goals

- Give visitors a clear reason to use Golan Wiki as a travel tool rather than only a directory.
- Generate realistic one-to-three-day itineraries in roughly one minute of visitor input.
- Integrate planning with existing place pages, place cards, favorites, maps, booking links, opening hours, and Waze actions.
- Keep recommendations trustworthy, editable, and useful when AI or another external service is unavailable.
- Provide equivalent, directionally correct experiences in English, Arabic, and Hebrew.
- Create focused system boundaries so routing, weather, and AI providers can be changed independently.

## Non-goals for the first release

- Trips longer than three days
- Live traffic optimization
- Automatic booking, reservations, or payments
- Collaborative multi-user editing
- Free-form AI concierge chat
- AI-generated factual information about places
- Fully offline navigation

## Existing foundation

The project already provides multilingual discovery, categories, search and filters, public place pages, galleries, opening status, prices, durations, coordinates, maps, favorites, ratings and reviews, owner replies, booking links, Waze navigation, sharing, profiles, business ownership, and admin-managed listings. The planner will reuse those models, components, permissions, DTO boundaries, and localization conventions rather than create parallel place or locale systems.

## Visitor experience

### Entry points

- Add a primary **Plan My Trip** entry to appropriate public navigation and discovery surfaces.
- Add **Add to trip** to place cards and place-detail pages.
- Allow a visitor to start a plan from selected favorites without merging the concepts of favorites and itineraries.

### Questionnaire

The questionnaire should take about sixty seconds and contain five steps:

1. Travel dates and trip length of one, two, or three days
2. Starting area and the available start and end time for each day
3. Interests such as nature, food, activities, history, shopping, and stays
4. Travel party and style, such as family, couple, solo, relaxed, or adventurous
5. Budget, pace, accessibility needs, and other practical preferences

Visitors may continue without an account. Each step validates locally, keeps previous answers, supports keyboard navigation, and uses the existing locale and direction utilities.

### Generated itinerary

The result contains:

- One to three days
- A target of three to five realistic stops per day, adjusted for pace and visit duration
- Ordered daily timelines with visit and travel estimates
- Opening-hours validation and visible warnings
- A daily route map
- Booking and Waze actions backed by existing place data
- Weather-aware warnings and replacement suggestions when weather data is available
- A short optional AI-written introduction and explanation of why the plan fits
- Controls to replace, reorder, remove, or add a stop
- Undo for the most recent itinerary edit
- Save and share actions

Desktop uses a split workspace with the timeline beside a sticky route map. Mobile leads with the timeline, uses a compact route preview, and keeps the main travel or editing action readily reachable. Reordering or replacing a stop recalculates travel estimates, schedules, and warnings immediately.

### Guest, account, and sharing behavior

- A guest plan is stored locally in the browser under a versioned schema.
- A guest can generate, edit, navigate, and request a public share link without signing in.
- After sign-in, the visitor is offered an explicit import of the current guest plan. Import creates an account-owned itinerary and does not silently overwrite another saved plan.
- Account plans persist in MongoDB and are available across devices.
- A public share link uses a cryptographically random, revocable token and exposes a read-only itinerary containing public place data only.
- Editing, deleting, or revoking an account itinerary requires server-side authentication and ownership verification.

## Place planning metadata

The current place data supplies category, price, duration, coordinates, opening hours, ratings, and contact links. Automatic planning also needs optional structured metadata:

- Experience tags, including scenic, cultural, food, adventure, romantic, and family-friendly
- Environment: indoor, outdoor, or mixed
- Recommended audiences
- Pace or physical-intensity level
- Typical visit duration in minutes
- Best seasons
- Weather sensitivity
- Reservation requirement
- Accessibility notes and capabilities
- Suitable times of day

These fields should live in a bounded optional planning metadata object on the existing place model. Administrators manage them through the existing place form. A missing value must not break the public listing; it lowers confidence or eligibility only for planner constraints that depend on that value. Fields that affect filtering or scheduling must be validated at runtime and represented in all relevant TypeScript types and safe DTOs.

## Itinerary data model

Introduce an itinerary document with these conceptual fields:

- Optional authenticated owner ID
- Locale
- Travel dates and one-to-three-day duration
- Starting area or coordinates
- Normalized visitor preferences
- Ordered days containing ordered stops
- Each stop references a real place ID and stores planned arrival, departure, and visitor overrides
- Calculated travel estimates and warning codes
- Generation algorithm version
- Optional AI narrative stored separately from structured schedule data
- A SHA-256 hash of the random share token, with revocation state; only the visitor-facing URL contains the plaintext token
- Created and updated timestamps

Place titles, descriptions, hours, prices, images, or contact details should not be copied into the itinerary as authoritative snapshots. Read views resolve current public place data through safe DTOs. If a place becomes hidden or unavailable, the stop remains identifiable as unavailable and offers replacement rather than leaking the hidden record.

## Architecture and responsibilities

Keep the feature divided into independently understandable units:

1. **Questionnaire:** collects and validates normalized preferences.
2. **Candidate selector:** queries visible places and excludes hard conflicts.
3. **Scoring engine:** ranks candidates by interests, audience, pace, budget, quality, and diversity.
4. **Daily scheduler:** assigns stops to days and times while respecting duration and opening hours.
5. **Route estimator:** clusters nearby places and supplies travel estimates through a provider interface. The first release defaults to local Haversine distance adjusted by documented road-distance and average-speed factors; a future road-routing provider can replace it without changing planner consumers.
6. **Constraint checker:** returns structured warning codes for hours, weather, excessive travel, and unavailable places.
7. **Itinerary editor:** applies reorder, replace, remove, and add operations, then recalculates affected days.
8. **Persistence and sharing:** owns guest serialization, authenticated storage, import, and read-only share tokens.
9. **Map presentation:** renders daily routes using the existing Leaflet patterns.
10. **AI narrator:** receives only the completed structured itinerary and creates localized descriptive copy.

The rules engine is authoritative. The AI narrator must not add stops, change times, invent attributes, or return links. If AI output is missing or invalid, the structured itinerary is still the complete product result.

## Generation flow

1. Validate the questionnaire and normalize locale-independent values.
2. Query only visible public places with fields required by selection and scheduling.
3. Apply hard constraints such as date, opening availability, accessibility requirements, and usable coordinates.
4. Score remaining candidates by stated interests, travel style, budget, rating confidence, distance, and variety.
5. Cluster candidates geographically and allocate them across days.
6. Schedule each day chronologically, including visit and travel buffers.
7. Run constraint checks and repair avoidable conflicts.
8. If the result is too sparse, relax soft preferences in a documented order and report the relaxation to the visitor.
9. Persist or serialize the structured result.
10. Optionally request a localized AI narrative from the finalized result.

The algorithm must be deterministic for identical input, dataset, and generation version except for explicitly randomized tie-breaking with a stored seed.

## Failure and fallback behavior

- **Insufficient matches:** relax soft preferences transparently; never invent a place.
- **Route provider unavailable:** use the first-release local approximate estimator and keep editing functional.
- **Weather unavailable:** omit weather advice without blocking generation.
- **AI unavailable or invalid:** omit the narrative and show the complete structured itinerary.
- **Place hidden or deleted:** mark the stop unavailable and offer eligible replacements.
- **Hours conflict after an edit:** retain the user edit, show a warning, and offer a valid time or substitute.
- **Guest storage unavailable or full:** keep the active plan in memory and explain that it will not survive closing the tab.
- **Share link revoked or invalid:** return a localized not-found or unavailable state without revealing whether a private itinerary exists.

The first-release map displays ordered stop markers and connector lines rather than claiming road-accurate turn-by-turn routing. Waze remains the authoritative navigation action for each stop. Any later road-routing integration must retain the same fallback behavior.

User-facing failures should follow the existing localized error conventions. External-service errors and sensitive tokens must not be exposed to the client or logs.

## Security and privacy

- Enforce plan ownership server-side for every authenticated mutation.
- Do not trust client-provided owner IDs, place facts, computed permissions, or generation results.
- Validate IDs and mutation bodies with Zod or established explicit validation.
- Keep account identity and internal ownership fields out of public shared DTOs.
- Use cryptographically random, revocable share tokens; do not use predictable itinerary IDs as access credentials.
- Apply distributed rate limiting to generation, share creation, and AI narration endpoints as appropriate for their cost and abuse potential.
- Inspect and follow the repository's CSRF approach before adding cookie-authenticated mutation endpoints.
- Store only planning preferences needed for the feature and avoid collecting unnecessary sensitive visitor data.

## Localization and accessibility

- Add every visitor-facing key to the English, Arabic, and Hebrew dictionaries with identical shapes.
- Use the existing locale, dictionary, localized-slug, and direction utilities.
- Preserve English routes without an `/en` prefix.
- Use logical spacing and alignment utilities for direction-sensitive content.
- Keep route-map geometry, gallery ordering, and itinerary chronology semantically ordered instead of blindly reversing collections in RTL.
- Provide keyboard-accessible questionnaire controls and itinerary editing alternatives to drag-and-drop.
- Announce schedule changes and validation errors accessibly.
- Respect reduced motion and maintain usable focus order on both workspace layouts.

## Analytics

Use the existing PostHog integration to measure the funnel without sending sensitive free-form answers:

- Planner opened
- Questionnaire step completed or abandoned
- Itinerary generated or generation failed by structured reason
- Stop replaced, added, removed, or reordered
- Plan shared
- Guest prompted to sign in
- Guest plan imported
- Booking or navigation action opened from an itinerary

Success should be evaluated through completion rate, itinerary edit rate, share rate, save/import conversion, and booking or navigation engagement—not generation count alone.

## Verification strategy

The repository currently has no verified automated test command. Implementation should establish a focused test setup and document its command before claiming automated tests pass.

Coverage should include:

- Unit tests for scoring, deterministic tie-breaking, scheduling, opening-hours logic, relaxation order, localization-independent inputs, and route fallbacks
- Integration tests for authenticated ownership, guest import, share-token revocation, hidden-place behavior, and safe public DTOs
- Browser tests for questionnaire completion, itinerary editing, undo, saving, sharing, and recovery from external-service failures
- English, Arabic, and Hebrew layout checks
- Mobile and desktop responsive behavior
- Keyboard, screen-reader, focus, and reduced-motion paths
- Edge cases including closed places, sparse matches, deleted listings, overnight or unusual hours, and unavailable routing, weather, or AI services

## Delivery boundaries

This design is large enough to require phased implementation, but all phases serve one coherent feature:

1. Planning metadata and deterministic engine
2. Questionnaire and generated itinerary workspace
3. Guest persistence, account saving, and sharing
4. Weather guidance and optional AI narration
5. Analytics, accessibility verification, and production hardening

Each phase should preserve a usable end-to-end slice and avoid exposing unfinished controls.

## Approved decisions

- Product direction: connected travel companion
- Planning mode: hybrid generation with full visitor editing
- Supported duration: one to three days
- Personalization: a short mix of interests, travel style, and practical needs
- Generation: deterministic verified-data rules plus optional AI narration
- Authentication: no account required to generate or edit; sign-in is required only for permanent account saving
- UI: timeline-led mobile workspace and timeline-plus-map desktop workspace
