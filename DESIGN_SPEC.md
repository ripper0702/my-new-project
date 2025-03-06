# Social Network App Design Specification

## 1. Color Palette

### Primary Colors
- Gold/Bronze: `#C1A173` (Used in onboarding screen background)
- White: `#FFFFFF` (Text and UI elements)
- Black: `#000000` (Text and UI elements)
- Semi-transparent Black: `rgba(0, 0, 0, 0.5)` (Tab bar background)

### Secondary Colors
- Light Gray: `#F5F5F5` (Background elements)
- Medium Gray: `#808080` (Secondary text)
- Accent Red: `#FF4B4B` (Notification dot)

## 2. Typography

### Fonts
- Primary Font: SF Pro Display
- Secondary Font: SF Pro Text

### Text Styles
- Hero Text (Onboarding):
  - Size: 36px
  - Weight: Bold
  - Color: White
  - Line Height: 1.2

- App Title:
  - Size: 18px
  - Weight: SemiBold
  - Color: Black

- Username:
  - Size: 14px
  - Weight: Medium
  - Color: Black

- Stats:
  - Size: 16px
  - Weight: Bold
  - Color: Black

- Button Text:
  - Size: 16px
  - Weight: Medium
  - Color: White

## 3. Screen-Specific Details

### Onboarding Screen
- Background: Gradient overlay on golden background
- Hero Image: Full-screen background with centered subject
- CTA Button:
  - Background: White
  - Border Radius: 24px
  - Padding: 16px 32px
  - Shadow: Light drop shadow
  - Icon: Lock icon with right arrow

### Feed Screen
- Header:
  - Height: 56px
  - App Logo: Left-aligned
  - Notification Bell: Right-aligned
  - Stories Bar:
    - Height: 90px
    - Story Circle Size: 60px
    - Story Circle Border: 2px
    - Username Below: 12px font

- Post Card:
  - Border Radius: 12px
  - Padding: 16px
  - User Avatar: 40px diameter
  - Engagement Bar:
    - Height: 40px
    - Icon Size: 24px
    - Spacing: 16px between items

### Profile Screen
- Cover Photo:
  - Height: 160px
  - Gradient Overlay: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)`

- Profile Info:
  - Avatar Size: 96px
  - Avatar Border: 4px white
  - Name: 24px bold
  - Bio: 14px regular
  - Stats Row:
    - Font: 16px
    - Spacing: 32px between items

- Gallery Grid:
  - 2 columns
  - Gap: 2px
  - Aspect Ratio: 1:1

## 4. Navigation & Tab Bar

### Tab Bar Design
- Height: 64px
- Background: Glass effect with dark tint (`rgba(0,0,0,0.8)`)
- Blur Effect: 20px
- Border Top: 0.5px semi-transparent white
- Icons:
  - Size: 24px
  - Active Color: White
  - Inactive Color: Gray
  - Spacing: Equal distribution
  - Labels: Hidden

### Tab Bar Items
1. Home Icon: House symbol
2. Search/Discover: Magnifying glass
3. Like/Activity: Heart
4. Profile: User circle
5. Menu: More options (3 dots)

## 5. Micro-Interactions

### Button States
- Tap Feedback: Scale to 0.98
- Press Opacity: 0.8
- Transition: 150ms ease-out

### Story Interactions
- Tap Feedback: Scale to 0.95
- Progress Ring: 2px width
- Animation: 300ms ease-in-out

### Feed Scroll
- Momentum scrolling enabled
- Pull to refresh animation
- Scroll to top on header tap

### Like Animation
- Heart burst animation
- Scale: 1.2
- Duration: 300ms
- Ease: Spring(1, 0.3)

## 6. UI Components

### Cards & Containers
- Corner Radius: 12px
- Shadow:
  ```css
  box-shadow: 0 2px 8px rgba(0,0,0,0.1)
  ```
- Content Padding: 16px

### Input Fields
- Height: 48px
- Border Radius: 8px
- Border: 1px solid rgba(0,0,0,0.1)
- Focus State: 2px solid primary color

### Buttons
- Primary Height: 48px
- Border Radius: 24px
- Text Transform: None
- Font Weight: 600

## 7. Image Treatments

### Profile Pictures
- Circle Crop
- Border: 2px solid white
- Shadow: 0 2px 4px rgba(0,0,0,0.1)

### Post Images
- Border Radius: 8px
- Max Height: 400px
- Content Mode: Cover

### Story Thumbnails
- Circle Crop
- Gradient Border when active
- Size: 60px x 60px

## 8. Loading States & Transitions

### Screen Transitions
- Duration: 300ms
- Curve: ease-in-out
- Push Animation: 3D perspective

### Content Loading
- Skeleton Screens:
  - Background: #F0F0F0
  - Animation: Pulse
  - Duration: 1.5s
  - Opacity Range: 0.5 - 0.8

## 9. Accessibility

### Touch Targets
- Minimum Size: 44x44px
- Spacing: 8px minimum

### Color Contrast
- Text on Background: 4.5:1 minimum
- Interactive Elements: 3:1 minimum

### Visual Feedback
- State Changes: 200ms
- Error States: Red (#FF3B30)
- Success States: Green (#34C759)
