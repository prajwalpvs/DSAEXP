# 🎨 Design System & CSS Guide

## Color Palette

### Primary Colors
```css
--primary: #667eea;      /* Soft Purple */
--primary-dark: #764ba2; /* Dark Purple */
--gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Secondary Colors
```css
--text-dark: #333;
--text-light: #666;
--background-light: #f9f9f9;
--background-lighter: #f0f5ff;
```

### Status Colors
```css
--error: #c33;      /* Red for errors */
--error-bg: #fee;   /* Light red background */
```

## Typography

### Font Family
```css
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
```

### Sizes
- **h1**: 2.5em - Page title
- **h2**: 1.5em - Section headers
- **h3**: 1.2em - Subsection headers
- **p**: 1em - Body text
- **button**: 1.1em - Interactive elements

## Spacing

```css
/* Use consistent margins for rhythm */
margin: 10px;    /* Small spacing */
margin: 15px;    /* Medium spacing */
margin: 20px;    /* Standard spacing */
margin: 30px;    /* Large spacing */
margin: 40px;    /* Extra large */
```

## Shadows (Depth)

```css
/* Subtle shadows for layers */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);        /* Hover state */
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);      /* Default */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);     /* Large containers */
```

## Animations

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 0.3s ease-in;
```

### Slide In
```css
@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
animation: slideIn 0.3s ease-out;
```

### Spin (Loading)
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
animation: spin 0.8s linear infinite;
```

### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
animation: slideUp 0.5s ease-out;
```

## Interactive Effects

### Button Hover
```css
.button:hover {
  transform: translateY(-2px);           /* Lift up */
  box-shadow: 0 8px 25px rgba(...);      /* More shadow */
}

.button:active {
  transform: translateY(0);              /* Press down */
}
```

### Ripple Effect
```css
.button::before {
  width: 0;
  height: 0;
  animation: ripple 0.6s;
}

@keyframes ripple {
  to {
    width: 300px;
    height: 300px;
  }
}
```

### Focus States
```css
input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}
```

## Responsive Design

### Mobile First
```css
/* Default styles (mobile) */
.container {
  max-width: 100%;
  padding: 20px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    max-width: 900px;
    padding: 40px;
  }
}

/* Desktop and up */
@media (min-width: 1200px) {
  .container {
    max-width: 1100px;
  }
}
```

## Gradients

### Linear Gradient (Background)
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Linear Gradient (Text)
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

### Radial Gradient
```css
background: radial-gradient(circle, #667eea 0%, #764ba2 100%);
```

## Borders & Radius

```css
/* Soft corners */
border-radius: 8px;       /* Buttons, small elements */
border-radius: 10px;      /* Cards, containers */
border-radius: 16px;      /* Large containers */
border-radius: 50%;       /* Circles */
```

## Transitions

```css
/* Smooth color change */
transition: background-color 0.3s ease;

/* Smooth all properties */
transition: all 0.3s ease;

/* Specific properties */
transition: transform 0.2s ease, box-shadow 0.2s ease;

/* Timing functions */
ease         /* Slow start and end (default) */
ease-in      /* Slow start */
ease-out     /* Slow end */
ease-in-out  /* Slow start and end */
linear       /* Constant speed */
```

## Glass Morphism (Modern)

```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

## Dark Mode

```css
@media (prefers-color-scheme: dark) {
  body {
    background: #1e1e1e;
    color: #d4d4d4;
  }
  
  .container {
    background: #2d2d2d;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
}
```

## Best Practices

✅ **DO:**
- Use CSS variables for colors
- Keep animations under 300-500ms
- Test on mobile
- Use semantic HTML
- Optimize images

❌ **DON'T:**
- Use !important (except rarely)
- Make animations too fast/slow
- Forget accessibility
- Hardcode colors
- Forget box-sizing: border-box

## CSS Variables Example

```css
:root {
  --primary: #667eea;
  --primary-dark: #764ba2;
  --text-dark: #333;
  --spacing-sm: 10px;
  --spacing-md: 20px;
  --spacing-lg: 30px;
  --border-radius: 10px;
}

.button {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  color: var(--text-dark);
}
```

## Common Combinations

### Modern Card
```css
.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 75px rgba(0, 0, 0, 0.15);
}
```

### Gradient Button
```css
.btn-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}
```

### Animated Text
```css
.text-animated {
  background: linear-gradient(90deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```
