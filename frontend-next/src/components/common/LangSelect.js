export function LangSelect({ lang, changeLang }) {
  return (
    <select className="lang-select" value={lang} onChange={(event) => changeLang(event.target.value)} aria-label="Language">
      <option value="en">EN</option>
      <option value="pt">PT</option>
      <option value="ru">RU</option>
    </select>
  );
}
