const DEFAULT_SIDEBAR_WIDTH = 288;
const DEFAULT_SIDEBAR_OPEN = false;
const DEFAULT_LOGS_PANE_HEIGHT = 200;
const DEFAULT_LOGS_PANE_COLLAPSED = true;
const DEFAULT_INSTALL_DEPENDENCIES = false;
const DEFAULT_MAX_DURATION = 5;
const DEFAULT_KEEP_ALIVE = false;
const DEFAULT_SHOW_FILES_PANE = true;
const DEFAULT_SHOW_CODE_PANE = true;
const DEFAULT_SHOW_PREVIEW_PANE = false;
const DEFAULT_SHOW_CHAT_PANE = true;

const SIDEBAR_WIDTH_COOKIE = "sidebar-width";
const SIDEBAR_OPEN_COOKIE = "sidebar-open";
const LOGS_PANE_HEIGHT_COOKIE = "logs-pane-height";
const LOGS_PANE_COLLAPSED_COOKIE = "logs-pane-collapsed";
const INSTALL_DEPENDENCIES_COOKIE = "install-dependencies";
const MAX_DURATION_COOKIE = "max-duration";
const KEEP_ALIVE_COOKIE = "keep-alive";
const SELECTED_OWNER_COOKIE = "selected-owner";
const SELECTED_REPO_COOKIE = "selected-repo";
const SHOW_FILES_PANE_COOKIE = "show-files-pane";
const SHOW_CODE_PANE_COOKIE = "show-code-pane";
const SHOW_PREVIEW_PANE_COOKIE = "show-preview-pane";
const SHOW_CHAT_PANE_COOKIE = "show-chat-pane";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function parseFromCookieString(cookieString: string | undefined, key: string): string | undefined {
  if (!cookieString) return undefined;
  const cookies = cookieString
    .split(";")
    .map((cookie) => cookie.trim().split("="))
    .reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {} as Record<string, string>);
  return cookies[key];
}

export function getSidebarWidth(): number {
  if (typeof window === "undefined") return DEFAULT_SIDEBAR_WIDTH;
  const value = readCookie(SIDEBAR_WIDTH_COOKIE);
  if (value) {
    const width = Number.parseInt(value, 10);
    if (Number.isFinite(width) && width >= 200 && width <= 600) return width;
  }
  return DEFAULT_SIDEBAR_WIDTH;
}

export function setSidebarWidth(width: number) {
  if (width >= 200 && width <= 600) {
    writeCookie(SIDEBAR_WIDTH_COOKIE, width.toString());
  }
}

export function getSidebarWidthFromCookie(cookieString?: string): number {
  const value = parseFromCookieString(cookieString, SIDEBAR_WIDTH_COOKIE);
  if (value) {
    const width = Number.parseInt(value, 10);
    if (Number.isFinite(width) && width >= 200 && width <= 600) return width;
  }
  return DEFAULT_SIDEBAR_WIDTH;
}

export function getSidebarOpen(): boolean {
  if (typeof window === "undefined") return DEFAULT_SIDEBAR_OPEN;
  const value = readCookie(SIDEBAR_OPEN_COOKIE);
  if (value !== undefined) return value === "true";
  return DEFAULT_SIDEBAR_OPEN;
}

export function setSidebarOpen(isOpen: boolean) {
  writeCookie(SIDEBAR_OPEN_COOKIE, isOpen.toString());
}

export function getSidebarOpenFromCookie(cookieString?: string): boolean {
  const value = parseFromCookieString(cookieString, SIDEBAR_OPEN_COOKIE);
  if (value !== undefined) return value === "true";
  return DEFAULT_SIDEBAR_OPEN;
}

export function getLogsPaneHeight(): number {
  if (typeof window === "undefined") return DEFAULT_LOGS_PANE_HEIGHT;
  const value = readCookie(LOGS_PANE_HEIGHT_COOKIE);
  if (value) {
    const height = Number.parseInt(value, 10);
    if (Number.isFinite(height) && height >= 100 && height <= 600) return height;
  }
  return DEFAULT_LOGS_PANE_HEIGHT;
}

export function setLogsPaneHeight(height: number) {
  if (height >= 100 && height <= 600) {
    writeCookie(LOGS_PANE_HEIGHT_COOKIE, height.toString());
  }
}

export function getLogsPaneCollapsed(): boolean {
  if (typeof window === "undefined") return DEFAULT_LOGS_PANE_COLLAPSED;
  const value = readCookie(LOGS_PANE_COLLAPSED_COOKIE);
  if (value !== undefined) return value === "true";
  return DEFAULT_LOGS_PANE_COLLAPSED;
}

export function setLogsPaneCollapsed(isCollapsed: boolean) {
  writeCookie(LOGS_PANE_COLLAPSED_COOKIE, isCollapsed.toString());
}

export function getInstallDependencies(): boolean {
  if (typeof window === "undefined") return DEFAULT_INSTALL_DEPENDENCIES;
  const value = readCookie(INSTALL_DEPENDENCIES_COOKIE);
  if (value !== undefined) return value === "true";
  return DEFAULT_INSTALL_DEPENDENCIES;
}

export function setInstallDependencies(value: boolean) {
  writeCookie(INSTALL_DEPENDENCIES_COOKIE, value.toString());
}

export function getMaxDuration(): number {
  if (typeof window === "undefined") return DEFAULT_MAX_DURATION;
  const value = readCookie(MAX_DURATION_COOKIE);
  if (value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_MAX_DURATION;
}

export function setMaxDuration(value: number) {
  if (value > 0) {
    writeCookie(MAX_DURATION_COOKIE, value.toString());
  }
}

export function getKeepAlive(): boolean {
  if (typeof window === "undefined") return DEFAULT_KEEP_ALIVE;
  const value = readCookie(KEEP_ALIVE_COOKIE);
  if (value !== undefined) return value === "true";
  return DEFAULT_KEEP_ALIVE;
}

export function setKeepAlive(value: boolean) {
  writeCookie(KEEP_ALIVE_COOKIE, value.toString());
}

export function getSelectedOwner(): string | null {
  if (typeof window === "undefined") return null;
  return readCookie(SELECTED_OWNER_COOKIE) ?? null;
}

export function setSelectedOwner(owner: string | null) {
  if (owner) {
    writeCookie(SELECTED_OWNER_COOKIE, owner);
  } else {
    writeCookie(SELECTED_OWNER_COOKIE, "", -1);
  }
}

export function getSelectedRepo(): string | null {
  if (typeof window === "undefined") return null;
  return readCookie(SELECTED_REPO_COOKIE) ?? null;
}

export function setSelectedRepo(repo: string | null) {
  if (repo) {
    writeCookie(SELECTED_REPO_COOKIE, repo);
  } else {
    writeCookie(SELECTED_REPO_COOKIE, "", -1);
  }
}

function boolPreference(cookieName: string, defaultValue: boolean): boolean {
  if (typeof window === "undefined") return defaultValue;
  const value = readCookie(cookieName);
  if (value !== undefined) return value === "true";
  return defaultValue;
}

function setBoolPreference(cookieName: string, value: boolean) {
  writeCookie(cookieName, value.toString());
}

export function getShowFilesPane() {
  return boolPreference(SHOW_FILES_PANE_COOKIE, DEFAULT_SHOW_FILES_PANE);
}

export function setShowFilesPane(value: boolean) {
  setBoolPreference(SHOW_FILES_PANE_COOKIE, value);
}

export function getShowCodePane() {
  return boolPreference(SHOW_CODE_PANE_COOKIE, DEFAULT_SHOW_CODE_PANE);
}

export function setShowCodePane(value: boolean) {
  setBoolPreference(SHOW_CODE_PANE_COOKIE, value);
}

export function getShowPreviewPane() {
  return boolPreference(SHOW_PREVIEW_PANE_COOKIE, DEFAULT_SHOW_PREVIEW_PANE);
}

export function setShowPreviewPane(value: boolean) {
  setBoolPreference(SHOW_PREVIEW_PANE_COOKIE, value);
}

export function getShowChatPane() {
  return boolPreference(SHOW_CHAT_PANE_COOKIE, DEFAULT_SHOW_CHAT_PANE);
}

export function setShowChatPane(value: boolean) {
  setBoolPreference(SHOW_CHAT_PANE_COOKIE, value);
}
