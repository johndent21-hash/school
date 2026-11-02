// Small labels that link a skill or topic to the textbook: "NCM 7 Ex 1.04", "Extension", "Extra practice".
import type { Skill, Topic } from '@/lib/maths/types'

export function SkillTags({ skill }: { skill: Skill }) {
  return (
    <>
      {skill.ref && (
        <span className="chip chip-book" title="Matching textbook exercise (New Century Maths 7)">
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
    <span className="chip chip-book" title="Matching textbook chapter (New Century Maths 7)">
      {topic.ref}
    </span>
  ) : null
}

/** "Ex 1.04 · Adding integers" for compact lists. */
export const shortRefTitle = (s: Skill) => (s.ref?.startsWith('NCM 7 Ex ') ? `${s.ref.slice(6)} · ${s.title}` : s.title)
