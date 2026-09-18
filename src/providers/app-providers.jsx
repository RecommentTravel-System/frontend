import { ThemeProvider } from "./theme-provider";
import { LayoutProvider } from "./layout-provider";
import { I18nProvider } from "./i18n-provider";
import { AuthProvider } from "./auth-provider";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
