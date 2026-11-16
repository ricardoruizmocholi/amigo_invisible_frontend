export default function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="page-header">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="page-header__title">{title}</h1>
      {children && <p className="page-header__text">{children}</p>}
    </header>
  );
}
