/**
 * Simple implementation of clsx for class name management.
 * This avoids network dependencies.
 */

export type ClassValue = 
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: any }
  | ClassValue[];

function toVal(mix: ClassValue): string {
  let str = '';

  if (typeof mix === 'string' || typeof mix === 'number') {
    str = mix.toString();
  } else if (typeof mix === 'object' && mix !== null) {
    if (Array.isArray(mix)) {
      for (let i = 0; i < mix.length; i++) {
        const val = toVal(mix[i]);
        if (val) {
          str && (str += ' ');
          str += val;
        }
      }
    } else {
      for (const key in mix) {
        if (mix[key]) {
          str && (str += ' ');
          str += key;
        }
      }
    }
  }

  return str;
}

export function clsx(...inputs: ClassValue[]): string {
  let i = 0, tmp, x, str = '';
  while (i < inputs.length) {
    if ((tmp = inputs[i++])) {
      if ((x = toVal(tmp))) {
        str && (str += ' ');
        str += x;
      }
    }
  }
  return str;
} 