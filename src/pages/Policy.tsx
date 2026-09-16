import { Fragment, type ReactNode } from "react";
import { POLICIES } from "../policies";

const EMAIL = "organicsabhimanyu@gmail.com";

// Turns the store's email address inside policy text into a mail link.
function withEmailLinks(text: string): ReactNode {
  const parts = text.split(EMAIL);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && <a href={`mailto:${EMAIL}`}>{EMAIL}</a>}
    </Fragment>
  ));
}

export default function Policy({ slug }: { slug: keyof typeof POLICIES }) {
  const policy = POLICIES[slug];

  return (
    <>
      <section className="page-hero compact">
        <span className="eyebrow marked">Store policies</span>
        <h1>{policy.title}</h1>
      </section>
      <article className="section shell policy">
        {policy.blocks.map((block, i) => {
          if (block.h) return <h2 key={i}>{block.h}</h2>;
          if (block.ul)
            return (
              <ul key={i}>
                {block.ul.map((item) => (
                  <li key={item}>{withEmailLinks(item)}</li>
                ))}
              </ul>
            );
          return <p key={i}>{withEmailLinks(block.p ?? "")}</p>;
        })}
      </article>
    </>
  );
}
