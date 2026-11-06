# Nexus — STYLE.md
# Complete Design System + Frontend Agent Prompt

---

## 1. DESIGN OVERVIEW

Nexus uses a **layered dark theme** — not a single flat dark color,
but 4 distinct dark surfaces that create visual depth and hierarchy
without any light backgrounds anywhere. The aesthetic is professional,
dense, and focused — every pixel serves communication.

**Personality:** Productive. Calm. Dense but not cramped.
**Audience:** Teams who want Slack without the subscription.
**Signature element:** The 3-column layout (sidebar + chat + thread/details)
where all three panels are simultaneously visible and equal citizens.

---

## 2. COLOR SYSTEM

### Background Layers (darkest → lightest)
```
--color-bg-base:       #1a1d21   Outermost page background
--color-bg-sidebar:    #19171d   Sidebar background (slightly purple-tinted dark)
--color-bg-main:       #1d1c1d   Main chat area background
--color-bg-surface:    #222529   Cards, modals, input containers, message hover
--color-bg-input:      #2c2d30   Text inputs, textareas
--color-bg-hover:      #27292d   Hover state on sidebar items, buttons
--color-bg-active:     #1164a3   Active/selected channel (exact Slack blue)
--color-bg-overlay:    rgba(0,0,0,0.60)  Modal backdrop
```

### Text Colors
```
--color-text-primary:  #d1d2d3   Default body text, message content
--color-text-white:    #ffffff   Headings, usernames, active items
--color-text-secondary:#c9cacb   Secondary labels, channel names
--color-text-muted:    #9b9da0   Timestamps, subtitles, placeholders
--color-text-faint:    #6b7280   Disabled states, very muted info
--color-text-accent:   #4a9eed   Links, active icons, keyword highlights
--color-text-error:    #e8502a   Error messages (red-orange, not pure red)
```

### Accent & Interactive
```
--color-accent:        #4a9eed   Primary accent (buttons, links, active)
--color-accent-hover:  #6ab0f5   Hover state of accent
--color-accent-bg:     #1164a3   Active channel background (Slack blue)
--color-accent-muted:  rgba(74,158,237,0.20)  Keyword highlight bg in search
--color-button-primary:#4a55c8   CTA buttons (indigo-blue, slightly purple)
--color-button-hover:  #5561d4   CTA button hover
```

### Status Colors
```
--color-online:        #2bac76   Green dot — user is online
--color-away:          #e8a723   Yellow dot — user is away
--color-offline:       #6b7280   Gray dot — user is offline
```

### Borders & Dividers
```
--color-border:        #383a40   Standard border (inputs, panels, dividers)
--color-border-light:  #2c2d30   Subtle dividers inside surfaces
```

### Reaction Pills
```
--color-reaction-bg:       #27292d   Reaction pill background
--color-reaction-border:   #383a40   Reaction pill border
--color-reaction-own-border: #4a9eed  Border when current user reacted
--color-reaction-hover:    #2c2d30   Reaction pill hover
```

---

## 3. TYPOGRAPHY

### Font Family
```
Primary:  'Lato', 'Helvetica Neue', Arial, sans-serif
Mono:     'SF Mono', 'Fira Code', monospace  (for code blocks)
```

### Type Scale
```
text-[11px]   Timestamps, section headers (uppercase), badges
text-xs       12px — Muted labels, reaction counts, helper text
text-sm       14px — Message content, sidebar items, input text
text-base     16px — Channel name in header, modal titles
text-lg       18px — Page headings, DM username in details panel
text-xl       20px — Auth page titles
text-2xl      24px — Logo/workspace name on auth pages
```

### Font Weights
```
font-normal    400 — Message content, body text
font-medium    500 — Sidebar items, labels
font-semibold  600 — Usernames in messages, channel header, modal titles
font-bold      700 — Workspace name, CTA buttons, logo
```

### Letter Spacing
```
Section headers (CHANNELS, DIRECT MESSAGES):
  text-[11px] font-semibold uppercase tracking-wider text-gray-400
```

---

## 4. SPACING SYSTEM

```
Sidebar width:          260px (fixed)
Thread panel width:     320px (fixed when open)
DM details panel width: 288px (fixed when open)
Chat header height:     56px (h-14)
Message input area:     auto-grows, min 44px
Sidebar item padding:   py-1 px-3 mx-2
Modal width:            384px (w-96)
Modal padding:          24px (p-6)
Message padding:        px-4 py-1 (tighter than you think)
Avatar gap to content:  12px (gap-3)
Section header margin:  mt-4 mb-1 px-3
```

---

## 5. COMPONENT SPECS — EXTRACTED FROM SCREENSHOTS

### 5.1 LOGIN PAGE (Image 1)
```
Layout:
- Full screen bg: #1a1d21 (--color-bg-base)
- Centered card: bg-[#222529] rounded-xl p-8 w-[400px] shadow-2xl
- No border on card (shadow only)

Logo area:
- Circular icon: bg-[#4a55c8] rounded-full w-10 h-10
  containing white "S" or speech bubble icon
- "Nexus" text-2xl font-bold text-white inline next to icon
- gap-3 between icon and text

Fields:
- Label: text-sm font-medium text-gray-300 mb-1
- Input: w-full bg-[#2c2d30] border border-[#383a40] rounded-lg
  px-4 py-2.5 text-sm text-white placeholder-gray-500
  focus:outline-none focus:border-[#4a9eed] focus:ring-1
  focus:ring-[#4a9eed] transition-colors
- Password field: relative div, input with pr-10,
  Eye/EyeOff icon absolute right-3 top-1/2 -translate-y-1/2
  text-gray-400 hover:text-gray-200 cursor-pointer

Error message:
- text-[#e8502a] text-sm mt-1 (shown below password field)
- Text: "Incorrect email or password."

CTA Button:
- w-full bg-[#4a55c8] hover:bg-[#5561d4] text-white
  font-semibold py-2.5 rounded-lg transition-colors
- Text: "Log In"

Footer link:
- text-gray-400 text-sm text-center mt-4
- "Don't have an account?" + "Register" bold text-white
  cursor-pointer hover:underline
```

### 5.2 REGISTER PAGE (Image 3)
```
Layout:
- Top navbar: bg-[#1a1d21] border-b border-[#383a40] h-12
  containing "Nexus" logo left-aligned px-6
- Content: full remaining height, flex center

Card:
- bg-[#222529] rounded-xl p-8 w-[400px]
- Title: "Create Your Account" text-xl font-semibold text-white mb-6

Input fields WITH icons:
- Wrapper: relative div w-full
- Icon: absolute left-3 top-1/2 -translate-y-1/2
  text-gray-400 w-4 h-4
- Input: pl-10 pr-4 (left padding accommodates icon)
- Username field: User icon (lucide)
- Email field: Mail icon (lucide)
- Password field: Lock icon (lucide) left + Eye/EyeOff right

CTA Button:
- Text: "Create Account"
- Same style as Login button

Footer:
- Full page footer: "© 2023 Nexus. All rights reserved.
  Privacy Policy | Terms of Service."
- text-xs text-gray-500 text-center fixed bottom-4
```

### 5.3 SIDEBAR (Images 2, 4, 5)
```
Container:
- w-[260px] h-screen bg-[#19171d] flex flex-col
- No right border — relies on color contrast

Workspace header:
- h-14 flex items-center px-4 border-b border-[#383a40]
- Logo icon (small, 24px) + workspace name font-bold text-white
- Notification bell icon right side text-gray-400

Section headers:
- text-[11px] font-semibold uppercase tracking-wider
  text-gray-400 px-3 mt-4 mb-1 flex items-center justify-between
- Plus icon (+) right side: text-gray-400 hover:text-white
  cursor-pointer w-4 h-4

Channel items:
- flex items-center gap-2 px-3 py-1 mx-2 rounded text-sm
  cursor-pointer transition-colors
- Prefix: "# " text-gray-400 (the hash symbol)
- Inactive: text-gray-300 hover:bg-[#27292d]
- Active: bg-[#1164a3] text-white rounded
- Unread badge: ml-auto bg-white text-[#19171d] text-[10px]
  font-bold rounded-full min-w-[18px] h-[18px]
  flex items-center justify-center px-1

DM items:
- flex items-center gap-2 px-3 py-1 mx-2 rounded text-sm
  cursor-pointer hover:bg-[#27292d]
- Status dot: w-2 h-2 rounded-full flex-shrink-0
  online=#2bac76 away=#e8a723 offline=#6b7280
- Username: text-gray-300 text-sm
- Active DM: bg-[#1164a3] text-white

User bar (bottom):
- border-t border-[#383a40] p-3 mt-auto
- flex items-center gap-2
- Avatar (32px, rounded-full)
- display_name text-sm font-medium text-white
- username text-xs text-gray-400
- Settings/more icon ml-auto text-gray-400 hover:text-white
```

### 5.4 CHAT HEADER (Images 2, 4)
```
Container:
- h-14 border-b border-[#383a40] flex items-center
  px-4 gap-3 bg-[#1d1c1d]

Left:
- "# " text-gray-400 + channel.name font-semibold text-white text-base
- Vertical divider: w-px h-5 bg-[#383a40] mx-2
- Description: text-sm text-gray-400 truncate max-w-xs

Right icons (gap-1):
- Each: p-1.5 rounded text-gray-400 hover:text-white
  hover:bg-[#27292d] cursor-pointer transition-colors
- Phone, Info, Settings, Search, Mention icons (lucide)
```

### 5.5 MESSAGE LIST & ITEMS (Image 4)
```
Message list container:
- flex-1 overflow-y-auto px-4 py-2
- Scroll behavior: scroll-smooth

Date divider:
- flex items-center gap-3 my-3
- Left/right lines: flex-1 h-px bg-[#383a40]
- Center text: text-[11px] text-gray-500 font-medium px-2
  e.g. "Today", "Yesterday", "Mon Jan 1"

Message item (.message-hover group):
- flex gap-3 px-4 py-1 hover:bg-[#27292d]/40 rounded
  relative group transition-colors
- Avatar: w-9 h-9 rounded-full flex-shrink-0

Message content:
- Header row: flex items-baseline gap-2
  - Username: font-semibold text-white text-sm
  - Timestamp: text-[11px] text-gray-500 ml-1
  - "(edited)": text-[11px] text-gray-500 italic ml-1
- Content: text-sm text-[#d1d2d3] mt-0.5 leading-relaxed
- Deleted: text-sm text-gray-500 italic
  "This message was deleted"

Hover action toolbar:
- absolute top-0 right-4 -translate-y-1/2
- opacity-0 group-hover:opacity-100 transition-opacity
- bg-[#222529] border border-[#383a40] rounded-lg
  shadow-lg p-1 flex items-center gap-0.5
- Each action button: p-1.5 rounded text-gray-400
  hover:text-white hover:bg-[#27292d] cursor-pointer
  transition-colors
- Icons: SmilePlus, MessageSquare, Pencil, Trash2 (lucide)
  w-4 h-4

Reaction pills:
- flex flex-wrap gap-1 mt-1
- Each pill: flex items-center gap-1 bg-[#27292d]
  border border-[#383a40] rounded-full px-2 py-0.5
  text-sm cursor-pointer hover:bg-[#2c2d30] transition-colors
- Own reaction: border-[#4a9eed] bg-[#4a9eed]/10
- Content: emoji + " " + count text-xs text-gray-300
```

### 5.6 MESSAGE INPUT (Images 2, 4, 5)
```
Container:
- px-4 pb-4 pt-0

Input box:
- border border-[#383a40] rounded-lg bg-[#2c2d30]
  overflow-hidden

Textarea:
- w-full bg-transparent px-4 pt-3 pb-2 text-sm
  text-[#d1d2d3] placeholder-gray-500 resize-none
  outline-none min-h-[44px] max-h-[200px]
- Placeholder: "Message #channel-name"

Bottom toolbar (inside input box):
- border-t border-[#383a40]/50 px-2 py-1.5
  flex items-center justify-between
- Left: Smile icon button (emoji picker trigger)
  text-gray-400 hover:text-gray-200 p-1 rounded
  hover:bg-[#383a40]
- Right: Send button bg-[#4a55c8] hover:bg-[#5561d4]
  text-white rounded p-1.5 disabled:opacity-40
  disabled:cursor-not-allowed
  Send icon (lucide) w-4 h-4
```

### 5.7 THREAD PANEL (Image 4)
```
Container:
- w-80 border-l border-[#383a40] bg-[#1d1c1d]
  flex flex-col h-full flex-shrink-0

Header:
- h-14 border-b border-[#383a40] px-4
  flex items-center justify-between
- "Thread" font-semibold text-white
- Reply count: text-sm text-gray-400 ml-2
- X button: text-gray-400 hover:text-white p-1 rounded
  hover:bg-[#27292d]

Parent message (condensed):
- px-4 py-3 border-b border-[#383a40]
- Same layout as MessageItem but no hover toolbar

Divider with reply count:
- flex items-center gap-2 px-4 py-2
- Lines: flex-1 h-px bg-[#383a40]
- "N replies" text-xs text-gray-500

Replies list:
- flex-1 overflow-y-auto
- Same MessageItem layout, condensed

Thread input:
- Same as MessageInput but placeholder "Reply to thread..."
- No bottom toolbar icons for simplicity
```

### 5.8 DM DETAILS PANEL (Image 5)
```
Container:
- w-72 border-l border-[#383a40] bg-[#1d1c1d]
  flex flex-col h-full flex-shrink-0

Header:
- h-14 border-b border-[#383a40] px-4
  flex items-center justify-between
- "Details" font-semibold text-white text-lg
- X icon button

User card (p-4 flex flex-col items-center gap-2 text-center):
- Avatar: w-16 h-16 rounded-full (lg size)
- display_name: text-lg font-semibold text-white
- Status dot + status text inline
- bio: text-sm text-gray-400 mt-1

Info section (px-4 py-3 border-t border-[#383a40]):
- Each row: mb-3
  - Label: text-xs font-semibold uppercase text-gray-500
    tracking-wider mb-0.5
  - Value: text-sm text-gray-200

Shared files section (px-4 py-3 border-t border-[#383a40]):
- Header: text-xs font-semibold uppercase text-gray-500
  tracking-wider mb-2
- Each file item: flex items-center gap-3 py-2
  hover:bg-[#27292d] rounded px-2 cursor-pointer
  - Icon: FileText lucide w-8 h-8 text-[#e8502a]
    bg-[#e8502a]/10 rounded p-1.5
  - Right: filename text-sm text-gray-200 font-medium
            "Recent document" text-xs text-gray-500
```

### 5.9 CREATE CHANNEL MODAL (Image 2)
```
Overlay: fixed inset-0 bg-black/60 z-50 flex items-center
  justify-center

Modal box:
- bg-[#222529] rounded-xl w-[448px] shadow-2xl
  border border-[#383a40]

Header:
- px-6 pt-6 pb-4
- "Create a channel" text-xl font-bold text-white

Channel name field:
- Label: "Channel name" text-sm font-medium text-gray-300 mb-1
- Input wrapper: flex items-center bg-[#2c2d30]
  border border-[#383a40] rounded-lg overflow-hidden
  focus-within:border-[#4a9eed]
- Hash prefix: px-3 text-gray-400 font-medium text-sm
  border-r border-[#383a40] h-full flex items-center
  bg-[#2c2d30] select-none
- Input: flex-1 bg-transparent px-3 py-2.5 text-sm
  text-white placeholder-gray-500 outline-none
- Placeholder: "e.g. budget-planning"

Description field:
- Label: "Description (optional)" text-sm text-gray-300 mb-1
- Textarea: w-full bg-[#2c2d30] border border-[#383a40]
  rounded-lg px-3 py-2.5 text-sm text-white
  placeholder-gray-500 resize-none h-32 outline-none
  focus:border-[#4a9eed]
- Placeholder: "What's this channel about?"

Footer buttons (px-6 pb-6 pt-4 border-t border-[#383a40]):
- flex justify-end gap-3
- Cancel: bg-transparent border border-[#383a40]
  text-gray-300 hover:bg-[#27292d] px-4 py-2
  rounded-lg text-sm font-medium
- Create: bg-[#4a55c8] hover:bg-[#5561d4] text-white
  px-4 py-2 rounded-lg text-sm font-semibold
```

### 5.10 SEARCH OVERLAY (Image 6)
```
Container:
- absolute top-14 right-0 w-[400px] bg-[#222529]
  border border-[#383a40] rounded-xl shadow-2xl z-40
  max-h-[480px] overflow-hidden flex flex-col

Search input at top:
- flex items-center gap-2 px-4 py-3
  border-b border-[#383a40]
- Search icon: text-gray-400 w-4 h-4 flex-shrink-0
- Input: flex-1 bg-transparent text-white text-sm
  outline-none placeholder-gray-500
- X button: text-gray-400 hover:text-white

Results list (overflow-y-auto):
- Each result: px-4 py-3 hover:bg-[#27292d]
  cursor-pointer border-b border-[#383a40]/50
  transition-colors

Result item layout:
- Row 1: flex items-center gap-2 mb-1
  - Channel badge: "#channel-name" text-xs
    bg-[#27292d] border border-[#383a40]
    text-[#4a9eed] rounded px-2 py-0.5 font-medium
  - Sender: text-xs text-gray-400
  - Timestamp: text-xs text-gray-500 ml-auto
- Row 2: text-sm text-gray-200 leading-relaxed
  Keyword highlighted:
  <mark> bg-[#4a9eed]/20 text-[#6ab0f5]
  rounded px-0.5 font-medium (no italic)

Empty state:
- px-4 py-8 text-center text-sm text-gray-500
  "No results for "{query}""
```

### 5.11 USER AVATAR COMPONENT
```
Sizes:
- sm:  w-6  h-6  text-[10px]  (sidebar DM list)
- md:  w-9  h-9  text-sm      (messages)
- lg:  w-16 h-16 text-xl      (DM details panel)

With image: <img className="rounded-full object-cover w-full h-full">
Without image: div with rounded-full bg-[#4a55c8] flex items-center
  justify-center text-white font-semibold
  Showing: first letter of display_name toUpperCase()

Status dot overlay (showStatus=true):
- absolute bottom-0 right-0
- w-2.5 h-2.5 rounded-full border-2 border-[#19171d]
- online: bg-[#2bac76]
- away:   bg-[#e8a723]
- offline: bg-[#6b7280]
```

---

## 6. LAYOUT ARCHITECTURE

```
FULL APP LAYOUT (3 columns, full screen, no scroll):

┌─────────────────────────────────────────────────────────────┐
│ SIDEBAR (260px fixed)  │ CHAT AREA (flex-1) │ PANEL (320px) │
│                        │                    │ Thread OR      │
│ [Workspace Header]     │ [Chat Header h-14] │ DM Details     │
│ [Channel List]         │ [Message List]     │ (conditional)  │
│ [DM List]              │ [flex-1 scroll]    │                │
│ [User Bar]             │ [Typing Indicator] │                │
│                        │ [Message Input]    │                │
└─────────────────────────────────────────────────────────────┘

CSS:
  #root { height: 100vh; overflow: hidden; }
  .app-layout { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: 260px; flex-shrink: 0; }
  .chat-area { flex: 1; display: flex; overflow: hidden; }
  .panel { width: 320px; flex-shrink: 0; }
```

---

## 7. MICRO-INTERACTIONS & ANIMATIONS

```
Hover transitions:    transition-colors duration-150
Button press:         active:scale-95 transition-transform duration-75
Modal open:           animate-in: opacity 0→1 + scale 0.95→1
                      duration-150 ease-out
Toast:                react-hot-toast, position top-right
Typing indicator:     3 bouncing dots animation
                      @keyframes bounce with 0.3s stagger
Unread badge:         no animation (clean)
Message appear:       no animation (performance)
Emoji picker:         opacity + translateY transition 150ms
```

---

## 8. TAILWIND CONFIG

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-base':        '#1a1d21',
        'bg-sidebar':     '#19171d',
        'bg-main':        '#1d1c1d',
        'bg-surface':     '#222529',
        'bg-input':       '#2c2d30',
        'bg-hover':       '#27292d',
        'bg-active':      '#1164a3',
        // Text
        'text-primary':   '#d1d2d3',
        'text-muted':     '#9b9da0',
        'text-faint':     '#6b7280',
        // Accent
        accent:           '#4a9eed',
        'accent-hover':   '#6ab0f5',
        // Buttons
        'btn-primary':    '#4a55c8',
        'btn-hover':      '#5561d4',
        // Status
        online:           '#2bac76',
        away:             '#e8a723',
        offline:          '#6b7280',
        // Borders
        border:           '#383a40',
        'border-light':   '#2c2d30',
        // Error
        error:            '#e8502a',
      },
      fontFamily: {
        sans: ['Lato', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'monospace'],
      },
      width: {
        sidebar: '260px',
        panel: '320px',
        'dm-details': '288px',
      },
      height: {
        header: '56px',
      },
    },
  },
  plugins: [],
}
```

---

## 9. GLOBAL CSS

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after { box-sizing: border-box; }

html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif;
  background-color: #1a1d21;
  color: #d1d2d3;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: #383a40;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover { background: #4a4b50; }

/* Message hover toolbar — hide by default, show on group hover */
.message-group .message-toolbar {
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease;
}
.message-group:hover .message-toolbar {
  opacity: 1;
  pointer-events: auto;
}

/* Typing indicator dots */
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}
.typing-dot:nth-child(1) { animation: typingBounce 1s ease infinite; }
.typing-dot:nth-child(2) { animation: typingBounce 1s ease 0.15s infinite; }
.typing-dot:nth-child(3) { animation: typingBounce 1s ease 0.30s infinite; }

/* Emoji picker positioning fix */
em-emoji-picker {
  --background-rgb: 34, 37, 41;
  --border-color: #383a40;
  --category-icon-active-color: #4a9eed;
  height: 350px;
}
```

---

## 10. COMPLETE AGENT PROMPT — BUILD FULL FRONTEND

```
You are building the complete frontend for "Nexus".
The backend is running at http://localhost:5000 with these confirmed
working endpoints and socket events (Phase 2 is complete and verified).

Read STYLE.md (this file) before writing a single line of code.
Every color, spacing, font size, and component shape must match the
design system defined above EXACTLY. No deviations.

══════════════════════════════════════════════════════════════════
CONFIRMED BACKEND CONTRACT
══════════════════════════════════════════════════════════════════

Database tables (SERIAL integer PKs):
  users: id, username, email, password_hash, avatar_url, status,
         bio, display_name, created_at
  channels: id, name, description, created_by, created_at
  channel_members: channel_id, user_id, joined_at
  messages: id, channel_id, user_id, parent_id, content,
            is_edited, is_deleted, created_at, updated_at
  reactions: id, message_id, user_id, emoji, created_at
  dm_conversations: id, user1_id, user2_id, created_at
  dm_messages: id, dm_conversation_id, sender_id, content,
               is_deleted, created_at
  channel_reads: channel_id, user_id, last_read_at
  notifications: id, user_id, type, message_id, is_read, created_at

REST API (all protected with Bearer token except auth):
  POST   /api/auth/register      body: {username,email,password}
                                 res:  {user, token}
  POST   /api/auth/login         body: {email,password}
                                 res:  {user, token}
  GET    /api/auth/me            res:  {user}
  GET    /api/channels           res:  {channels} (with unread_count)
  POST   /api/channels           body: {name,description}
                                 res:  {channel}
  GET    /api/channels/:id/messages?limit=50&offset=0
                                 res:  {messages}
  POST   /api/channels/:id/read  res:  {success:true}
  POST   /api/messages           body: {channel_id,content,parent_id}
                                 res:  {message}
  PUT    /api/messages/:id       body: {content}
                                 res:  {message}
  DELETE /api/messages/:id       res:  {success:true}
  GET    /api/messages/:id/replies res: {replies}
  POST   /api/reactions          body: {message_id,emoji}
                                 res:  {reaction}
  DELETE /api/reactions          body: {message_id,emoji}
                                 res:  {success:true}
  GET    /api/users              res:  {users}
  GET    /api/users/:id          res:  {user}
  PUT    /api/users/:id          body: {display_name,bio,avatar_url}
                                 res:  {user}
  PATCH  /api/users/:id/status   body: {status}
                                 res:  {user}
  GET    /api/dms/conversation/:userId  res: {conversation}
  GET    /api/dms/:id/messages   res:  {messages}
  POST   /api/dms                body: {conversation_id,content,receiver_id}
                                 res:  {message}
  GET    /api/search?q=&channel_id=  res: {results}

Socket.io events:
  Client → Server:
    join_channel    { channelId }
    leave_channel   { channelId }
    typing_start    { channelId }
    typing_stop     { channelId }
    mark_read       { channelId }

  Server → Client:
    new_message          full message object with user joined
    message_deleted      { messageId, channelId }
    message_edited       full updated message object
    reaction_added       { messageId, channelId, userId, emoji, id }
    reaction_removed     { messageId, channelId, userId, emoji }
    user_status_change   { userId, status }
    user_typing          { userId, username, channelId }
    user_stop_typing     { channelId }
    new_dm               { conversationId, message }
    user_joined_channel  { userId, username, channelId }

Token: JWT stored in localStorage key 'token'
User:  JSON stored in localStorage key 'user'
Socket auth: io('/', { auth: { token } })

══════════════════════════════════════════════════════════════════
SCAFFOLD COMMANDS — run in order
══════════════════════════════════════════════════════════════════

cd rapid-relay
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios socket.io-client zustand react-router-dom
npm install lucide-react date-fns react-hot-toast emoji-picker-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

══════════════════════════════════════════════════════════════════
FILE LIST — create every file below, complete, no TODOs
══════════════════════════════════════════════════════════════════

CONFIG FILES:
  frontend/tailwind.config.js      → full config from STYLE.md section 8
  frontend/src/index.css           → full CSS from STYLE.md section 9
  frontend/vite.config.js          → proxy /api and /socket.io to :5000
  frontend/.env                    → VITE_API_URL=http://localhost:5000

API LAYER:
  frontend/src/api/axios.js
    - baseURL: '/api'
    - request interceptor: attach Bearer token from localStorage
    - response interceptor: 401 → clear storage → redirect /login

  frontend/src/api/auth.js
    - login(email, password)     → POST /auth/login
    - register(user,email,pass)  → POST /auth/register
    - getMe()                    → GET /auth/me

  frontend/src/api/channels.js
    - getChannels()
    - createChannel(name, desc)
    - getChannelMessages(id, offset=0)
    - markChannelRead(id)

  frontend/src/api/messages.js
    - sendMessage(channel_id, content, parent_id=null)
    - editMessage(id, content)
    - deleteMessage(id)
    - getReplies(id)

  frontend/src/api/reactions.js
    - addReaction(message_id, emoji)
    - removeReaction(message_id, emoji)

  frontend/src/api/users.js
    - getAllUsers()
    - getUserById(id)
    - updateUser(id, fields)
    - updateStatus(id, status)

  frontend/src/api/dms.js
    - getOrCreateConversation(userId)
    - getDMMessages(conversationId)
    - sendDMMessage(conversation_id, content, receiver_id)

  frontend/src/api/search.js
    - searchMessages(q, channel_id=null)

SOCKET SERVICE:
  frontend/src/services/socket.js
    - connectSocket(token): creates io('/', {auth:{token},
        transports:['websocket'], reconnection:true})
    - disconnectSocket()
    - getSocket(): returns socket instance

ZUSTAND STORES:
  frontend/src/store/authStore.js
    State: user, token, isAuthenticated
    Hydrate from localStorage on init
    Actions: setAuth(user,token), logout(), updateUser(u)

  frontend/src/store/channelStore.js
    State: channels[], activeChannelId, unreadCounts{}
    Actions: setChannels, setActiveChannel, addChannel,
             incrementUnread, clearUnread

  frontend/src/store/messageStore.js
    State: messages{}, threads{}, activeThread
    Actions: setMessages, addMessage, deleteMessage,
             editMessage, addReaction, removeReaction,
             setThreadMessages, addThreadMessage,
             setActiveThread, clearActiveThread

  frontend/src/store/userStore.js
    State: users[], onlineUsers{}
    Actions: setUsers, updateUserStatus

  frontend/src/store/dmStore.js
    State: conversations[], activeConversation, dmMessages{}
    Actions: setConversations, setActiveConversation,
             setDMMessages, addDMMessage

CUSTOM HOOKS:
  frontend/src/hooks/useSocket.js
    Register ALL socket event listeners.
    Return { typingUsers }
    Handle: new_message, message_deleted, message_edited,
            reaction_added, reaction_removed, user_status_change,
            new_dm, user_typing, user_stop_typing

  frontend/src/hooks/useMessages.js
    Fetch messages for channelId on change.
    Return { messages, loading }

  frontend/src/hooks/useAuth.js
    loginUser, registerUser, logoutUser
    Connect/disconnect socket on auth change.

PAGES:
  frontend/src/pages/Login.jsx
    Design: STYLE.md section 5.1
    - Centered card on full dark screen
    - Logo icon + "Nexus" text
    - Email input, Password input with Eye/EyeOff toggle
    - Error message in #e8502a
    - "Log In" button full width
    - Link to /register
    - No <form> tags — use div + onClick

  frontend/src/pages/Register.jsx
    Design: STYLE.md section 5.2
    - Top navbar with logo
    - Centered card
    - Username (User icon), Email (Mail icon),
      Password (Lock icon + Eye toggle) inputs
    - "Create Account" button
    - Link to /login
    - Footer copyright line
    - No <form> tags

  frontend/src/pages/Workspace.jsx
    Protected route — redirect to /login if !isAuthenticated
    Layout: flex row, h-screen, overflow-hidden
    On mount: connectSocket, fetchChannels, fetchUsers
    Call useSocket() here to register all listeners
    Render: <Sidebar /> + <ChatArea /> or <DMArea />
            + optional thread/details panel

  frontend/src/pages/NotFound.jsx
    Centered 404 message, link back to /

SIDEBAR COMPONENTS:
  frontend/src/components/sidebar/Sidebar.jsx
    Design: STYLE.md section 5.3
    Full sidebar with workspace header, channels section,
    DMs section, user bar at bottom.

  frontend/src/components/sidebar/ChannelList.jsx
    Design: STYLE.md section 5.3 channel items
    Map channels, show active state, unread badges.
    On click: setActiveChannel, join_channel socket,
              clearUnread, markChannelRead, clearActiveThread

  frontend/src/components/sidebar/DMList.jsx
    Design: STYLE.md section 5.3 DM items
    List users (exclude self), status dots, on click open DM.

  frontend/src/components/sidebar/CreateChannelModal.jsx
    Design: STYLE.md section 5.9
    Hash-prefixed input, description textarea,
    Cancel/Create buttons. On create: API call → addChannel
    → setActiveChannel → close.

  frontend/src/components/sidebar/UserPickerModal.jsx
    Modal listing all users except self.
    Search filter input.
    Click → getOrCreateConversation → setActiveConversation
    → setActiveChannel(null) → close.

CHAT COMPONENTS:
  frontend/src/components/chat/ChatArea.jsx
    Design: STYLE.md section 6
    flex row: chat column (flex-1) + ThreadPanel (if activeThread)
    ChatHeader + MessageList + TypingIndicator + MessageInput

  frontend/src/components/chat/ChatHeader.jsx
    Design: STYLE.md section 5.4
    Channel name, description, right-side icon buttons.
    Search icon toggles SearchBar overlay.

  frontend/src/components/chat/MessageList.jsx
    Design: STYLE.md section 5.5
    Auto-scroll to bottom on new messages.
    Date dividers between groups.
    Loading skeleton (5 gray bars).
    Empty state text.
    "Load earlier messages" button at top (pagination).
    Render MessageItem for each message.

  frontend/src/components/chat/MessageItem.jsx
    Design: STYLE.md section 5.5
    - message-group class for hover toolbar visibility
    - Avatar + username + timestamp + content
    - (edited) label
    - Deleted state
    - Hover toolbar: react, reply, edit (own), delete (own)
    - Inline edit mode (textarea + save/cancel)
    - ReactionBar below content

  frontend/src/components/chat/ReactionBar.jsx
    Design: STYLE.md section 5.5 reaction pills
    Group by emoji, show count, highlight own reactions.
    Click to toggle add/remove reaction.
    Optimistic UI update before API call.

  frontend/src/components/chat/MessageInput.jsx
    Design: STYLE.md section 5.6
    - Input box with textarea + bottom toolbar INSIDE the box
    - Emoji picker (emoji-picker-react) toggled by Smile icon
    - Enter to send, Shift+Enter for newline
    - Typing events: emit typing_start on first keystroke,
      debounce 1500ms for typing_stop
    - Send button disabled when content empty

  frontend/src/components/chat/ThreadPanel.jsx
    Design: STYLE.md section 5.7
    - w-80 right panel, border-l
    - Parent message condensed at top
    - "N replies" divider
    - Scrollable reply list
    - MessageInput at bottom with parent_id

  frontend/src/components/chat/TypingIndicator.jsx
    Design: STYLE.md section 7 (bouncing dots)
    Show "[username] is typing..." with 3 animated dots.
    Read from useSocket typingUsers[channelId].

  frontend/src/components/chat/WelcomeScreen.jsx
    Centered empty state when no channel or DM selected.

DM COMPONENTS:
  frontend/src/components/dm/DMArea.jsx
    Same layout as ChatArea but for DMs.
    Header shows other user's name + status dot + Info icon.
    Info icon toggles DMDetailsPanel.
    On mount: fetch getDMMessages.
    Listen to new_dm socket event.

  frontend/src/components/dm/DMDetailsPanel.jsx
    Design: STYLE.md section 5.8
    - User avatar (lg) + display_name + status + bio
    - Info rows: username, member since
    - Shared files section (3 placeholder file items)
      with FileText icons in red bg

SEARCH:
  frontend/src/components/ui/SearchBar.jsx
    Design: STYLE.md section 5.10
    - Dropdown overlay from chat header
    - Debounced 400ms search
    - Results: channel badge + sender + timestamp + content
    - Keyword highlighting with highlightMatch() function:
        Split text by query (RegExp case-insensitive)
        Wrap matches in <mark> with accent bg styling
    - Click result: setActiveChannel(result.channel_id), close

UI PRIMITIVES:
  frontend/src/components/ui/UserAvatar.jsx
    Design: STYLE.md section 5.11
    Props: user, size(sm/md/lg), showStatus(bool)
    Image or initials fallback. Status dot overlay.

  frontend/src/components/ui/Modal.jsx
    Overlay + centered box. Close on Escape + overlay click.
    Props: isOpen, onClose, title, children

  frontend/src/components/profile/UserProfileModal.jsx
    Inside Modal. Fields: avatar_url, display_name, bio, status.
    Live avatar preview. Save → updateUser + updateStatus APIs.
    Success toast on save.

APP ENTRY:
  frontend/src/App.jsx
    BrowserRouter + Routes:
      /login    → Login
      /register → Register
      /         → ProtectedRoute → Workspace
      *         → NotFound
    ProtectedRoute: checks isAuthenticated, redirects to /login
    <Toaster position="top-right" /> from react-hot-toast

  frontend/src/main.jsx
    Standard Vite React entry point.

══════════════════════════════════════════════════════════════════
STRICT RULES — never violate these
══════════════════════════════════════════════════════════════════

COLORS:
  Never use white backgrounds anywhere in the app.
  Never use Tailwind's default blue (blue-500/blue-600).
  Always use exact hex values from STYLE.md section 2.
  Use bg-[#hex] syntax for custom colors not in tailwind config.

LAYOUT:
  Never allow page-level scroll — all scroll happens inside
  message lists only.
  Three-column layout must be visible simultaneously when
  thread or DM details panel is open.
  Sidebar always 260px, never collapses on desktop.

FORMS:
  Never use HTML <form> tags — use div + onClick handlers.
  Never use localStorage for anything except 'token' and 'user'.

STATE:
  Never use React Context for global state — Zustand only.
  Never use class components — functional + hooks only.
  Never use Redux.

SOCKETS:
  Always check socket exists before emitting:
    const socket = getSocket()
    if (socket) socket.emit(...)
  Always clean up socket listeners in useEffect return.

API:
  All API calls inside try/catch blocks.
  Never return or display password_hash.
  Always parse URL param IDs with parseInt() before SQL use.

FEEDBACK:
  All success and error feedback via react-hot-toast only.
  No browser alert() or confirm() — use inline UI instead.
  Confirm before delete: inline "Are you sure?" UI, not browser dialog.

ACCESSIBILITY:
  All icon-only buttons must have title or aria-label attribute.
  Inputs must have associated labels.

══════════════════════════════════════════════════════════════════
10-STEP VERIFICATION CHECKLIST
══════════════════════════════════════════════════════════════════

After npm run dev, manually verify:

1. http://localhost:5173 redirects to /login
   Login page matches STYLE.md 5.1 exactly:
   ✓ Dark centered card, logo, fields, eye toggle, error state

2. Register page matches STYLE.md 5.2:
   ✓ Navbar, icon-prefixed inputs, footer copyright

3. Register new user → redirects to workspace:
   ✓ Sidebar shows 4 channels, DM list shows other users

4. Click #general:
   ✓ Channel highlighted bg-[#1164a3]
   ✓ Messages load with avatars, timestamps, display_name
   ✓ Date dividers appear

5. Type message + Enter:
   ✓ Appears instantly (no refresh)
   ✓ Open second browser as alice → message appears live

6. Hover message:
   ✓ Toolbar appears (react/reply/edit/delete)
   ✓ Click emoji → picker opens → reaction pill appears
   ✓ Second browser sees reaction live

7. Click Reply on a message:
   ✓ Thread panel opens (3-column layout)
   ✓ Parent message shown at top
   ✓ Type reply → appears in thread

8. Click user in DM section:
   ✓ DM area opens, send message works
   ✓ Click Info icon → Details panel slides in
   ✓ Shows avatar, name, bio, shared files section

9. Create channel modal:
   ✓ # prefix on name input
   ✓ Channel appears in sidebar after creation

10. Search:
    ✓ Search bar opens from header icon
    ✓ Results show channel badge + keyword highlighted
    ✓ Click result navigates to that channel

══════════════════════════════════════════════════════════════════
START COMMAND
══════════════════════════════════════════════════════════════════

cd rapid-relay/frontend && npm run dev
# App at http://localhost:5173
# Backend must be running at http://localhost:5000
```

---

*End of STYLE.md*
*Version: 1.0 | Project: Nexus*
*This file is the single source of truth for all frontend design decisions.*