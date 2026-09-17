import { ThemeProvider } from "./theme-provider";
import { LayoutProvider } from "./layout-provider";
import { I18nProvider } from "./i18n-provider";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
