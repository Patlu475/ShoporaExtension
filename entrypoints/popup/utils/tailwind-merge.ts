/**
 * Simple implementation of tailwind-merge functionality.
 * This is a lightweight alternative to avoid network dependencies.
 */

// Helper function to get class map
const getClassMap = (classString: string = '') => {
  const classes = classString.trim().split(/\s+/);
  const classMap: Record<string, string> = {};

  for (const cls of classes) {
    if (!cls) continue;
    
    // Extract the base class name and variant
    const match = cls.match(/^(.*?)[-:/](.*)$/);
    if (match) {
      const [, prefix, variant] = match;
      classMap[prefix] = cls;
    } else {
      classMap[cls] = cls;
    }
  }

  return classMap;
};

/**
 * Merges Tailwind CSS classes with proper override behavior
 */
export function twMerge(...classLists: (string | undefined | null | false)[]): string {
  const result: Record<string, string> = {};
  
  // Process each class list in order, so later ones override earlier ones
  for (const classList of classLists) {
    if (!classList) continue;
    
    const classes = getClassMap(classList.toString());
    
    // Merge the new classes, overriding any existing ones with the same base
    Object.assign(result, classes);
  }
  
  return Object.values(result).join(' ');
} 