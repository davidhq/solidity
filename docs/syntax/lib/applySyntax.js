import he from 'he';
import { createStarryNight, common, all } from '@wooorm/starry-night';
import { toHtml } from 'hast-util-to-html';

const starryNight = await createStarryNight(all);

export default function applySyntax(contents, lang) {
  const scope = starryNight.flagToScope(lang);
  const tree = starryNight.highlight(he.decode(contents), scope);

  const code = toHtml(tree);

  return code;
}
