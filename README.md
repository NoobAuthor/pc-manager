# Project Content Manager

A modern, full-stack project management application built with **Next.js**, **Prisma**, **MongoDB**, **Tailwind CSS**, and **OpenAI** integration. Manage projects, boards, and features with real-time drag-and-drop, authentication, and AI-powered chat.

---

## 🚀 Features

- **User Authentication:** Secure login via GitHub using NextAuth.
- **Project Management:** Create, edit, and organize projects.
- **Boards & Features:** Kanban-style boards with sortable features (drag-and-drop).
- **AI Chat:** Integrated OpenAI chat for project assistance.
- **Responsive UI:** Built with Tailwind CSS for a modern look.
- **Accessible Components:** All UI components are accessible and keyboard-friendly.
- **API Routes:** RESTful API endpoints for all core resources.
- **Testing:** Unit and integration tests with Jest and React Testing Library.
- **Consistent Formatting:** Prettier and ESLint for code quality.

---

## 🏗️ Tech Stack

- **Frontend:** Next.js 15, React 18, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM, MongoDB
- **Authentication:** NextAuth.js (GitHub provider)
- **Drag & Drop:** @dnd-kit/core, @dnd-kit/sortable
- **AI Integration:** OpenAI API
- **Testing:** Jest, React Testing Library, @testing-library/jest-dom
- **Type Checking:** TypeScript

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pc-manager.git
cd pc-manager

```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a new `.env` file in the root directory and set the following:

```
DATABASE_URL=your_mongodb_connection_string
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
OPEN_API_KEY=your_openai_api_key

```

### 4. Set Up the Database

Generate the Prisma client and push the schema to your MongoDB database:

```
npx prisma generate
npx prisma db push
```

### 5. Run the Development Server

```
npm run dev
```

Visit <http://localhost:3000> in your browser.

## 🧪 Running Tests

- All tests:
  `npm test`
- Watch mode:
  `npm run test:watch`

## 📝 Key Concepts

Authentication

- Uses NextAuth.js with GitHub as the OAuth provider.
- Session includes the user's unique ID for secure resource access.
  Data Modeling
- Prisma defines models for User, Project, ProjectBoard, Feature, and AiChat.
- Relationships are enforced at the database level.
  Drag-and-Drop
- Powered by @dnd-kit for modern, accessible drag-and-drop.
- Boards and features can be reordered and moved between columns.
  AI Chat
- Integrated with OpenAI's GPT model for project-related queries.
- Chat history is stored per user.
  Testing
- Jest and React Testing Library for robust unit and integration tests.
- Custom matchers from @testing-library/jest-dom for better assertions.
  Formatting & Linting
- Prettier for code formatting.
- ESLint for code quality and best practices.

## 🛠️ Customazation

- Styling: Modify tailwind.config.ts for custom themes.
- Database: Update prisma/schema.prisma for new models or fields.
- Providers: Add more OAuth providers in src/libs/auth.ts if needed.
- AI Model: Change the OpenAI model in src/app/api/ai/route.ts.

## 🤝 Contributing

- Fork the repository
- Create a new branch (git checkout -b feature/your-feature)
- Commit your changes (git commit -am 'Add new feature')
- Push to the branch (git push origin feature/your-feature)
- Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
