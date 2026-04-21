/**
 * Student learning profile alias. Mirrors Dilly's main site URL convention
 * (hellodilly.com/s/{slug}) so the cross-link can carry the same prefix on
 * both sides.
 *
 * This re-exports the canonical /u/{slug} page - the profile body, empty
 * state, and owner detection are identical regardless of prefix. The /u
 * route stays live as a compatibility alias for any old share links.
 */
export { default, metadata } from "../../u/[slug]/page";
