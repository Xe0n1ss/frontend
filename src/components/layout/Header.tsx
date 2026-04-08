import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
};

export function Header({ title, subtitle, showSearch = true, onSearchClick }: HeaderProps) {
  return (
    <header className="mobile-header">
      <div className="mobile-header__top-pill" />

      <div className="mobile-header__row">
        <button className="icon-button" type="button" aria-label="Уведомления">
          <NotificationsNoneRoundedIcon fontSize="small" />
        </button>

        {showSearch ? (
          <button className="icon-button" type="button" aria-label="Открыть поиск" onClick={onSearchClick}>
            <SearchRoundedIcon fontSize="small" />
          </button>
        ) : (
          <div className="mobile-header__spacer" />
        )}
      </div>

      {(title || subtitle) && (
        <div className="mobile-header__content">
          {title && <h1 className="mobile-header__title">{title}</h1>}
          {subtitle && <p className="mobile-header__subtitle">{subtitle}</p>}
        </div>
      )}
    </header>
  );
}
