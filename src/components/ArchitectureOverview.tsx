"use client";

export function ArchitectureOverview({ content }: { content: string }) {
  // Simple markdown-to-html for paragraphs, bold, code
  const paragraphs = content.split("\n\n").filter(Boolean);

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, i) => {
        const html = paragraph
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.*?)`/g, '<code class="path-pill">$1</code>')
          .replace(/\n/g, "<br />");

        return (
          <p
            key={i}
            className="text-foreground/85 leading-7"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}
