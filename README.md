# Introvideo

Fil: `assets/video/intro.mp4`

Dette er en enkel MVP-intro for **Etter Isen Companion App**.

## Bruk i appen

Legg for eksempel dette inn i `index.html` der du vil vise videoen:

```html
<video class="intro-video" controls poster="assets/img/cover.jpg">
  <source src="assets/video/intro.mp4" type="video/mp4">
  Nettleseren din støtter ikke videoavspilling.
</video>
```

## Foreslått CSS

```css
.intro-video {
  width: 100%;
  max-width: 1100px;
  border-radius: 22px;
  border: 1px solid rgba(230, 210, 170, 0.35);
  box-shadow: 0 20px 60px rgba(0,0,0,0.45);
  background: #111;
}
```

Videoen er laget som en lavterskel MVP: stillbilder, tekstplakater og enkel stemningslyd.
