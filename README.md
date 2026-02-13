# Interactive Article Studio

<table>
  <tr>
    <td><img src="img/1.jpg" title="screen capture" alt="screen capture" height="400"></td>
    <td><img src="img/2.jpg" title="screen capture" alt="screen capture" height="400"></td>
  </tr>
  <tr>
    <td><img src="img/3.jpg" title="screen capture" alt="screen capture" height="400"></td>
    <td><img src="img/4.jpg" title="screen capture" alt="screen capture" height="400"></td>
  </tr>
  <tr>
    <td><img src="img/5.jpg" title="screen capture" alt="screen capture" height="400"></td>
    <td><img src="img/6.jpg" title="screen capture" alt="screen capture" height="400"></td>
  </tr>
  <tr>
    <td><img src="img/7.jpg" title="screen capture" alt="screen capture" height="400"></td>
  </tr>
</table>



A powerful web-based and application-based (Windows, macOS) tool for creating immersive, scroll-driven 3D storytelling experiences. Build interactive articles that combine rich text, 3D scenes, camera animations, hotspots, videos, and AI-generated audio.



## Overview

Interactive Article Studio enables creators to build engaging narrative experiences by seamlessly blending traditional article content with interactive 3D elements. The platform, available in both web and desktop application forms, supports real-time camera path recording, text overlays synchronized with 3D animations, and multimedia integration — all exportable as standalone HTML files.



## Key Features

### 3D Scene Management

- **Asset Support**: Import and manage 3D models (GLTF, GLB), Gaussian Splats (.splat), and images  
- **Visual Effects**: Built-in post-processing effects including bloom, glitch, halftone, and more  
- **Scene Editor**: Intuitive transform controls (translate, rotate, scale) with visual grid system  
- **Background Customization**: Dynamic sky color and environment settings  


### Camera Animation System

- **Live Recording**: Record camera movements in real-time with frame-perfect capture  
- **Keyframe Editor**: Manually place camera positions and create interpolated paths  
- **Path Management**: Save, load, and organize multiple camera animations  
- **Smooth Playback**: 60fps interpolation for cinematic camera movements  


### Scrollytelling Engine

- **Text Overlays**: Rich text editor (Quill.js) with formatting, colors, and image support  
- **Synchronized Animations**: Link text slides to specific camera path frames  
- **Multiple Directions**: Configurable text entrance animations (bottom-to-top, left-to-right, etc.)  
- **Customizable Styling**: Adjustable background colors, opacity, and overlay width  


### Image Hotspots

- **Image Integration**: Upload images and add hotspots  
- **Hotspot Types**:  
  - **Info (ℹ️)**: Display text information on click  
  - **Eye (👁️)**: Show detailed images with descriptions  
- **Visual Editor**: Drag-and-drop hotspot placement on uploaded images  


### Scroll-Driven Video

- **Scroll-Based Video**: Videos play frame-by-frame based on scroll  
- **Multiple Formats**: Support for MP4, WebM, and OGG  


### AI-Powered Audio

- **Text-to-Speech**: Integrated Kokoro TTS engine for natural voice synthesis  
- **Multiple Voices**: 10+ English voices (US and UK accents)  
- **Quality Options**: Multiple precision levels (FP32, FP16, Q8, Q4) for speed and accuracy  
- **Audio Management**: Save and reuse generated audio clips  


### Article Builder

- **Section Types**:  
  - **Text Sections**: Rich formatted content with customizable backgrounds  
  - **3D Sections**: Embedded camera animations with optional text overlays  
  - **Hotspot Sections**: Interactive image experiences  
  - **Video Sections**: Scroll-controlled video playback  
  - **Audio Sections**: Embedded audio players with transcripts  

- **Drag-to-Reorder**: Flexible section organization  
- **HTML Export**: Complete standalone interactive article generator with embedded assets  



## Technology Stack

### Frontend

- **A-Frame**: Framework for 3D scene rendering  
- **Three.js**: Underlying 3D graphics library  
- **Quill.js**: WYSIWYG rich text editor  
- **Custom Components**: Specialized A-Frame components for camera recording, scroll animation, video control, etc.  


### Backend

- **Node.js + Express**: Server logic  
- **SQLite3**: Lightweight project database for saving projects  
- **Kokoro.js**: Text-to-speech AI model  



## Export System

The export system creates standalone HTML files with:

- Embedded 3D scenes with all assets  
- Scroll-driven camera animations  
- Text overlay system with transitions  
- Interactive hotspot functionality  
- Frame-accurate video scrubbing  
- All custom A-Frame components inlined  
- Self-contained output with no external dependencies  



## Requirements

- Modern web browser with WebGL 2.0 support (web version)  
- Minimum 4GB RAM (for TTS model loading)  



## Browser Compatibility (Web Version)

- Chrome / Edge 90+  
- Firefox 88+  
- Safari 14.1+  



## Changes in ver 0.0.2

### Fixes

- Fixed Gaussian Splatting rendering bug.  
- Resolved transparency issues.  


### Performance Improvements

- Updated `gaussian-splat-viewer` so performance-critical parts are executed in Web Workers.  
- Added performance configuration options.  


### UI & UX

- Updated **Camera Paths** section design.  
- Updated audio generation button.  


### New Feature

- Added a new camera path option: **Path Designer**.  
  - Draw camera paths manually on the canvas  
  - Supports elevation/height drawing  
  - Enables more precise and interactive camera path control  



## Upcoming Changes

- Add Studio performance options (File section) impacting WebGPU load and speed  
- Predefined camera paths selector  
- AI-powered short video generation  
- Project autosave options  
- Import spreadsheet containing text, frame number, and duration  
- Slide changes triggered by click events (jump between camera points)  
- Help menu with tutorials (Gaussian Splats, GLTF files, compression methods, usage guides, YouTube videos)  
- UI improvements  
- Improved mobile version  
- CMS-friendly exported HTML versions (WordPress, Joomla, others)  
- Multilanguage support  
- Release macOS version of the Studio  
- New HotSpot types  
- AI-powered text summarization (local + OpenAI API) — *In Progress*  
- Infographics section type in Article Builder  



## License

MIT  



## Documentation

Full documentation coming soon.
