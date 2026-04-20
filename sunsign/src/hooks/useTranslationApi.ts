/**
 * translateText
 * =============
 * This is a simple tool that uses Google's public translation API 
 * to swap text from one language to another.
 * 
 * Note: Since it's a free public link, it might stop working if we 
 * send too many requests, so we use the original text as a backup.
 */

export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  // If there's no text or the languages are the same, don't bother
  if (!text || sourceLang === targetLang) return text;

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const json = await res.json();
    
    // The Google API returns a complex list; we just need the first part
    return json[0].map((item: any) => item[0]).join('');
  } catch (e) {
    console.error("Translation didn't work:", e);
    return text; // Just return the original text if the internet is down
  }
}
