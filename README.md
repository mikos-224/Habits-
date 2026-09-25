# Nawyki – PWA

Offlineowa aplikacja do śledzenia codziennych nawyków.

## Pliki
- `index.html` – interfejs
- `style.css` – wygląd
- `app.js` – logika i zapis danych
- `manifest.json` – konfiguracja PWA
- `sw.js` – tryb offline
- `icon.svg` – ikona

## GitHub Pages
1. Utwórz nowe repozytorium na GitHubie.
2. Wgraj wszystkie pliki z tego folderu do głównego katalogu repozytorium.
3. Wejdź w **Settings → Pages**.
4. W `Build and deployment` wybierz `Deploy from a branch`.
5. Wybierz `main` i `/ (root)`, kliknij `Save`.
6. Po chwili otwórz adres GitHub Pages.
7. W przeglądarce telefonu wybierz instalację aplikacji / „Dodaj do ekranu głównego”.

Dane nawyków są przechowywane w `localStorage` urządzenia i nie są wysyłane na serwer.
