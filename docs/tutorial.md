# Getting started with Volqan

This takes you from a clean clone to a running admin panel with your own content
type, an entry in it, a page you built in the visual builder, an uploaded image, a
theme and an extension. Give it about twenty minutes, most of it spent on
`pnpm install`.

Volqan works in two modes at once. You can define things in TypeScript, or you can
click through the admin panel. Both write to the same database, so you can start
visual and drop into code later, or go the other way.

A note before you begin. Every claim in this guide was checked against the code in
`packages/admin` and `packages/core` for this release. Where a screen shows sample data
or doesn't do what its label suggests, the guide says so. Where the admin form is the
easy route, you'll get the form. Where the API is the only route, you'll get a
`fetch` call you can paste into the browser console.

## Before you start

You need:

- Node.js 22 or newer
- pnpm 9 or newer
- PostgreSQL. The Prisma schema is pinned to `postgresql`, so other databases won't
  work with this release.

## 1. Get it running

Clone the repo and install dependencies.

```bash
git clone https://github.com/ReadyPixels/volqan.git my-project
cd my-project
pnpm install
```

The admin app reads its environment from `packages/admin/.env`, and the Prisma CLI
reads from `packages/core/.env`. The root `.env.example` says to copy it to `.env`, but
a root `.env` isn't read by either package, so copy it to both places:

```bash
cp .env.example packages/admin/.env
cp .env.example packages/core/.env
```

Open both copies and set `DATABASE_URL` to your Postgres connection string. The
example points at `postgresql://postgres:postgres@localhost:5432/volqan?schema=public`.
Change the user, password and database name to match yours. In the admin copy, set
`SESSION_SECRET` to a long random string too. Everything else can stay as it is.

Generate the Prisma client and apply the migrations:

```bash
pnpm --filter @volqan/core exec prisma generate
pnpm --filter @volqan/core exec prisma migrate deploy
```

Now start the dev server:

```bash
pnpm dev
```

That runs `dev` in every package at once. The admin panel is `next dev --port 3001`,
so open http://localhost:3001. Any page other than the sign-in and install screens
needs a session cookie, so with no cookie you're sent to `/login`. The sign-in page
then asks `/api/install/status` whether a user exists yet, and if none does it sends
you on to `/install`.

## 2. Create your admin account

The installer page is titled "Set up Volqan", with "Create your admin account to get
started" under it. Above the form is a status line. It reads "Checking database
connection…" for a moment and then either "Database connected" or "Database
unreachable" with a hint to check `DATABASE_URL`. If it's unreachable, fix the value
in `packages/admin/.env`, restart the dev server and press the "Retry" link on the
status line.

The form has five fields:

- **Site name**, prefilled with "My Volqan Site"
- **Language**, a dropdown with English and Arabic
- **Your name**, optional
- **Email**
- **Password**, 8 to 72 characters. The API rejects anything outside that range.

The submit button reads "Create account & finish setup". It stays greyed out until
the database check passes and you've filled in site name, email and password. While
it works it reads "Setting up…".

Press it once. In a single transaction Volqan creates an installation record, your
user with the `SUPER_ADMIN` role, and a set of default settings: site name, locale,
registration switched off, email verification off, a 50 MB media limit setting and
an allowed MIME list. Then it signs you in with a session cookie that lasts seven days
and sends you to the dashboard.

You'll see this screen once. After the first user exists, `/install` sends you
straight to the sign-in page, and the API behind it answers `409` with "This Volqan
instance is already set up." to any further attempts.

## 3. Sign in

![Volqan sign-in screen with email and password fields, a Forgot password link, and Continue with Google and Continue with GitHub buttons](images/admin-login.png)

To sign out, open the user menu at the top right (your initials and name) and press
"Sign out". To sign back in, go to http://localhost:3001/login. The page is titled
"Volqan Admin" with "Sign in to your workspace" under it.

Enter your email and password and press "Sign in". The button is disabled until both
fields have something in them. The eye icon inside the password field shows or hides
what you've typed. A wrong pair shows "Invalid email or password." in a red box above
the button. Ten failed attempts from one IP inside fifteen minutes gets you "Too many
login attempts. Please try again later." Wait it out.

Under the "or" divider there are two buttons, "Continue with Google" and "Continue
with GitHub". They only work once you've set `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET`, or `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`, in
`packages/admin/.env`. Without those, the button lands on a JSON page that says the
provider is not configured (a `503`).

After you sign in, Volqan takes you back to whatever page you were trying to reach
(it's carried in the `from` query parameter), or to the dashboard if you came in
cold.

## 4. Look around the dashboard

![Volqan dashboard with four stat cards for content entries, media files, extensions and users, a content chart, recent entries, an activity feed, quick actions, storage usage and system health](images/admin-dashboard.png)

The heading reads "Welcome back, Admin" whatever your name is. The left sidebar has
three groups:

- **Workspace**: Dashboard, Content (with "Content Types" and "All Entries" under
  it), Pages, Media.
- **Platform**: Extensions, Themes, Users, Analytics, AI Assistant.
- **Account**: Billing, Settings, and an external link to Bazarix.

The four cards across the top are Content Entries, Media Files, Extensions and Users.
They're live counts from your database, so on a fresh install you'll see 0, 0, 0
and 1. Three of them carry a trend badge that compares the last seven days with the
seven before. It shows a dash rather than a percentage when there's nothing earlier
to compare against, so expect dashes for the first week. The Extensions card counts
only enabled extensions and has no trend.

Below the cards:

- **Recent Content** lists the five most recently updated content entries, with the
  type, author, a status badge and the date.
- **Recent Activity** shows the last ten audit log rows. Creating, updating and
  deleting content writes to that log, so it fills up as you go.
- **Storage Usage** sums media file sizes by category: Images, Videos, Documents,
  Audio.
- **Quick Actions** are shortcuts: New Content, New Page, Upload Media, Install
  Extension, Manage Content Types, Settings.
- The **Content Activity** chart plots real content entries created per day over
  the last 30 days, pulled straight from the database. On an empty install it'll
  show a flat line at zero instead of guessing.
- **System Health** runs real checks: a database query with its latency, whether
  a Redis cache is connected (or falls back to an in-process cache when
  `REDIS_URL` isn't set), and how many of your installed extensions are enabled.

## 5. Model your content

![Volqan content screen listing content types as cards with field and entry counts](images/admin-content.png)

A content type is a shape: a name, a URL slug and a list of fields. Once one exists,
Volqan gives you an entry list and an editor for it under Content, plus REST routes at
`/api/content/<slug>`.

Click "Content" in the sidebar. The heading reads "Content" with "0 content types"
under it, and two buttons top right, "Manage Types" and "New Type". On a fresh install
the body says "No content types yet" with a "Create Content Type" button.

Press "New Type" (or "Create Content Type", same place). The page is "New Content
Type". Fill in "Type Name" with `Article`. As you type, an "API slug" badge under the
field shows the slug you'll get, `article`. The Fields card starts with two rows,
`title` (Text, required) and `slug` (Slug). Each row has a name box, a type dropdown,
an optional description box and a "Required" checkbox. The dashed buttons under the
rows add a field of that type. Add a Rich Text field and name it `content`, and a
Datetime field named `publishedAt`. Press "Create Type" in the top right. You land on
the empty entry list for the new type at `/content/article`.

Two things to know about the name `content`. The type's fields are stored exactly as
you define them, and `POST /api/content/article` validates against them. But the
entry editor screen in this release draws a fixed set of inputs, Title, Slug, Content
and Status, whatever the type says. Naming your rich text field `content` means the
editor and the type line up.

The form posts to `POST /api/content/types`, which is also what you'd call from code.
You need the `ADMIN` or `SUPER_ADMIN` role. Editors and viewers get a `403`. If the
slug is already taken, the form shows the route's generic "Internal server error"
banner rather than anything friendlier.

Click "Content" in the sidebar and an "Article" card is there, with `/article` under
the name, an "active" badge, "0 entries" and "4 fields". The entries number stays at
0 in this release, because the list endpoint doesn't return that count yet. Hover the
card and a "Browse" link appears. Click it to get back to `/content/article`, the
entry list.

The list is headed "Article" with "0 entries", a "New Article" button top right, a
stats bar (Published, Draft, Scheduled, Archived) and the empty state "No article
entries yet" with a "New entry" button. Press either button. The page is "New
Article" and the form is built from the type's real fields, so you get Title, Slug,
Content and Published at. The Publishing card on the right tells you "New entries of
this type are published as soon as you save." Fill in the title, leave the slug blank
and press "Save" (there's one in the header and one in the Publishing card). You land
in the editor for the new entry.

Behind the form is `POST /api/content/article`, with the field values sent flat. The
slug fills itself from the title if you leave it out, so "Hello from Volqan" becomes
`hello-from-volqan`. New entries go in as `PUBLISHED` with a `publishedAt` stamp,
unless the type was created with `settings: { draftable: true }`, in which case they
start as `DRAFT`. The form checks required fields before it sends anything. If the
server still rejects the entry, it answers `422` with "Content validation failed" and
no per-field detail, and that's the message the banner shows.

Go back to `/content/article`. The entry shows up in a table with Title, Status (a
lowercase `published` badge) and Updated columns. Hover the row for a pencil (edit)
and a trash (delete) icon. The pencil opens the editor, headed "Edit Article" with the
entry ID under it. There's a Content card with Title, Slug and Content, and a
Publishing card with a Status dropdown (Draft, Published, Archived) and an "Update"
button. "Save changes" in the top right does the same as "Update". Both need Title
and Slug filled in and show "Changes saved." above the form on success.

One catch. The Status dropdown is stored with the entry's field data, but the API's
update path only writes field data. It never touches the real status column. So
picking "Draft" here won't turn the badge in the list to draft. Deleting works: the
trash button opens a dialog that says the entry "will be permanently deleted. This
cannot be undone."

"Content Types" in the sidebar (also the "Manage Types" button) opens `/content/types`,
a second view of the same types with each one's field list and a trash icon. Deleting
a type asks first, in a "Delete content type" dialog. There's no edit screen for a
type in this release, so to change fields you delete and recreate it.

Other field types you can use in a type: `NUMBER`, `BOOLEAN`, `DATE`, `EMAIL`, `URL`,
`IMAGE`, `FILE`, `JSON`, `SELECT`, `MULTISELECT`, `COLOR`, `RELATION`, `PASSWORD`.

## 6. Build a page visually

![Volqan pages list with counts for total, published, drafts and scheduled pages](images/admin-pages.png)

Read this first: pages live in server memory in this release. The page repository in
`packages/core/src/pages/repository.ts` is a `Map`, not a database table. Every page
you make disappears when the dev server restarts, and in dev mode also whenever Next
recompiles a route (the first time you open a screen you haven't visited yet, or
after any file edit). Treat this step as a tour of the builder, not a place to keep
work.

Click "Pages" in the sidebar. The page has four counters (Total Pages, Published,
Drafts, Scheduled) and an "All Pages" card that says "Click a page to open the visual
builder". On a fresh install it reads "No pages yet".

Press "New Page". The form is titled "Create New Page" and has Page Title, URL Slug
(it fills itself from the title, lowercase letters, numbers and hyphens only) and a
Template dropdown (Blank page, Landing page, Content page, Contact page). The button
stays disabled until title and slug are filled. Type `About us` and press "Start
Building →". It reads "Creating page…" for a moment, posts the page to
`POST /api/pages` and opens it in the builder.

The page starts as a draft with no blocks. If you go back to "Pages", the row shows
the title, a "Draft" badge, the slug and "0 blocks". Hover the row and click the
pencil ("Edit page") to get back into the builder.

![Volqan page builder with a block palette on the left, the page canvas in the centre, and a settings panel on the right](images/admin-page-builder.png)

The builder fills the screen. It has a toolbar and three columns:

- **Toolbar.** Page title and slug on the left, then undo and redo (⌘Z and ⌘Y), then
  the block count. On the right are four buttons. "SEO" opens a strip with SEO
  Title, OG Image URL and Meta Description. Then "Preview", "Save" and a green
  "Publish".
- **Left column.** The block palette, with a "Search blocks..." box and category
  tabs: Layout, Content, Data, Forms, Navigation, Media, Advanced. Layout holds
  Section, Container, the 2, 3 and 4 Column Grids, Spacer and Divider. Content holds
  Heading, Paragraph, Rich Text, Image, Video, Button and more.
- **Centre.** The canvas, with desktop, tablet and phone width toggles above it. It
  reads "Drag a block from the palette or click a block to add it" until you add
  one. Click a placed block to select it. A selected block gets a label tab and
  "Duplicate" and "Delete" buttons, and you can drag it to reorder.
- **Right column.** Settings for the selected block. With nothing selected it says
  "No block selected" and "Click a block in the canvas to edit its settings".

Add a Heading and a Paragraph, click the heading and change its text in the right
column, then press "Save". The button turns green and reads "Saved" for a moment.
That sends your blocks and SEO fields to `PATCH /api/pages/<id>`. "Publish" sends
`status: "published"` the same way. Back in the list the row picks up a green
"Published" badge and a "View live page" eye icon. That icon links to the slug as a
relative URL, and nothing in this release renders pages at that address, so expect a
404 there.

## 7. Add media

![Volqan media library with an upload dropzone at the top and uploaded files in a grid](images/admin-media.png)

Click "Media" in the sidebar. The heading is "Media Library" with "0 files · 0 KB
total" under it, and grid and list view toggles on the right. The dashed box below
says "Drop files here, or click to browse". Drop a JPEG or PNG on it, or click and
pick one. While it uploads the box reads "Uploading…", then a line above it says
"1 file(s) uploaded." and the file appears in the grid with its name and size.

The box also says "JPG, PNG, GIF, MP4, PDF up to 100MB". That's not the real limit.
The server checks each file before it writes anything:

- **Size.** Anything over 10 MB is refused with "File exceeds the 10 MB size limit."
- **Extension.** `.html`, `.htm`, `.svg`, `.xml`, `.mhtml` and `.xhtml` are refused
  as "Unsupported file type." because a browser would run them. The known-good list
  is `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`, `.mp4`, `.mov`, `.webm`,
  `.mp3`, `.wav` and `.pdf`.
- **Content.** Volqan reads the first bytes and checks they match the extension. A
  `.png` that doesn't start with the PNG header gets "File content does not match
  the declared type."

The library doesn't show you those messages, though. A refused file just counts in
"1 of 1 file(s) failed to upload." If you want the reason, open the browser's
network tab and read the response.

Files land under `VOLQAN_UPLOAD_DIR` (default `./public/uploads`, relative to
`packages/admin`) with a random UUID filename, and are served from `/uploads/...`.
Click a file to open a preview with its Size, Folder and Added date, plus "Copy URL"
and "Download" buttons. Hover a tile for the trash icon, which asks before deleting.

Users with the `VIEWER` role can't upload. Users who aren't `ADMIN` or `SUPER_ADMIN`
only see their own uploads in the list.

## 8. Install a theme

![Volqan themes page with Installed and Token Editor tabs and a Browse Themes button](images/admin-themes.png)

Click "Themes" in the sidebar. The subtitle reads "0 installed" on a fresh install.
There are two tabs, "Installed (0)" and "Token Editor", and a "Browse Themes" button
that opens the Bazarix marketplace in a new tab. The empty state says "No themes
installed" with an "Open Bazarix" button.

A theme is a record with an id, a name, a version and a flat map of design tokens.
There's no install form in the admin, so post one from the console:

```js
await fetch('/api/themes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    themeId: 'my-theme',
    name: 'My theme',
    version: '1.0.0',
    tokens: { primary: '#0f766e', accent: '#f59e0b', background: '#0b1120' },
    activate: true,
  }),
}).then((r) => r.json());
```

Reload. The card shows the first five tokens as colour dots, the name, "v1.0.0" and
`my-theme`, with an "Active" badge in the corner. The subtitle changes to "Active: My
theme - 1 installed". Cards for inactive themes have an "Activate" button. Only one
theme is active at a time, so activating one clears the flag on the rest. Posting
the same `themeId` twice gets a `409`, "Theme already installed."

To edit tokens, press the palette icon on a card and then switch to the "Token
Editor" tab (the icon picks the theme, the tab shows the editor). Or, on that tab,
press "Edit My theme Tokens". Each token gets a colour picker and a text box. "Save
Tokens" writes them back with `PATCH /api/themes/<id>`. "Cancel" throws the edits
away. Installing, activating and editing all need the `ADMIN` or `SUPER_ADMIN` role.

What a theme doesn't do yet: nothing in the admin app reads the active theme's tokens
back. Activating a theme changes a flag in the database and nothing on screen. The
[Theme API](theme-api.md) describes where that's heading.

## 9. Extend it

![Volqan extensions page with an empty state and a Browse Marketplace button](images/admin-extensions.png)

Click "Extensions" in the sidebar. The subtitle reads "0 of 0 enabled", there's a
"Browse Marketplace" button that opens Bazarix, and the empty state says "No
extensions installed". As with themes, install one from the console:

```js
await fetch('/api/extensions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ extensionId: 'hello-world', name: 'Hello world', version: '0.1.0' }),
}).then((r) => r.json());
```

Extensions install disabled. Reload and the card shows the name, `hello-world`,
"v0.1.0", a "Disabled" badge and a toggle switch. Under a divider are "Settings",
"Marketplace" and "Uninstall". Flip the switch: the badge turns to "Enabled", the
subtitle reads "1 of 1 enabled", and the dashboard's Extensions card ticks up to 1.
"Settings" has nothing behind it in this release. "Uninstall" opens a dialog that
warns the extension "and all of its data will be removed. This cannot be undone.",
then deletes the record.

Installing a record like this doesn't load any code. To write an extension that does
something, see the [Extension API](extension-api.md).

## Where to go next

- [Extension API](extension-api.md) to build your first extension
- [Theme API](theme-api.md) to build a theme
- [Developer guide](developer-guide.md) for the code-first workflow
- [GitHub Discussions](https://github.com/ReadyPixels/volqan/discussions) to ask a
  question

## Refreshing these screenshots

Run `node scripts/screenshots.mjs` from the repo root against a running dev server and
it recaptures every image on this page into `docs/images/`. It asks for your admin
email and password at the prompt and stores neither. Set `VOLQAN_SHOT_EMAIL` and
`VOLQAN_SHOT_PASSWORD` to skip the prompts. The page builder shot needs at least one
page to exist, and pages are in memory (step 6), so open the Pages screen and the
builder once to warm those routes, then create the page right before you run the
script, and don't edit any source file in between.
