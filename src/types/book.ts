export type ArtStyle =
  | 'bold-easy'
  | 'mandala'
  | 'realistic'
  | 'stained-glass'
  | 'anime';

export type TrimSize =
  | '5x8'
  | '5.5x8.5'
  | '6x9'
  | '6.14x9.21'
  | '7x10'
  | '8x8.5'
  | '8x10'
  | '8.5x8.5'
  | '8.5x11';

export type AgeGroup =
  | '1-3'
  | '2-4'
  | '4-8'
  | '8-12'
  | 'teens'
  | 'adults';

export type Complexity = 'simple' | 'medium' | 'detailed';

export type Interior = 'single-sided' | 'double-sided';

export type IllustrationStatus = 'pending' | 'generating' | 'complete' | 'error';

export type BookStatus = 'draft' | 'published';

export interface BookPage {
  id: string;
  pageNumber: number;
  title: string;
  content: string;
  illustrationPrompt: string;
  svgIllustration?: string;
  illustrationStatus: IllustrationStatus;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  artStyle: ArtStyle;
  trimSize: TrimSize;
  pageCount: number;
  ageGroup: AgeGroup;
  complexity: Complexity;
  interior: Interior;
  pages: BookPage[];
  coverImageUrl?: string;
  author?: string;
  keywords?: string[];
  backCoverBlurb?: string;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TrimSizeInfo {
  value: TrimSize;
  label: string;
  description: string;
  widthIn: number;
  heightIn: number;
}

export const TRIM_SIZES: TrimSizeInfo[] = [
  { value: '5x8',      label: '5" × 8"',      description: 'Pocket — Novels & Journals', widthIn: 5,    heightIn: 8    },
  { value: '5.5x8.5',  label: '5.5" × 8.5"',  description: 'Digest',                     widthIn: 5.5,  heightIn: 8.5  },
  { value: '6x9',      label: '6" × 9"',       description: 'Standard ⭐ Most Popular',   widthIn: 6,    heightIn: 9    },
  { value: '6.14x9.21',label: '6.14" × 9.21"', description: 'Trade Paperback',            widthIn: 6.14, heightIn: 9.21 },
  { value: '7x10',     label: '7" × 10"',      description: 'Workbooks',                  widthIn: 7,    heightIn: 10   },
  { value: '8x8.5',    label: '8" × 8.5"',     description: 'Square Activity',            widthIn: 8,    heightIn: 8.5  },
  { value: '8x10',     label: '8" × 10"',      description: "Children's Book",            widthIn: 8,    heightIn: 10   },
  { value: '8.5x8.5',  label: '8.5" × 8.5"',   description: 'Square Coloring',            widthIn: 8.5,  heightIn: 8.5  },
  { value: '8.5x11',   label: '8.5" × 11"',    description: 'Letter — Large Coloring',    widthIn: 8.5,  heightIn: 11   },
];

export const ART_STYLES: { value: ArtStyle; label: string }[] = [
  { value: 'bold-easy',     label: 'Bold & Easy'    },
  { value: 'mandala',       label: 'Mandala'        },
  { value: 'realistic',     label: 'Realistic'      },
  { value: 'stained-glass', label: 'Stained Glass'  },
  { value: 'anime',         label: 'Anime'          },
];

export const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: '1-3',    label: '1–3'    },
  { value: '2-4',    label: '2–4'    },
  { value: '4-8',    label: '4–8'    },
  { value: '8-12',   label: '8–12'   },
  { value: 'teens',  label: 'Teens'  },
  { value: 'adults', label: 'Adults' },
];

export const COMPLEXITIES: { value: Complexity; label: string }[] = [
  { value: 'simple',   label: 'Simple'   },
  { value: 'medium',   label: 'Medium'   },
  { value: 'detailed', label: 'Detailed' },
];

/** KDP spine thickness per page in inches */
export const SPINE_PER_PAGE = {
  'white-bw':  0.002252,
  'cream':     0.0025,
  'color':     0.002347,
} as const;

export const KDP_BLEED = 0.125;
