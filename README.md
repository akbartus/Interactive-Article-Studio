# Interactive Article Studio

A powerful web-based tool for creating immersive, scroll-driven 3D storytelling experiences. Build interactive articles that combine rich text, 3D scenes, camera animations, hotspots, videos, and AI-generated audio.

## Overview

Interactive Article Studio enables creators to build engaging narrative experiences by seamlessly blending traditional article content with interactive 3D elements. The platform supports real-time camera path recording, text overlays synchronized with 3D animations, and multimedia integration—all exportable as standalone HTML files.

## Key Features

### 🎬 3D Scene Management
- **Asset Support**: Import and manage 3D models (GLTF, GLB) and Gaussian Splats (.splat)
- **Visual Effects**: Built-in post-processing effects including bloom, glitch, halftone, and more
- **Scene Editor**: Intuitive transform controls (translate, rotate, scale) with visual grid system
- **Background Customization**: Dynamic sky color and environment settings

### 📹 Camera Animation System
- **Live Recording**: Record camera movements in real-time with frame-perfect capture
- **Keyframe Editor**: Manually place camera positions and create interpolated paths
- **Path Management**: Save, load, and organize multiple camera animations
- **Smooth Playback**: 60fps interpolation for cinematic camera movements

### 📝 Scrollytelling Engine
- **Text Overlays**: Rich text editor (Quill.js) with formatting, colors, and image support
- **Synchronized Animations**: Link text slides to specific camera path frames
- **Multiple Directions**: Configurable text entrance animations (bottom-to-top, left-to-right, etc.)
- **Customizable Styling**: Adjustable background colors, opacity, and overlay width

### 🖼️ Interactive Hotspots
- **Image Integration**: Upload images and add interactive markers
- **Dual Hotspot Types**:
  - **Info (ℹ️)**: Display text information on click
  - **Eye (👁️)**: Show detailed images with descriptions
- **Visual Editor**: Drag-and-drop hotspot placement on uploaded images

### 🎥 Scroll-Driven Video
- **Frame-Perfect Scrubbing**: Videos play frame-by-frame based on scroll position
- **Multiple Formats**: Support for MP4, WebM, and OGG
- **Configurable Duration**: Adjust scroll distance for video playback speed

### 🔊 AI-Powered Audio
- **Text-to-Speech**: Integrated Kokoro TTS engine for natural voice synthesis
- **Multiple Voices**: 30+ English voices (US and UK accents)
- **Quality Options**: Multiple precision levels (FP32, FP16, Q8, Q4)
- **Audio Management**: Save and reuse generated audio clips

### 📄 Article Builder
- **Section Types**:
  - **Text Sections**: Rich formatted content with customizable backgrounds
  - **3D Sections**: Embedded camera animations with optional text overlays
  - **Hotspot Sections**: Interactive image experiences
  - **Video Sections**: Scroll-controlled video playback
  - **Audio Sections**: Embedded audio players with transcripts
- **Drag-to-Reorder**: Flexible section organization
- **HTML Export**: Complete standalone articles with embedded assets

### 💾 Project Management
- **SQLite Database**: Persistent storage for all project data
- **Auto-Save**: Continuous project state preservation
- **Version Control**: Track project creation and modification times
- **Quick Load**: Recent projects list with timestamps

## Technology Stack

### Frontend
- **A-Frame**: WebVR framework for 3D scene rendering
- **Three.js**: Underlying 3D graphics library
- **Quill.js**: WYSIWYG rich text editor
- **Troika Text**: High-quality 3D text rendering
- **Custom Components**: Specialized A-Frame components for camera recording, scroll animation, and video control

### Backend
- **Node.js + Express**: RESTful API server
- **SQLite3**: Lightweight project database
- **Multer**: Multipart file upload handling
- **Kokoro.js**: Neural text-to-speech synthesis

## Export System

### HTML Generation
The export system creates standalone HTML files with:
- Embedded 3D scenes with all assets
- Scroll-driven camera animations
- Text overlay system with transitions
- Interactive hotspot functionality
- Frame-accurate video scrubbing
- All custom A-Frame components inlined
- Self-contained with no external dependencies

## Requirements

- Node.js 18+
- Modern web browser with WebGL 2.0 support
- SQLite3
- Minimum 4GB RAM (for TTS model loading)

## Performance Considerations

- **Camera Recordings**: Stored with frame-level precision; large recordings (>5000 frames) may impact load times
- **Gaussian Splats**: Can be memory-intensive; recommend files under 100MB
- **Video Files**: Use web-optimized formats (H.264 MP4) for best scrubbing performance
- **TTS Model**: ~500MB model loaded on first request; subsequent generations are fast

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- WebGL 2.0 required

## Upcoming:
- Explore NYT R&D ThreeBird in house scrolytelling app based on images provided (it is not open-source but can give some ideas about the features I can integrate further) 
- Implement ability to load/import a spreadsheet containing text, frame number, and duration for how long the scrollable text remains visible in frames. 
- Add possibility to make change of slides based on click event (clicking on a button - left/right - makes camera jump from point A to point B).
- Add Help menu item explaining how to's. 
- Create tutorials on creating Gaussian Splat and GTLF files, compression methods, on using the studio.
- Improve UI and start working on mobile version.
- Add improved code exporting feature. Add CMS friendly version for WP, Joomla, etc.
- Add multiple language support (preferably German, French and Spanish).

  ## License

MIT

## Documentation

Full documentation coming soon.
