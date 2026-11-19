const githubDark = {
  part: '#FFB86C', chapter: '#FFB86C', section: '#79C0FF', subsection: '#7EE787',
  subsubsection: '#D2A8FF', paragraph: '#FFA657', subparagraph: '#F2CC60',
  environment: '#56D4DD', figure: '#F2CC60', table: '#FFA657', math: '#D2A8FF',
  caption: '#E3B341', label: '#8B949E', reference: '#79C0FF', citation: '#F778BA',
  texttt: '#A5D6FF', codeText: '#A5D6D9', codeBackground: '#79C0FF0D', error: '#FF7B72', errorBackground: '#F8514933'
};
export type Palette = typeof githubDark;
function accents(base: Palette, colors: Partial<Palette>): Palette { return { ...base, ...colors }; }
export const palettes = {
  githubDark,
  githubLight: accents(githubDark, { part:'#953800',chapter:'#953800',section:'#0550AE',subsection:'#116329',subsubsection:'#6639BA',paragraph:'#953800',subparagraph:'#7D4E00',environment:'#0A6269',figure:'#7D4E00',table:'#953800',math:'#6639BA',caption:'#7D4E00',label:'#57606A',reference:'#0550AE',citation:'#A40E26',texttt:'#0A6269',codeText:'#0A6269',codeBackground:'#0969DA0A',error:'#CF222E',errorBackground:'#FF818233' }),
  dracula: accents(githubDark, { part:'#FFB86C',chapter:'#FFB86C',section:'#BD93F9',subsection:'#50FA7B',subsubsection:'#FF79C6',paragraph:'#F1FA8C',subparagraph:'#8BE9FD',environment:'#8BE9FD',figure:'#F1FA8C',table:'#FFB86C',math:'#BD93F9',caption:'#F1FA8C',label:'#A4ACD4',reference:'#8BE9FD',citation:'#FF79C6',texttt:'#50FA7B',codeText:'#C5D8F7',codeBackground:'#6272A41A',error:'#FF8383',errorBackground:'#FF555533' }),
  nord: accents(githubDark, { part:'#D28C76',chapter:'#D28C76',section:'#88C0D0',subsection:'#A3BE8C',subsubsection:'#B793B0',paragraph:'#EBCB8B',subparagraph:'#81A1C1',environment:'#8FBCBB',figure:'#EBCB8B',table:'#D28C76',math:'#B793B0',caption:'#EBCB8B',label:'#AAB4C5',reference:'#88C0D0',citation:'#B793B0',texttt:'#8FBCBB',codeText:'#A9CCD2',codeBackground:'#88C0D010',error:'#D9A0A6',errorBackground:'#BF616A33' }),
  solarizedDark: accents(githubDark, { part:'#D7744C',chapter:'#D7744C',section:'#3A95D6',subsection:'#859900',subsubsection:'#B589D6',paragraph:'#B58900',subparagraph:'#2AA198',environment:'#2AA198',figure:'#B58900',table:'#D7744C',math:'#B589D6',caption:'#B58900',label:'#93A1A1',reference:'#3A95D6',citation:'#DE66A0',texttt:'#2AA198',codeText:'#94C8BD',codeBackground:'#2AA19812',error:'#E7726F',errorBackground:'#DC322F33' }),
  solarizedLight: accents(githubDark, { part:'#A83E12',chapter:'#A83E12',section:'#176DA8',subsection:'#657600',subsubsection:'#6368B4',paragraph:'#8A6800',subparagraph:'#187A73',environment:'#187A73',figure:'#8A6800',table:'#A83E12',math:'#6368B4',caption:'#8A6800',label:'#586E75',reference:'#176DA8',citation:'#B3296D',texttt:'#187A73',codeText:'#187A73',codeBackground:'#2AA1980D',error:'#B92926',errorBackground:'#DC322F26' })
};
export function resolvePalette(scheme: string, isLight: boolean, overrides: Record<string, unknown> = {}): Palette {
  const name = scheme === 'auto' ? isLight ? 'githubLight' : 'githubDark' : scheme;
  const result = { ...(palettes[name as keyof typeof palettes] || githubDark) };
  for (const [key, value] of Object.entries(overrides || {})) {
    if (Object.hasOwn(result, key) && typeof value === 'string' && /^#(?:[\da-f]{6}|[\da-f]{8})$/i.test(value)) result[key as keyof Palette] = value;
  }
  return result;
}
