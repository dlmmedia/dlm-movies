'use client';

import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react';
import { ScreenplayElement, ScreenplayElementType, ELEMENT_STYLES } from '@/types/screenplay';
import { v4 as uuidv4 } from 'uuid';

interface ScreenplayEditorProps {
  elements: ScreenplayElement[];
  onChange: (elements: ScreenplayElement[]) => void;
  readOnly?: boolean;
  showPageBreaks?: boolean;
}

const ELEMENT_CYCLE: ScreenplayElementType[] = [
  'scene_heading',
  'action',
  'character',
  'dialogue',
  'parenthetical',
  'transition',
];

const ELEMENT_LABELS: Record<ScreenplayElementType, string> = {
  scene_heading: 'Scene Heading',
  action: 'Action',
  character: 'Character',
  dialogue: 'Dialogue',
  parenthetical: 'Parenthetical',
  transition: 'Transition',
  shot: 'Shot',
  text: 'Text',
};

const ELEMENT_PLACEHOLDERS: Record<ScreenplayElementType, string> = {
  scene_heading: 'INT. LOCATION - DAY',
  action: 'Action description...',
  character: 'CHARACTER NAME',
  dialogue: 'Character dialogue...',
  parenthetical: '(beat)',
  transition: 'CUT TO:',
  shot: 'ANGLE ON',
  text: 'Text...',
};

// Courier Prime-like styling with proper screenplay margins
const getElementStyle = (type: ScreenplayElementType): string => {
  const styles = ELEMENT_STYLES[type];
  const baseStyle = 'font-mono text-[12pt] leading-[1.5] outline-none resize-none w-full bg-transparent';
  
  let marginStyle = '';
  
  switch (type) {
    case 'scene_heading':
      marginStyle = 'uppercase font-bold';
      break;
    case 'action':
      marginStyle = '';
      break;
    case 'character':
      marginStyle = 'uppercase text-center ml-[35%]';
      break;
    case 'dialogue':
      marginStyle = 'ml-[15%] mr-[20%]';
      break;
    case 'parenthetical':
      marginStyle = 'ml-[25%] mr-[30%] italic';
      break;
    case 'transition':
      marginStyle = 'uppercase text-right';
      break;
    case 'shot':
      marginStyle = 'uppercase';
      break;
    default:
      marginStyle = '';
  }
  
  return `${baseStyle} ${marginStyle}`;
};

export default function ScreenplayEditor({
  elements,
  onChange,
  readOnly = false,
  showPageBreaks = true,
}: ScreenplayEditorProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showTypeMenu, setShowTypeMenu] = useState<number | null>(null);
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  // Auto-resize textareas
  const autoResize = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  // Update element content
  const updateElement = useCallback((index: number, content: string) => {
    const newElements = [...elements];
    newElements[index] = { ...newElements[index], content };
    onChange(newElements);
  }, [elements, onChange]);

  // Change element type
  const changeElementType = useCallback((index: number, type: ScreenplayElementType) => {
    const newElements = [...elements];
    newElements[index] = { ...newElements[index], type };
    onChange(newElements);
    setShowTypeMenu(null);
  }, [elements, onChange]);

  // Add new element after current
  const addElementAfter = useCallback((index: number, type: ScreenplayElementType) => {
    const newElement: ScreenplayElement = {
      id: uuidv4(),
      type,
      content: '',
    };
    const newElements = [...elements];
    newElements.splice(index + 1, 0, newElement);
    onChange(newElements);
    
    // Focus new element
    setTimeout(() => {
      const textarea = textareaRefs.current.get(newElement.id);
      if (textarea) {
        textarea.focus();
        setActiveIndex(index + 1);
      }
    }, 0);
  }, [elements, onChange]);

  // Delete element
  const deleteElement = useCallback((index: number) => {
    if (elements.length <= 1) return;
    
    const newElements = [...elements];
    newElements.splice(index, 1);
    onChange(newElements);
    
    // Focus previous element
    if (index > 0) {
      setTimeout(() => {
        const prevElement = newElements[index - 1];
        const textarea = textareaRefs.current.get(prevElement.id);
        if (textarea) {
          textarea.focus();
          setActiveIndex(index - 1);
        }
      }, 0);
    }
  }, [elements, onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    const element = elements[index];
    const textarea = e.currentTarget;

    // Tab - cycle element type
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const currentTypeIndex = ELEMENT_CYCLE.indexOf(element.type);
      const nextTypeIndex = (currentTypeIndex + 1) % ELEMENT_CYCLE.length;
      changeElementType(index, ELEMENT_CYCLE[nextTypeIndex]);
      return;
    }

    // Shift+Tab - cycle backwards
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const currentTypeIndex = ELEMENT_CYCLE.indexOf(element.type);
      const prevTypeIndex = (currentTypeIndex - 1 + ELEMENT_CYCLE.length) % ELEMENT_CYCLE.length;
      changeElementType(index, ELEMENT_CYCLE[prevTypeIndex]);
      return;
    }

    // Enter - smart behavior based on element type
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Auto-determine next element type
      let nextType: ScreenplayElementType = 'action';
      
      switch (element.type) {
        case 'scene_heading':
          nextType = 'action';
          break;
        case 'action':
          nextType = 'action';
          break;
        case 'character':
          nextType = 'dialogue';
          break;
        case 'dialogue':
          nextType = 'character';
          break;
        case 'parenthetical':
          nextType = 'dialogue';
          break;
        case 'transition':
          nextType = 'scene_heading';
          break;
      }
      
      addElementAfter(index, nextType);
      return;
    }

    // Backspace at start of empty element - delete it
    if (e.key === 'Backspace' && element.content === '' && textarea.selectionStart === 0) {
      e.preventDefault();
      deleteElement(index);
      return;
    }

    // Arrow up at start - move to previous element
    if (e.key === 'ArrowUp' && textarea.selectionStart === 0 && index > 0) {
      e.preventDefault();
      const prevElement = elements[index - 1];
      const prevTextarea = textareaRefs.current.get(prevElement.id);
      if (prevTextarea) {
        prevTextarea.focus();
        prevTextarea.setSelectionRange(prevTextarea.value.length, prevTextarea.value.length);
        setActiveIndex(index - 1);
      }
      return;
    }

    // Arrow down at end - move to next element
    if (e.key === 'ArrowDown' && textarea.selectionStart === textarea.value.length && index < elements.length - 1) {
      e.preventDefault();
      const nextElement = elements[index + 1];
      const nextTextarea = textareaRefs.current.get(nextElement.id);
      if (nextTextarea) {
        nextTextarea.focus();
        nextTextarea.setSelectionRange(0, 0);
        setActiveIndex(index + 1);
      }
      return;
    }
  }, [elements, changeElementType, addElementAfter, deleteElement]);

  // Calculate page breaks (approx 55 lines per page)
  const getPageNumber = (lineIndex: number): number => {
    return Math.floor(lineIndex / 55) + 1;
  };

  return (
    <div className="screenplay-editor bg-[#fdf6e3] min-h-full">
      {/* Editor styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        
        .screenplay-editor {
          font-family: 'Courier Prime', 'Courier New', monospace;
        }
        
        .screenplay-page {
          width: 8.5in;
          min-height: 11in;
          padding: 1in 1in 1in 1.5in;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
        }
        
        @media (max-width: 900px) {
          .screenplay-page {
            width: 100%;
            padding: 1rem;
          }
        }
      `}</style>

      <div className="screenplay-page">
        {elements.map((element, index) => {
          const lineNumber = index + 1;
          const pageNumber = getPageNumber(index);
          const isPageBreak = showPageBreaks && index > 0 && getPageNumber(index - 1) < pageNumber;

          return (
            <div key={element.id}>
              {/* Page break indicator */}
              {isPageBreak && (
                <div className="border-t-2 border-dashed border-neutral-300 my-4 relative">
                  <span className="absolute -top-3 right-0 text-xs text-neutral-400 bg-white px-2">
                    Page {pageNumber}
                  </span>
                </div>
              )}

              <div
                className={`relative group ${activeIndex === index ? 'bg-yellow-50' : ''}`}
              >
                {/* Element type indicator */}
                {!readOnly && activeIndex === index && (
                  <div className="absolute -left-24 top-0 flex items-center gap-1">
                    <button
                      onClick={() => setShowTypeMenu(showTypeMenu === index ? null : index)}
                      className="text-xs text-neutral-500 hover:text-neutral-700 px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
                    >
                      {ELEMENT_LABELS[element.type]}
                    </button>
                    
                    {/* Type selection menu */}
                    {showTypeMenu === index && (
                      <div className="absolute left-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-10">
                        {ELEMENT_CYCLE.map((type) => (
                          <button
                            key={type}
                            onClick={() => changeElementType(index, type)}
                            className={`block w-full text-left px-3 py-1 text-sm hover:bg-neutral-100 ${
                              element.type === type ? 'bg-yellow-50 text-yellow-700' : ''
                            }`}
                          >
                            {ELEMENT_LABELS[type]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Scene number for scene headings */}
                {element.type === 'scene_heading' && element.sceneNumber && (
                  <span className="absolute -left-16 text-neutral-400 text-sm">
                    {element.sceneNumber}.
                  </span>
                )}

                {/* Content textarea */}
                <textarea
                  ref={(el) => {
                    if (el) {
                      textareaRefs.current.set(element.id, el);
                      autoResize(el);
                    }
                  }}
                  value={element.content}
                  onChange={(e) => {
                    updateElement(index, e.target.value);
                    autoResize(e.target);
                  }}
                  onFocus={() => setActiveIndex(index)}
                  onBlur={() => {
                    if (showTypeMenu !== index) setActiveIndex(null);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder={ELEMENT_PLACEHOLDERS[element.type]}
                  readOnly={readOnly}
                  rows={1}
                  className={`${getElementStyle(element.type)} placeholder-neutral-300`}
                  style={{
                    color: '#1a1a1a',
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Add element button */}
        {!readOnly && (
          <button
            onClick={() => addElementAfter(elements.length - 1, 'action')}
            className="mt-4 text-neutral-400 hover:text-neutral-600 text-sm flex items-center gap-1"
          >
            <span className="text-lg">+</span> Add element
          </button>
        )}
      </div>
    </div>
  );
}

