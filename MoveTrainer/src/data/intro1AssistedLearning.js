/**
 * Intro-1 (“Leave the Queen at Home”) assisted-learning after “Start learning”.
 * URLs: `{intro-1 base path}/aq-1`, … `/aq-1-correct`, `/aq-1-incorrect`
 *
 * `segments` — same shape as informational dream opening (clickable move chips).
 * `progressStep` / `progressTotal` — shown in line header as `progressStep/progressTotal`.
 */

/** Shared coach body for the first-lesson quiz screens (aq-1 variants). */
export const INTRO_1_ASSISTED_AQ1_SEGMENTS = [
  {
    type: 'text',
    text: `Now that we understand the goals of the opening, my ten rules, and we've seen what a dream opening looks like, let's see an example of what can happen if one side breaks the rules.

`,
  },
  { type: 'text', text: '1. ' },
  { type: 'move', ply: 1, san: 'e4' },
  {
    type: 'text',
    text: `

Once again, a very strong first move - controlling the center and facilitating development.

1... `,
  },
  { type: 'move', ply: 2, san: 'd5' },
  {
    type: 'text',
    text: `

The Scandinavian Defense. This opening doesn't have the best reputation because it usually results in Black's queen coming out too early. This can sometimes quickly lead to disaster, as we will see here.`,
  },
]

export const INTRO_1_ASSISTED_STEPS = [
  {
    id: 'aq-1',
    segments: INTRO_1_ASSISTED_AQ1_SEGMENTS,
    progressStep: 1,
    progressTotal: 3,
  },
  {
    id: 'aq-1-correct',
    segments: INTRO_1_ASSISTED_AQ1_SEGMENTS,
    progressStep: 1,
    progressTotal: 3,
  },
  {
    id: 'aq-1-incorrect',
    segments: INTRO_1_ASSISTED_AQ1_SEGMENTS,
    progressStep: 1,
    progressTotal: 3,
  },
  {
    id: 'aq-2',
    coachMessage:
      'Replay the captures and queen moves until the pattern feels natural. When you are ready, continue to wrap up this mini-lesson.',
    progressStep: 2,
    progressTotal: 3,
  },
  {
    id: 'aq-3',
    coachMessage:
      'Nice work. Move on to the next opening line whenever you are ready — or step back to review the full intro again.',
    progressStep: 3,
    progressTotal: 3,
  },
]
