import { ThemeProvider } from "./theme-provider";
import { LayoutProvider } from "./layout-provider";
import { I18nProvider } from "./i18n-provider";
import { AuthProvider } from "./auth-provider";
import { LoadingProvider } from "./loading-provider";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <LoadingProvider>
            <LayoutProvider>
              {children}
            </LayoutProvider>
          </LoadingProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
