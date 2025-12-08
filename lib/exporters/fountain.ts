import { Screenplay, ScreenplayElement, ScreenplayElementType } from '@/types/screenplay';

/**
 * Convert screenplay to Fountain format
 * Fountain is a plain text markup syntax for screenplays
 * https://fountain.io/syntax
 */
export function toFountain(screenplay: Screenplay): string {
  const lines: string[] = [];
  
  // Title page
  lines.push('Title: ' + screenplay.title);
  if (screenplay.author) {
    lines.push('Author: ' + screenplay.author);
  }
  if (screenplay.draftNumber) {
    lines.push('Draft: ' + screenplay.draftNumber);
  }
  if (screenplay.date) {
    lines.push('Date: ' + screenplay.date);
  }
  if (screenplay.contact) {
    lines.push('Contact: ' + screenplay.contact);
  }
  
  // End title page
  lines.push('');
  lines.push('===');
  lines.push('');
  
  // Convert elements
  let lastType: ScreenplayElementType | null = null;
  
  for (const element of screenplay.elements) {
    // Add blank line between different element types
    if (lastType && lastType !== element.type) {
      lines.push('');
    }
    
    const formatted = formatElement(element);
    if (formatted) {
      lines.push(formatted);
    }
    
    lastType = element.type;
  }
  
  return lines.join('\n');
}

function formatElement(element: ScreenplayElement): string {
  const content = element.content.trim();
  if (!content) return '';
  
  switch (element.type) {
    case 'scene_heading':
      // Scene headings in Fountain start with INT. or EXT.
      // If content doesn't start with these, force it
      if (/^(INT|EXT|EST|INT\.\/EXT|I\/E)/i.test(content)) {
        return content.toUpperCase();
      }
      return '.' + content.toUpperCase(); // Force scene heading with .
    
    case 'action':
      return content;
    
    case 'character':
      // Character names are uppercase and can be forced with @
      return '@' + content.toUpperCase();
    
    case 'dialogue':
      return content;
    
    case 'parenthetical':
      // Parentheticals are wrapped in ()
      if (!content.startsWith('(')) {
        return '(' + content + ')';
      }
      return content;
    
    case 'transition':
      // Transitions end with TO: or are forced with >
      if (content.endsWith('TO:')) {
        return content.toUpperCase();
      }
      return '> ' + content.toUpperCase();
    
    case 'shot':
      // Shots are like action but can be forced with !!
      return content.toUpperCase();
    
    default:
      return content;
  }
}

/**
 * Parse Fountain text back to screenplay elements
 */
export function fromFountain(text: string): Partial<Screenplay> {
  const lines = text.split('\n');
  const elements: ScreenplayElement[] = [];
  const metadata: Record<string, string> = {};
  
  let inTitlePage = true;
  let currentElement: ScreenplayElement | null = null;
  let elementId = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check for title page end
    if (trimmed === '===' || trimmed === '---') {
      inTitlePage = false;
      continue;
    }
    
    // Parse title page
    if (inTitlePage) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        metadata[match[1].toLowerCase()] = match[2];
      }
      continue;
    }
    
    // Skip empty lines
    if (!trimmed) {
      if (currentElement) {
        elements.push(currentElement);
        currentElement = null;
      }
      continue;
    }
    
    // Detect element type
    const type = detectElementType(trimmed, lines, i);
    
    if (currentElement && currentElement.type === type && type === 'dialogue') {
      // Continue dialogue
      currentElement.content += '\n' + trimmed;
    } else {
      if (currentElement) {
        elements.push(currentElement);
      }
      
      currentElement = {
        id: `elem_${elementId++}`,
        type,
        content: cleanContent(trimmed, type),
      };
    }
  }
  
  if (currentElement) {
    elements.push(currentElement);
  }
  
  return {
    title: metadata.title || 'Untitled',
    author: metadata.author,
    contact: metadata.contact,
    draftNumber: metadata.draft,
    date: metadata.date,
    elements,
  };
}

function detectElementType(line: string, lines: string[], index: number): ScreenplayElementType {
  // Scene heading - starts with INT. EXT. etc or forced with .
  if (/^(INT|EXT|EST|INT\.\/EXT|I\/E)/i.test(line) || line.startsWith('.')) {
    return 'scene_heading';
  }
  
  // Forced character with @
  if (line.startsWith('@')) {
    return 'character';
  }
  
  // Transition - ends with TO: or forced with >
  if (line.endsWith('TO:') || line.startsWith('>')) {
    return 'transition';
  }
  
  // Parenthetical
  if (line.startsWith('(') && line.endsWith(')')) {
    return 'parenthetical';
  }
  
  // Character - all uppercase followed by dialogue
  if (/^[A-Z][A-Z\s\d]+$/.test(line)) {
    const nextLine = lines[index + 1]?.trim();
    if (nextLine && !nextLine.startsWith('(') && !/^[A-Z][A-Z\s]+$/.test(nextLine)) {
      return 'character';
    }
  }
  
  // Default to action
  return 'action';
}

function cleanContent(content: string, type: ScreenplayElementType): string {
  switch (type) {
    case 'scene_heading':
      return content.startsWith('.') ? content.slice(1) : content;
    case 'character':
      return content.startsWith('@') ? content.slice(1) : content;
    case 'transition':
      return content.startsWith('>') ? content.slice(1).trim() : content;
    default:
      return content;
  }
}

