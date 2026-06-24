import { PRODUCTS } from '@/config/constants';
import type { ChatMessage } from '@/lib/ai/nim-client';
import type { CategoryInfo } from '@/types/blog';

export const PROMPT_VERSION = 'v2';

const TARGET_WORDS = 1100;

const META_SHAPE = `{"title":"40-65 chars, keyword near front","excerpt":"1-2 sentence summary, max ~280 chars","metaDescription":"140-160 chars, includes focus keyword","tags":["3-6 lowercase tags"],"keywords":["3-8 keywords"],"focusKeyword":"the single primary keyword","faq":[{"question":"...","answer":"40-70 word answer"}]}`;

function productForCategory(category: CategoryInfo) {
  return category.targetProduct === 'lucapay' ? PRODUCTS.lucapay : PRODUCTS.lucaplus;
}

export function buildWriterMessages(params: {
  topicTitle: string;
  focusKeyword: string;
  angle: string;
  category: CategoryInfo;
}): ChatMessage[] {
  const product = productForCategory(params.category);

  const system = `You are the senior content editor for the LucaPlus blog. You write for small business owners, accountants, bookkeepers and finance teams. Your voice is clear, practical and friendly-professional; you explain jargon in plain language.

HARD RULES — follow every one:
- Write the body in Markdown using ## and ### headings only. Never include an H1 (the title is rendered separately).
- Do NOT invent statistics, percentages, dollar amounts, dates, study citations or competitor details. If a figure is unavoidable, describe it generally and never fabricate precise numbers.
- This is general educational content. End the body with a short final paragraph: a one-line disclaimer that it is general information only and not financial, tax or legal advice.
- Include EXACTLY ONE call to action that links to ${product.name} using this exact URL: ${product.url} — use a natural anchor text. Do NOT include any other links, URLs or domains anywhere in the article.
- Structure: a short intro paragraph (40-70 words), then 5-7 "##" sections, then a "## Key takeaways" section with a bulleted list, then the CTA sentence, then the disclaimer.
- LENGTH IS MANDATORY: write a thorough, in-depth article of AT LEAST 900 words (target ${TARGET_WORDS}). Every "##" section must contain 2-4 full paragraphs of real explanation and examples. Do NOT write a short, shallow or summary-style article. Provide 3-5 genuinely useful FAQ items.

OUTPUT FORMAT — respond in EXACTLY this structure and nothing else:
---META---
${META_SHAPE}
---BODY---
(the full article in Markdown here)
---END---

CRITICAL: the ---META--- block must be ONE single line of valid JSON with no line breaks inside it. Put the article Markdown ONLY inside the ---BODY--- block. Do not add any text before ---META--- or after ---END---.`;

  const user = `Write a blog post for the "${params.category.name}" category.

Topic: ${params.topicTitle}
Angle: ${params.angle}
Focus keyword: ${params.focusKeyword}
Product to feature in the single CTA: ${product.name} (${product.url})

Write an in-depth article of at least 900 words. Respond using the ---META--- / ---BODY--- / ---END--- format from the system message.`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export function buildEditorMessages(article: {
  title: string;
  bodyMarkdown: string;
  focusKeyword: string;
}): ChatMessage[] {
  const system = `You are a strict editorial reviewer for a fintech blog. Score a draft for publication readiness on a 0-100 scale. Reward: genuine usefulness, clear structure, on-topic depth, presence of the required disclaimer, and natural keyword use. Penalise heavily: invented statistics or fabricated facts, thin or padded content, keyword stuffing, missing disclaimer, off-topic drift, or unsafe financial/tax/legal advice stated as fact.

Respond with ONLY a single-line JSON object (no fences, no commentary, no line breaks inside it):
{"score":0-100,"issues":["short issue strings"],"publishRecommended":true|false}`;

  const user = `Focus keyword: ${article.focusKeyword}
Title: ${article.title}

Article body:
${article.bodyMarkdown}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}
