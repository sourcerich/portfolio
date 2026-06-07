/* =============================================================================
   Split text into word masks for kinetic reveals.
   -----------------------------------------------------------------------------
   Each word becomes <span class="word-mask"><span class="word">…</span></span>.
   global.css hides .word (translateY 110%) only under html.js + motion, so the
   caller animates the returned .word elements up into view. Whitespace between
   words is preserved as text nodes (keeps natural wrapping + spacing).
   ========================================================================== */

export function splitWords(el: HTMLElement): HTMLElement[] {
  const source = el.textContent ?? '';
  const tokens = source.split(/(\s+)/); // keep the whitespace tokens
  el.textContent = '';

  const words: HTMLElement[] = [];
  for (const token of tokens) {
    if (token.length === 0) continue;
    if (token.trim() === '') {
      el.appendChild(document.createTextNode(token));
      continue;
    }
    const mask = document.createElement('span');
    mask.className = 'word-mask';
    const word = document.createElement('span');
    word.className = 'word';
    word.textContent = token;
    mask.appendChild(word);
    el.appendChild(mask);
    words.push(word);
  }
  return words;
}
