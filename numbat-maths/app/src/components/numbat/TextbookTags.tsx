// Small labels that link a skill or topic to the textbook: "NCM 7 Ex 1.04", "NCM 9 Ex 11.01", "Extension", "Extra practice".
import type { Skill, Topic } from '@/lib/maths/types'

const EX = /^NCM (\d+) Ex /
/** "New Century Maths 9" from a label such as "NCM 9 Ex 11.01" or "NCM 9 Chapter 11" */
const bookOf = (ref: string) => `New Century Maths ${ref.match(/^NCM (\d+)/)?.[1] ?? ''}`.trim()

export function SkillTags({ skill }: { skill: Skill }) {
  return (
    <>
      {skill.ref && (
        <span className="chip chip-book" title={`Matching textbook exercise (${bookOf(skill.ref)})`}>
          {skill.ref}
        </span>
      )}
      {skill.tag === 'extension' && (
        <span className="chip chip-ext" title="Harder work beyond the exercises">
          Extension
        </span>
      )}
      {skill.tag === 'extra' && (
        <span className="chip" title="Extra practice that isn’t one of the textbook’s exercises">
          Extra practice (not in the textbook)
        </span>
      )}
    </>
  )
}

export function TopicRef({ topic }: { topic: Topic }) {
  return topic.ref ? (
    <span className="chip chip-book" title={`Matching textbook chapter (${bookOf(topic.ref)})`}>
      {topic.ref}
    </span>
  ) : null
}

/** "Ex 1.04 · Adding integers" for compact lists. */
export const shortRefTitle = (s: Skill) => (s.ref && EX.test(s.ref) ? `${s.ref.replace(/^NCM \d+ /, '')} · ${s.title}` : s.title)

/** The exercise number, "1.04" or "11.01", or null if the skill isn't a textbook exercise. */
export const exerciseNumber = (s: Skill) => (s.ref && EX.test(s.ref) ? s.ref.replace(EX, '') : null)
