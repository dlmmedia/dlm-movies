import { Screenplay, ScreenplayElement, ScreenplayElementType } from '@/types/screenplay';

/**
 * Generate DOCX-compatible content
 * This creates the basic structure - full DOCX generation would need the `docx` library
 */
export function toDocxContent(screenplay: Screenplay): {
  title: string;
  author: string;
  sections: Array<{ type: string; content: string; style?: string }>;
} {
  const sections: Array<{ type: string; content: string; style?: string }> = [];
  
  // Title page content
  sections.push({ type: 'title', content: screenplay.title, style: 'Title' });
  sections.push({ type: 'text', content: '', style: 'Normal' });
  sections.push({ type: 'text', content: 'Written by', style: 'Centered' });
  sections.push({ type: 'text', content: screenplay.author || 'Anonymous', style: 'Centered' });
  
  if (screenplay.draftNumber) {
    sections.push({ type: 'text', content: '', style: 'Normal' });
    sections.push({ type: 'text', content: screenplay.draftNumber, style: 'Centered' });
  }
  
  // Page break
  sections.push({ type: 'pageBreak', content: '', style: 'Normal' });
  
  // Screenplay content
  for (const element of screenplay.elements) {
    sections.push({
      type: elementTypeToDocxStyle(element.type),
      content: formatContent(element),
      style: elementTypeToDocxStyle(element.type),
    });
  }
  
  return {
    title: screenplay.title,
    author: screenplay.author || 'Anonymous',
    sections,
  };
}

function elementTypeToDocxStyle(type: ScreenplayElementType): string {
  const styles: Record<ScreenplayElementType, string> = {
    scene_heading: 'SceneHeading',
    action: 'Action',
    character: 'Character',
    dialogue: 'Dialogue',
    parenthetical: 'Parenthetical',
    transition: 'Transition',
    shot: 'Shot',
    text: 'Normal',
  };
  return styles[type] || 'Normal';
}

function formatContent(element: ScreenplayElement): string {
  switch (element.type) {
    case 'scene_heading':
    case 'character':
    case 'transition':
    case 'shot':
      return element.content.toUpperCase();
    case 'parenthetical':
      const content = element.content;
      return content.startsWith('(') ? content : `(${content})`;
    default:
      return element.content;
  }
}

/**
 * Create a simple RTF document (which Word can open)
 * This is a fallback if we can't generate proper DOCX
 */
export function toRTF(screenplay: Screenplay): string {
  const lines: string[] = [];
  
  // RTF header
  lines.push('{\\rtf1\\ansi\\deff0');
  lines.push('{\\fonttbl{\\f0\\fmodern Courier New;}}');
  lines.push('\\paperw12240\\paperh15840'); // Letter size in twips
  lines.push('\\margl2160\\margr1440\\margt1440\\margb1440'); // Margins in twips
  
  // Title page
  lines.push('\\par\\par\\par\\par\\par\\par\\par\\par');
  lines.push(`\\pard\\qc\\b\\fs28 ${escapeRTF(screenplay.title.toUpperCase())}\\b0\\par`);
  lines.push('\\par\\par');
  lines.push('\\pard\\qc\\fs24 Written by\\par');
  lines.push('\\par');
  lines.push(`\\pard\\qc\\fs24 ${escapeRTF(screenplay.author || 'Anonymous')}\\par`);
  
  if (screenplay.draftNumber) {
    lines.push('\\par\\par');
    lines.push(`\\pard\\qc\\fs24 ${escapeRTF(screenplay.draftNumber)}\\par`);
  }
  
  // Page break
  lines.push('\\page');
  
  // Content
  for (const element of screenplay.elements) {
    lines.push(formatElementRTF(element));
  }
  
  // Close document
  lines.push('}');
  
  return lines.join('\n');
}

function formatElementRTF(element: ScreenplayElement): string {
  const content = escapeRTF(element.content);
  
  switch (element.type) {
    case 'scene_heading':
      return `\\par\\pard\\li0\\b\\caps ${content}\\caps0\\b0\\par`;
    
    case 'action':
      return `\\par\\pard\\li0 ${content}\\par`;
    
    case 'character':
      return `\\par\\pard\\li3600\\caps ${content}\\caps0\\par`;
    
    case 'dialogue':
      return `\\pard\\li1800\\ri2880 ${content}\\par`;
    
    case 'parenthetical':
      const paren = content.startsWith('(') ? content : `(${content})`;
      return `\\pard\\li2520\\ri3600 ${paren}\\par`;
    
    case 'transition':
      return `\\par\\pard\\qr\\caps ${content}\\caps0\\par`;
    
    default:
      return `\\par\\pard\\li0 ${content}\\par`;
  }
}

function escapeRTF(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\line ');
}

