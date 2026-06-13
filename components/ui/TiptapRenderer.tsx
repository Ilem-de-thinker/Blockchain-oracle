import React from 'react';

interface TiptapRendererProps {
  content: string;
}

export default function TiptapRenderer({ content }: TiptapRendererProps) {
  return (
    <div className="w-full max-w-4xl mx-auto py-10 md:py-12 px-4 md:px-10">
      <article className="prose prose-base md:prose-lg max-w-none font-medium leading-relaxed text-text
        prose-headings:text-text prose-headings:font-bold prose-headings:tracking-tight
        prose-p:text-text prose-p:leading-relaxed
        prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
        prose-strong:text-text prose-strong:font-bold
        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
        prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:text-text-secondary
        prose-li:marker:text-primary prose-li:text-text prose-li:leading-relaxed
        prose-ul:text-text prose-ol:text-text
        prose-p:text-base prose-li:text-base
        dark:prose-invert
      ">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>

      <div className="mt-12 pt-8 border-t border-border flex justify-center">
         <p className="text-sm font-bold text-text-muted uppercase tracking-widest">End of lesson</p>
      </div>
    </div>
  );
}
