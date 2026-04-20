/**
 * glossTokenizer.ts
 * =================
 * Converts Arabic or English text into sign tokens for the avatar.
 *
 * Steps:
 *  1. Remove diacritics (tashkeel).
 *  2. Fix common Arabic character variations (like different alefs).
 *  3. Remove "the" (ال) from the start of words for better matching.
 *  4. Look up words in the synonym map (over 200 entries).
 *  5. If a word isn't found, keep it as-is for fingerspelling.
 *  6. Remove duplicate signs that appear twice in a row.
 *
 * This script runs in the browser without needing an internet connection.
 */

// -- Helpers for cleaning up Arabic characters --

/** Remove vowel marks (tashkeel) from the text */
function stripDiacritics(s: string): string {
  return s.replace(/[\u064B-\u065F\u0670]/g, '');
}

/** Change different versions of letters to a standard one */
function normalizeArabic(s: string): string {
  return s
    // Different Alefs -> plain Alef
    .replace(/[أإآٱ]/g, 'ا')
    // Ta-marbuta -> Ha
    .replace(/ة/g, 'ه')
    // Alef maqsura -> Ya
    .replace(/ى/g, 'ي')
    // Waw variations -> Waw
    .replace(/ؤ/g, 'و')
    // Ya variations -> Ya
    .replace(/ئ/g, 'ي');
}

/** Remove the Arabic article (AL / THE) from the start of the word */
function stripDefiniteArticle(word: string): string {
  if (word.startsWith('لل'))  return word.slice(2);
  if (word.startsWith('ال'))  return word.slice(2);
  if (word.startsWith('بال')) return word.slice(3);
  if (word.startsWith('وال')) return word.slice(3);
  if (word.startsWith('كال')) return word.slice(3);
  if (word.startsWith('فال')) return word.slice(3);
  return word;
}

// -- Word mapping table --
// This maps different versions of words to a single key in the dictionary.
const SYNONYM_MAP: Record<string, string> = {
  // 1. Greetings
  'hello':        'السلام عليكم',
  'hi':           'السلام عليكم',
  'salam':        'السلام عليكم',
  'marhaba':      'السلام عليكم',
  'مرحبا':      'السلام عليكم',
  'مرحبه':      'السلام عليكم',
  'سلام':       'السلام عليكم',
  'السلام':     'السلام عليكم',
  'هلا':        'السلام عليكم',
  'اهلين':      'السلام عليكم',
  'نورت':       'السلام عليكم',
  'تحيه':       'السلام عليكم',

  'bye':          'مع السلامة',
  'goodbye':      'مع السلامة',
  'farewell':     'مع السلامة',
  'وداع':       'مع السلامة',
  'وداعا':      'مع السلامة',
  'باي':        'مع السلامة',
  'سلامات':     'مع السلامة',
  'تصبح':       'مع السلامة',
  'اشوفك':      'مع السلامة',

  'morning':      'صباح الخير',
  'good morning': 'صباح الخير',
  'صباح':       'صباح الخير',
  'يصبح':       'صباح الخير',
  'صباحالخير': 'صباح الخير',
  'صباحالنور': 'صباح الخير',
  'صباحي':      'صباح الخير',

  'evening':      'مساء الخير',
  'good evening': 'مساء الخير',
  'مساء':       'مساء الخير',
  'يمسي':       'مساء الخير',
  'مساءالخير': 'مساء الخير',
  'مساءالنور': 'مساء الخير',

  'thanks':       'شكراً',
  'thank':        'شكراً',
  'thank you':    'شكراً',
  'شكرا':       'شكراً',
  'شكر':        'شكراً',
  'اشكرك':      'شكراً',
  'تسلم':       'شكراً',
  'مشكور':      'شكراً',
  'ممتن':       'شكراً',

  'welcome':      'تشرفت بمقابلتك',
  'pleasure':     'تشرفت بمقابلتك',
  'تشرفت':      'تشرفت بمقابلتك',
  'نورتنا':     'تشرفت بمقابلتك',
  'فرصهسعيده': 'تشرفت بمقابلتك',
  'شرفت':       'تشرفت بمقابلتك',

  'how are you':  'كيف حالك',
  'hows it going':'كيف حالك',
  'كيفحالتك':   'كيف حالك',
  'كيفك':       'كيف حالك',
  'شلونك':      'كيف حالك',
  'اخبارك':     'كيف حالك',
  'ازيك':       'كيف حالك',
  'كيفالحال':   'كيف حالك',

  // 2. Emotions
  'fine':         'أنا بخير',
  'good state':   'أنا بخير',
  'بخير':       'أنا بخير',
  'انابخير':    'أنا بخير',
  'طيب':        'أنا بخير',
  'تمام':       'أنا بخير',
  'ماشي':       'أنا بخير',
  'بخيروالحمدلله':'أنا بخير',

  'happy':        'سعيد',
  'glad':         'سعيد',
  'joy':          'سعيد',
  'سعيد':       'سعيد',
  'سعيده':      'سعيد',
  'مبسوط':      'سعيد',
  'مبسوطه':     'سعيد',
  'فرحان':      'سعيد',
  'فرحانه':     'سعيد',
  'مسرور':      'سعيد',
  'مبتهج':      'سعيد',

  'sad':          'حزين',
  'unhappy':      'حزين',
  'sorrow':       'حزين',
  'حزين':       'حزين',
  'حزينه':      'حزين',
  'زعلان':      'حزين',
  'زعلانه':     'حزين',
  'متضايق':     'حزين',
  'مهموم':      'حزين',
  'كئيب':       'حزين',

  'worry':        'قلق',
  'worried':      'قلق',
  'anxious':      'قلق',
  'nervous':      'قلق',
  'قلق':        'قلق',
  'قلقان':      'قلق',
  'خايف':       'قلق',
  'خايفه':      'قلق',
  'متوتر':      'قلق',
  'شايلهم':     'قلق',

  'sorry':        'آسف',
  'apologize':    'آسف',
  'apology':      'آسف',
  'اسف':        'آسف',
  'اسفه':       'آسف',
  'انااسف':     'أنا آسف',
  'اعتذر':      'آسف',
  'معذره':      'آسف',
  'حقكعلي':     'آسف',
  'سامحني':     'آسف',

  'good':         'جيد',
  'great':        'جيد',
  'جيد':        'جيد',
  'جيده':       'جيد',
  'ممتاز':      'جيد',
  'رائع':       'جيد',
  'رهيب':       'جيد',

  'bad':          'ليس سيئا',
  'not bad':      'ليس سيئا',
  'سيء':        'ليس سيئا',
  'موحلو':      'ليس سيئا',
  'ليسبهذاالسوء':'ليس سيئا',
  'ليسيئا':     'ليس سيئا',

  'normal':       'عادي',
  'okay':         'عادي',
  'ordinary':     'عادي',
  'عادي':       'عادي',
  'عاديه':      'عادي',
  'بسيط':       'عادي',
  'طبيعي':      'عادي',

  // 3. Family
  'father':       'أب',
  'dad':          'أب',
  'papa':         'أب',
  'اب':         'أب',
  'بابا':       'أب',
  'والد':       'أب',
  'ابوي':       'أب',
  'والدي':      'أب',

  'mother':       'أم',
  'mom':          'أم',
  'mama':         'أم',
  'ام':         'أم',
  'ماما':       'أم',
  'والده':      'أم',
  'امي':        'أم',
  'والدتي':     'أم',

  'baby':         'طفل',
  'infant':       'طفل',
  'child':        'طفل',
  'kids':         'طفل',
  'طفل':        'طفل',
  'اطفال':      'طفل',
  'صغير':       'طفل',
  'مولود':      'طفل',
  'بزر':        'طفل',
  'ورع':        'طفل',

  'me':           'أنا',
  'i':            'أنا',
  'myself':       'أنا',
  'انا':        'أنا',
  'اني':        'أنا',
  'ذاتي':       'أنا',

  'important':    'مهم',
  'vital':        'مهم',
  'مهم':        'مهم',
  'هام':        'مهم',
  'ضروري':      'مهم',
  'لازم':       'مهم',

  // 4. Verbs
  'eat':          'يأكل',
  'eating':       'يأكل',
  'food':         'يأكل',
  'ياكل':       'يأكل',
  '나클':        'يأكل',
  'تاكل':       'يأكل',
  'اكل':        'يأكل',
  'ياكلون':     'يأكل',
  'اكلوا':      'يأكل',
  'تغدى':       'يأكل',
  'تعشى':       'يأكل',

  'love':         'يحب',
  'heart':        'يحب',
  'like':         'يحب',
  'adore':        'يحب',
  'حب':         'يحب',
  'يحب':        'يحب',
  'احب':        'يحب',
  'تحب':        'يحب',
  'يعشق':       'يحب',
  'يهوى':       'يحب',
  'حبيت':       'يحب',
  'يعجبني':     'يحب',

  'think':        'يفكر',
  'thinking':     'يفكر',
  'wonder':       'يفكر',
  'فكر':        'يفكر',
  'يفكر':       'يفكر',
  'نفكر':       'يفكر',
  'تفكر':       'يفكر',
  'باليمشغول':  'يفكر',
  'يتامل':      'يفكر',
  'يخطط':       'يفكر',

  'hear':         'يسمع',
  'listen':       'يسمع',
  'يسمع':       'يسمع',
  'سمع':        'يسمع',
  'نسامع':      'يسمع',
  'تسمع':       'يسمع',
  'ينصت':       'يسمع',
  'توحى':       'يسمع',

  'finish':       'انتهى',
  'done':         'انتهى',
  'complete':     'انتهى',
  'خلص':        'انتهى',
  'انتهى':      'انتهى',
  'انتهيت':     'انتهى',
  'تم':         'انتهى',
  'جاهز':       'انتهى',
  'سلم':        'انتهى',

  'stop':         'توقف',
  'halt':         'توقف',
  'enough':       'توقف',
  'وقف':        'توقف',
  'توقف':       'توقف',
  'خلاص':       'توقف',
  'بسك':        'توقف',
  'كافي':       'توقف',
  'هدي':        'توقف',

  // 5. Places
  'house':        'منزل',
  'home':         'منزل',
  'building':     'منزل',
  'منزل':       'منزل',
  'بيت':        'منزل',
  'بيتي':       'منزل',
  'سكن':        'منزل',
  'دار':        'منزل',
  'حوش':        'منزل',

  'mosque':       'مسجد',
  'prayer':       'مسجد',
  'مسجد':       'مسجد',
  'جامع':       'مسجد',
  'امام':       'مسجد',
  'مصلى':       'مسجد',

  'mall':         'مركز تسوق',
  'market':       'مركز تسوق',
  'shopping':     'مركز تسوق',
  'سوق':        'مركز تسوق',
  'مركزتسوق':   'مركز تسوق',
  'مول':        'مركز تسوق',
  'مجمع':       'مركز تسوق',

  'alhamdulillah':'الحمد لله',
  'praise god':   'الحمد لله',
  'الحمدلله':   'الحمد لله',
  'حمدا':       'الحمد لله',
  'الشكرلله':   'الحمد لله',
};

/** Split text into a pool of words and find their matching signs */
export function tokenizeArabic(text: string): string[] {
  // 1. Remove diacritics
  const noDiac = stripDiacritics(text);
  // 2. Remove punctuation but keep spaces
  const clean = noDiac.replace(/[،.؟!\"':،؛،\-_]/g, '');
  // 3. Split the sentence into single words
  const rawWords = clean.split(/\s+/).filter(w => w.length > 0);

  const result = rawWords.flatMap((word, idx) => {
    const lower = word.toLowerCase();
    let mapped: string | string[] | null = null;

    // Check English words first
    if (SYNONYM_MAP[lower])  mapped = SYNONYM_MAP[lower];
    else if (SYNONYM_MAP[word])   mapped = SYNONYM_MAP[word];
    else {
      // Check Arabic words after cleaning them up
      const norm    = normalizeArabic(stripDiacritics(word));
      const normLow = norm.toLowerCase();

      if (SYNONYM_MAP[norm])    mapped = SYNONYM_MAP[norm];
      else if (SYNONYM_MAP[normLow]) mapped = SYNONYM_MAP[normLow];
      else {
        // Try removing the definite article and checking again
        const stripped    = stripDefiniteArticle(norm);
        const strippedRaw = stripDefiniteArticle(word);
        if (stripped !== norm) {
          if (SYNONYM_MAP[stripped])           mapped = SYNONYM_MAP[stripped];
          else if (SYNONYM_MAP[stripped.toLowerCase()]) mapped = SYNONYM_MAP[stripped.toLowerCase()];
          else if (SYNONYM_MAP[strippedRaw])        mapped = SYNONYM_MAP[strippedRaw];
        }
      }
    }

    // If we don't know the word, fingerspell it letter by letter
    if (!mapped) mapped = word.split('');

    // Add a space sign if it's not the last word
    if (idx < rawWords.length - 1) {
      return Array.isArray(mapped) ? [...mapped, ' '] : [mapped, ' '];
    }
    
    return mapped;
  });

  // Remove duplicate signs that appear one after another
  return result.filter((tok, i) => i === 0 || tok !== result[i - 1]);
}

