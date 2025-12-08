import { Screenplay, ScreenplayElement, ScreenplayElementType } from '@/types/screenplay';

// PDF Generation using jsPDF
// We'll generate a screenplay-formatted PDF

interface PDFConfig {
  pageWidth: number;  // inches
  pageHeight: number;
  leftMargin: number;
  rightMargin: number;
  topMargin: number;
  bottomMargin: number;
  fontSize: number;
  lineHeight: number;
}

const DEFAULT_CONFIG: PDFConfig = {
  pageWidth: 8.5,
  pageHeight: 11,
  leftMargin: 1.5,
  rightMargin: 1,
  topMargin: 1,
  bottomMargin: 1,
  fontSize: 12,
  lineHeight: 1,
};

// Margins for different element types (in inches from left)
const ELEMENT_MARGINS: Record<ScreenplayElementType, { left: number; right: number }> = {
  scene_heading: { left: 1.5, right: 1 },
  action: { left: 1.5, right: 1 },
  character: { left: 3.7, right: 0 },
  dialogue: { left: 2.5, right: 2 },
  parenthetical: { left: 3.1, right: 2.4 },
  transition: { left: 6, right: 1 },
  shot: { left: 1.5, right: 1 },
  text: { left: 1.5, right: 1 },
};

/**
 * Generate PDF bytes for a screenplay
 * Returns the raw text content that would be used for PDF
 * (In a real implementation, we'd use jsPDF)
 */
export function generatePDFContent(screenplay: Screenplay): string {
  const lines: string[] = [];
  const config = DEFAULT_CONFIG;
  
  // Title page
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push(centerText(screenplay.title.toUpperCase(), config));
  lines.push('');
  lines.push('');
  lines.push(centerText('Written by', config));
  lines.push('');
  lines.push(centerText(screenplay.author || 'Anonymous', config));
  
  if (screenplay.draftNumber) {
    lines.push('');
    lines.push('');
    lines.push(centerText(screenplay.draftNumber, config));
  }
  
  if (screenplay.contact) {
    // Contact info at bottom left
    lines.push('');
    lines.push('');
    lines.push('');
    lines.push('');
    lines.push('');
    lines.push('');
    lines.push('');
    lines.push(screenplay.contact);
  }
  
  // Page break after title page
  lines.push('\f'); // Form feed for page break
  
  // Content
  let currentSceneNumber = 0;
  
  for (const element of screenplay.elements) {
    lines.push('');
    
    if (element.type === 'scene_heading') {
      currentSceneNumber++;
      lines.push(formatElement(element, config, currentSceneNumber));
    } else {
      lines.push(formatElement(element, config));
    }
  }
  
  return lines.join('\n');
}

function formatElement(
  element: ScreenplayElement,
  config: PDFConfig,
  sceneNumber?: number
): string {
  const margins = ELEMENT_MARGINS[element.type];
  const indent = ' '.repeat(Math.floor((margins.left - config.leftMargin) * 10));
  const content = element.content;
  
  switch (element.type) {
    case 'scene_heading':
      const sceneNumStr = sceneNumber ? `${sceneNumber}. ` : '';
      return `${sceneNumStr}${content.toUpperCase()}`;
    
    case 'action':
      return content;
    
    case 'character':
      return indent + content.toUpperCase();
    
    case 'dialogue':
      // Word wrap dialogue
      return indent + wrapText(content, 35);
    
    case 'parenthetical':
      const paren = content.startsWith('(') ? content : `(${content})`;
      return indent + paren;
    
    case 'transition':
      // Right-aligned
      return padLeft(content.toUpperCase(), 60);
    
    default:
      return content;
  }
}

function centerText(text: string, config: PDFConfig): string {
  const pageChars = Math.floor((config.pageWidth - config.leftMargin - config.rightMargin) * 10);
  const padding = Math.floor((pageChars - text.length) / 2);
  return ' '.repeat(Math.max(0, padding)) + text;
}

function padLeft(text: string, totalWidth: number): string {
  const padding = totalWidth - text.length;
  return ' '.repeat(Math.max(0, padding)) + text;
}

function wrapText(text: string, maxWidth: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxWidth) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  
  return lines.join('\n                    '); // Indent continuation lines
}

/**
 * Create a simple text-based representation
 * that looks like a screenplay when printed
 */
export function toScreenplayText(screenplay: Screenplay): string {
  return generatePDFContent(screenplay);
}

