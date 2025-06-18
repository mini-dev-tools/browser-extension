import { LoremIpsum } from 'lorem-ipsum';

export interface Letter {
  letter: string;
  count: number;
  percentage: number;
}

export interface LoremConfig {
  sentencesPerParagraph: {
    max: number;
    min: number;
  };
  wordsPerSentence: {
    max: number;
    min: number;
  };
}

export class TextUtils {
  // Word counting
  static countWords(text: string): number {
    const matches = text.match(/(\w+)/g);
    return matches ? matches.length : 0;
  }

  // Character counting
  static countCharacters(text: string): number {
    return text?.length || 0;
  }

  // Character counting excluding specific characters
  static countCharactersExcluding(text: string, exclude: string[] = []): number {
    if (!exclude.length) return text?.length || 0;
    
    let cleanText = text;
    const regex = new RegExp(exclude.join('|'), 'g');
    cleanText = cleanText.replace(regex, '');
    
    return cleanText?.length || 0;
  }

  // Letter composition analysis
  static analyzeLetterComposition(text: string): Letter[] {
    let cleanText = text.replace(/[\r\n]/gm, '');
    cleanText = cleanText.replace(/\s/g, '');
    cleanText = cleanText.toLowerCase();

    const uniqueChars = this.findUniqueCharacters(cleanText);
    const totalChars = cleanText.length;
    const composition: Letter[] = [];

    for (const char of uniqueChars) {
      const count = this.countCharacterOccurrences(cleanText, char);
      const percentage = totalChars > 0 ? (count / totalChars) * 100 : 0;

      composition.push({
        letter: char,
        count,
        percentage
      });
    }

    return composition.sort((a, b) => b.count - a.count);
  }

  // Utility functions
  private static findUniqueCharacters(text: string): string[] {
    return [...new Set(text.split(''))];
  }

  private static countCharacterOccurrences(text: string, char: string): number {
    return text.split(char).length - 1;
  }

  // Text cleaning
  static removeDoubleSpaces(text: string): string {
    return text.replace(/ +(?= )/g, '');
  }

  // Lorem Ipsum generation
  static generateLoremIpsum(type: 'words' | 'sentences' | 'paragraphs', count: number, config?: LoremConfig): string {
    const lorem = new LoremIpsum(config);
    
    switch (type) {
      case 'words':
        return lorem.generateWords(count);
      case 'sentences':
        return lorem.generateSentences(count);
      case 'paragraphs':
        return lorem.generateParagraphs(count);
      default:
        return lorem.generateParagraphs(count);
    }
  }

  // Convert text to lorem ipsum (replace words with lorem words)
  static convertTextToLoremIpsum(text: string): string {
    const wordCount = this.countWords(text);
    if (wordCount === 0) return '';
    
    const lorem = new LoremIpsum();
    return lorem.generateWords(wordCount);
  }

  // File operations
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error);
      return false;
    }
  }

  static downloadAsTextFile(content: string, filename: string = 'text.txt'): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Text statistics
  static getTextStatistics(text: string) {
    return {
      words: this.countWords(text),
      characters: this.countCharacters(text),
      charactersExcludingSpaces: this.countCharactersExcluding(text, [' ']),
      letterComposition: this.analyzeLetterComposition(text)
    };
  }
}

// Export individual functions for backward compatibility
export const wordsCount = TextUtils.countWords;
export const charCount = TextUtils.countCharactersExcluding;
export const letterComposition = TextUtils.analyzeLetterComposition;
export const removeDoubleSpace = TextUtils.removeDoubleSpaces;