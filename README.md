# JEMT4 - Hawaiian Music Theory

A web application for teaching Hawaiian music theory with interactive ukulele fretboard diagrams.

## Features

- Interactive SVG ukulele fretboard (5 frets)
- Dynamic chord fingering display with black circles and white finger numbers
- Dropdown menus for chord selection (Root + Type)
- JSON-based chord library for easy maintenance
- Covers essential Hawaiian music chords in keys: C, G, F, E, D, A

## Chord Types Included

- **Major chords**: C, G, F, E, D, A
- **Minor chords**: Cm, Gm, Fm, Em, Dm, Am
- **7th chords**: C7, G7, F7, E7, D7, A7

## File Structure

```
JEMT4/
├── index.html          # Main application file
├── jemt4.html          # Development version
├── chords/             # JSON chord library
│   ├── C.json
│   ├── Cm.json
│   ├── C7.json
│   └── ... (18 total chord files)
└── README.md
```

## Deployment

To deploy this application:

1. Upload all files to your web server via SFTP/SSH
2. Ensure the `chords/` directory and all JSON files are uploaded
3. Access via your domain (e.g., `https://yourdomain.com/JEMT4/`)

## Usage

1. Select a root note from the dropdown (C, G, F, E, D, A)
2. Select a chord type (Major, Minor, 7th)
3. View the finger positions displayed on the fretboard
4. Black circles with white numbers show finger placement
5. "O" indicates open strings

## Development

- Built with vanilla HTML, CSS, and JavaScript
- SVG-based fretboard graphics
- Async JSON loading for chord data
- Responsive design for various screen sizes

Created for Hawaiian music education with focus on practical chord voicings.