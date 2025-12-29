# Details

Date : 2025-12-28 18:56:18

Directory /Users/darrellparkhouse/development/beta-crm

Total : 58 files,  4442 codes, 451 comments, 779 blanks, all 5672 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.idea/beta-crm.iml](/.idea/beta-crm.iml) | XML | 11 | 0 | 0 | 11 |
| [architecture.md](/architecture.md) | Markdown | 256 | 0 | 59 | 315 |
| [backend/README.md](/backend/README.md) | Markdown | 159 | 0 | 54 | 213 |
| [backend/server.js](/backend/server.js) | JavaScript | 41 | 8 | 11 | 60 |
| [backend/src/config/database.js](/backend/src/config/database.js) | JavaScript | 56 | 8 | 11 | 75 |
| [backend/src/controllers/authController.js](/backend/src/controllers/authController.js) | JavaScript | 218 | 46 | 39 | 303 |
| [backend/src/controllers/queries.js](/backend/src/controllers/queries.js) | JavaScript | 140 | 3 | 20 | 163 |
| [backend/src/controllers/taskController.js](/backend/src/controllers/taskController.js) | JavaScript | 320 | 37 | 66 | 423 |
| [backend/src/database/migrate.js](/backend/src/database/migrate.js) | JavaScript | 130 | 21 | 26 | 177 |
| [backend/src/database/migrations/001\_create\_users\_table.sql](/backend/src/database/migrations/001_create_users_table.sql) | MS SQL | 30 | 5 | 6 | 41 |
| [backend/src/database/migrations/002\_create\_companies\_table.sql](/backend/src/database/migrations/002_create_companies_table.sql) | MS SQL | 31 | 4 | 4 | 39 |
| [backend/src/database/migrations/003\_create\_contacts\_table.sql](/backend/src/database/migrations/003_create_contacts_table.sql) | MS SQL | 41 | 4 | 4 | 49 |
| [backend/src/database/migrations/004\_create\_deals\_table.sql](/backend/src/database/migrations/004_create_deals_table.sql) | MS SQL | 35 | 4 | 4 | 43 |
| [backend/src/database/migrations/005\_create\_tasks\_table.sql](/backend/src/database/migrations/005_create_tasks_table.sql) | MS SQL | 34 | 4 | 4 | 42 |
| [backend/src/database/migrations/006\_create\_activities\_table.sql](/backend/src/database/migrations/006_create_activities_table.sql) | MS SQL | 34 | 4 | 4 | 42 |
| [backend/src/database/migrations/007\_create\_notes\_table.sql](/backend/src/database/migrations/007_create_notes_table.sql) | MS SQL | 20 | 4 | 4 | 28 |
| [backend/src/database/migrations/008\_create\_refresh\_tokens\_table.sql](/backend/src/database/migrations/008_create_refresh_tokens_table.sql) | MS SQL | 16 | 5 | 5 | 26 |
| [backend/src/database/seeds/seed.js](/backend/src/database/seeds/seed.js) | JavaScript | 109 | 11 | 17 | 137 |
| [backend/src/middleware/auth.js](/backend/src/middleware/auth.js) | JavaScript | 104 | 20 | 23 | 147 |
| [backend/src/middleware/errorHandler.js](/backend/src/middleware/errorHandler.js) | JavaScript | 21 | 4 | 4 | 29 |
| [backend/src/middleware/notFound.js](/backend/src/middleware/notFound.js) | JavaScript | 6 | 1 | 2 | 9 |
| [backend/src/models/RefreshToken.js](/backend/src/models/RefreshToken.js) | JavaScript | 73 | 40 | 12 | 125 |
| [backend/src/models/User.js](/backend/src/models/User.js) | JavaScript | 72 | 48 | 18 | 138 |
| [backend/src/models/User.ts](/backend/src/models/User.ts) | TypeScript | 37 | 0 | 3 | 40 |
| [backend/src/models/UserPermissions.ts](/backend/src/models/UserPermissions.ts) | TypeScript | 26 | 0 | 2 | 28 |
| [backend/src/routes/authRoutes.js](/backend/src/routes/authRoutes.js) | JavaScript | 11 | 30 | 8 | 49 |
| [backend/src/services/taskService.js](/backend/src/services/taskService.js) | JavaScript | 331 | 55 | 61 | 447 |
| [backend/src/utils/jwt.js](/backend/src/utils/jwt.js) | JavaScript | 91 | 32 | 15 | 138 |
| [claude.md](/claude.md) | Markdown | 49 | 0 | 22 | 71 |
| [client/calendar.html](/client/calendar.html) | HTML | 130 | 7 | 10 | 147 |
| [client/css/app.css](/client/css/app.css) | PostCSS | 538 | 2 | 19 | 559 |
| [client/dashboard-empty.html](/client/dashboard-empty.html) | HTML | 12 | 0 | 0 | 12 |
| [client/images/\[Navigation\] Web/Logo.svg](/client/images/%5BNavigation%5D%20Web/Logo.svg) | XML | 13 | 0 | 1 | 14 |
| [client/images/\[Navigation\] Web/beta-crm-logo.svg](/client/images/beta-crm-logo.svg) | XML | 13 | 0 | 1 | 14 |
| [client/images/calendar-icon.svg](/client/images/calendar-icon.svg) | XML | 3 | 0 | 1 | 4 |
| [client/images/checked.svg](/client/images/checked.svg) | XML | 4 | 0 | 1 | 5 |
| [client/images/dashboard/checklist.svg](/client/images/dashboard/checklist.svg) | XML | 3 | 0 | 1 | 4 |
| [client/images/dashboard/work.svg](/client/images/dashboard/work.svg) | XML | 3 | 0 | 1 | 4 |
| [client/images/kanban/help-center-icon.svg](/client/images/kanban/help-center-icon.svg) | XML | 3 | 0 | 1 | 4 |
| [client/images/kanban/kanban-icon.svg](/client/images/kanban/kanban-icon.svg) | XML | 3 | 0 | 1 | 4 |
| [client/images/kanban/white-ui-store-logo.svg](/client/images/kanban/white-ui-store-logo.svg) | XML | 9 | 0 | 1 | 10 |
| [client/images/unchecked.svg](/client/images/unchecked.svg) | XML | 4 | 0 | 1 | 5 |
| [client/js/calendar.js](/client/js/calendar.js) | JavaScript | 225 | 34 | 53 | 312 |
| [client/kanban-item.html](/client/kanban-item.html) | HTML | 13 | 0 | 1 | 14 |
| [client/kanban.html](/client/kanban.html) | HTML | 96 | 0 | 8 | 104 |
| [client/new-task.html](/client/new-task.html) | HTML | 90 | 0 | 2 | 92 |
| [client/post.html](/client/post.html) | HTML | 75 | 2 | 6 | 83 |
| [client/scss/\_icons.scss](/client/scss/_icons.scss) | SCSS | 38 | 0 | 8 | 46 |
| [client/scss/app.scss](/client/scss/app.scss) | SCSS | 18 | 0 | 2 | 20 |
| [client/scss/partials/\_button.scss](/client/scss/partials/_button.scss) | SCSS | 10 | 2 | 3 | 15 |
| [client/scss/partials/\_calendar.scss](/client/scss/partials/_calendar.scss) | SCSS | 430 | 5 | 78 | 513 |
| [client/scss/partials/\_form.scss](/client/scss/partials/_form.scss) | SCSS | 17 | 1 | 5 | 23 |
| [client/scss/partials/\_kanban-item.scss](/client/scss/partials/_kanban-item.scss) | SCSS | 4 | 0 | 3 | 7 |
| [client/scss/partials/\_kanban.scss](/client/scss/partials/_kanban.scss) | SCSS | 9 | 0 | 4 | 13 |
| [client/scss/partials/\_mixins.scss](/client/scss/partials/_mixins.scss) | SCSS | 24 | 0 | 4 | 28 |
| [client/scss/partials/\_task.scss](/client/scss/partials/_task.scss) | SCSS | 15 | 0 | 5 | 20 |
| [client/scss/partials/\_vars.scss](/client/scss/partials/_vars.scss) | SCSS | 33 | 0 | 7 | 40 |
| [design-system.md](/design-system.md) | Markdown | 105 | 0 | 43 | 148 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)