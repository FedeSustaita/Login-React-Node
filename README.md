🏪 Inventory and Sales System

Full-stack inventory and sales system with a Node.js/Express/MongoDB backend and React/Vite frontend.
It manages products, users, sales, and purchases, with metrics for stock and transaction history.


✨ Key Features

    🖥️ Backend:

        📦 CRUD operations for products

        👤 User management

        💰 Record movements (sales and purchases)

        🗄️ MongoDB Atlas connection

        📜 Logging with morgan

        🔒 Security with CORS and environment variables (dotenv)

    🌐 Frontend:

        🔑 Login and Logout with basic authentication

        📊 Dashboard showing:

        📦 Total products

        💵 Total sales

        📅 Weekly sales

        ⚠️ Low stock

        🔝 Top-selling products

        🕒 Last 5 sales

        ⚡ Quick sales and purchases

        📝 Transaction history view

        🧭 Navigation with React Router

        🎨 FontAwesome icons

📁 Project Structure

    Backend:

        routes/

            productos.js

            usuarios.js

            movimientos.js

        models/

            Producto.js

            Usuario.js

            Movimiento.js

        index.js (main server file)

        .env (environment variables, do not commit)

    Frontend:

        src/pages/

        Home.jsx

        Productos.jsx

        Movimientos.jsx

        AuthContext.jsx

        api.js (Axios with baseURL)

    App.jsx

    main.jsx

    vite.config.js

🛠️ Technologies Used

    Backend: Node.js, Express, MongoDB, Mongoose, dotenv, cors, morgan, Axios

    Frontend: React, Vite, React Router DOM, Axios, FontAwesome Icons

    Deployment: Render (backend), any frontend host (Vercel, Netlify)


⚡ Installation

    Backend:
        1️⃣ Go to backend folder: cd backend
        2️⃣ Install packages: npm install
        3️⃣ Create a .env file:

        PORT=3000
        MONGO_URI=YOUR_MONGODB_URI
        4️⃣ Start the server:
            npm start
            # or with nodemon
            npx nodemon index.js
    Frontend:
        1️⃣ Go to frontend folder: cd frontend
        2️⃣ Install packages: npm install
        3️⃣ Start the app: npm run dev

        Make sure the backend is running and connected to MongoDB. The frontend runs at http://localhost:5173.

🚀 Main Endpoints

    Products:

        GET /productos → List all products

        GET /productos/:id → Get a single product

        POST /productos → Create a product

        PUT /productos/:id → Update a product

        DELETE /productos/:id → Delete a product

    Users:

        GET /usuarios → List users

        POST /usuarios → Create user

    Movements:

        GET /movimientos/:listado → List movements by list

        POST /movimientos → Register sale or purchase


🌟 Frontend Features

    📊 Dashboard shows metrics for products, sales, and stock

    ⚠️ Lists low stock and top-selling products

    ⚡ Quick actions: sale and purchase

    🕒 History: last 5 sales with date and quantity

    🔑 Authentication: login/logout and saves idDeListado in localStorage

    🎨 FontAwesome icons (faHome, faArrowTrendUp, faBoxOpen, etc.)

🛡️ Security

    🔒 Sensitive variables stored in .env

    🌐 CORS enabled

    📜 Logging with morgan

    🔑 Frontend and backend separated → simple authentication

🌐 Deployment

    Backend: Render Web Service with Auto Deploy from GitHub

    Frontend: any React hosting service (Netlify, Vercel)

    ⚠️ Configure Axios baseURL to point to the deployed backend


💡 Tips & Best Practices

    🔄 Always pull before pushing:

    git pull origin main


    ❌ Add a .gitignore:

    node_modules/
    .env
    /dist


    📈 Check Render logs if deployment fails

    🎨 Use FontAwesome React for consistent and thin icons