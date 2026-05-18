export function LangSelect({ lang, changeLang }) {
  return (
    <label className="lang-control" data-lang={lang.toUpperCase()} aria-label="Language">
      <span aria-hidden="true">◎</span>
      <select className="lang-select" value={lang} onChange={(event) => changeLang(event.target.value)}>
        <option value="en">EN</option>
        <option value="pt">PT</option>
        <option value="ru">RU</option>
      </select>
    </label>
  );
}
