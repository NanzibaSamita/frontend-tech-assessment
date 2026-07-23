# Frontend Tech Associate – Take-Home Assessment

A responsive e-commerce and task-management application built with React, TypeScript, Vite, React Router, Axios, and Context API.

The application includes a public product catalog, persistent shopping cart, checkout flow, returning-customer identification, administrator authentication, product management, order management, and task CRUD operations.

---

## Features

### Public Product Catalog

- Retrieves products from the provided REST API
- API-driven pagination
- Displays a maximum of 20 products per page
- Displays product image, name, price, and stock quantity
- Loading, error, empty, and image-fallback states
- Add-to-cart functionality
- Prevents adding quantities above available stock

### Shopping Cart

- Add products to the cart
- Increase or decrease product quantities
- Remove products
- Display total item count
- Display cart subtotal
- Cart contents persist after browser refresh
- Prevents ordering more than the available product stock

### Checkout and Orders

- Collects customer name, email, phone number, and address
- Places orders through the provided API
- Preserves the cart when the checkout API fails
- Clears the cart only after a successful order
- Displays success and failure feedback

The order API intentionally fails approximately 50% of the time with a `500` response. This is handled by preserving the cart and allowing the customer to retry.

### Returning Customer Identification

A returning customer is identified automatically after successfully placing an order.

- No customer login or additional identification is requested
- New visitors are shown as `New Customer`
- After a successful order, they are shown as `Returning Customer`
- Customer status persists across browser refreshes and future visits

### Authentication

- Administrator login
- Authentication state management
- Access-token and refresh-token handling
- Automatic token refresh
- Protected administrator routes
- Logout functionality
- Redirects unauthenticated users to the login page

### Admin Product Management

Authenticated administrators can:

- View paginated products
- Create products
- Update products
- Delete products
- View product stock information
- Confirm deletion through a confirmation dialog

### Admin Order Management

Authenticated administrators can:

- View all customer orders
- View individual order details
- View customer information
- View purchased product IDs
- View purchased quantities
- View returning-customer status
- View order creation dates

### Task Management

- View all tasks
- Create tasks
- Update tasks
- Delete tasks
- Manage task title, description, status, and due date
- Loading, empty, success, and error states

### Responsive Design

The application is designed for:

- Desktop
- Laptop
- Tablet
- Mobile devices

Admin tables support horizontal scrolling on smaller screens.

---

## Technology Stack

- React
- TypeScript
- Vite
- React Router
- Axios
- Context API
- CSS
- REST API
- Local Storage
- ESLint
- Git

---

## Project Structure

```text
src/
├── api/
│   ├── authService.ts
│   ├── httpClients.ts
│   ├── orderService.ts
│   ├── productService.ts
│   ├── setupInterceptors.ts
│   └── taskService.ts
│
├── auth/
│   ├── AuthContext.tsx
│   ├── AuthProvider.tsx
│   └── useAuth.ts
│
├── cart/
│   ├── CartContext.ts
│   ├── CartProvider.tsx
│   └── useCart.ts
│
├── components/
│   ├── ConfirmDialog.tsx
│   ├── ErrorState.tsx
│   ├── LoadingState.tsx
│   ├── OrderDetailsDialog.tsx
│   ├── Pagination.tsx
│   ├── ProductCard.tsx
│   ├── ProductForm.tsx
│   └── ProductImage.tsx
│
├── customer/
│   ├── CustomerContext.ts
│   ├── CustomerProvider.tsx
│   └── useCustomer.ts
│
├── layouts/
│   ├── AdminLayout.tsx
│   └── PublicLayout.tsx
│
├── pages/
│   ├── CartPage.tsx
│   ├── LoginPage.tsx
│   ├── ProductsPage.tsx
│   ├── TasksPage.tsx
│   └── admin/
│       ├── AdminOrdersPage.tsx
│       └── AdminProductsPage.tsx
│
├── types/
│   ├── auth.ts
│   ├── cart.ts
│   ├── order.ts
│   ├── product.ts
│   └── task.ts
│
├── utils/
│   ├── apiError.ts
│   ├── cartStorage.ts
│   ├── currency.ts
│   ├── customerStorage.ts
│   └── tokenStorage.ts
│
├── App.tsx
├── main.tsx
└── styles.css 