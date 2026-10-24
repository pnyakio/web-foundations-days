# Library Books REST API Design

## Overview

This API manages books in a library. Each book has an ID, title, author, publication year, and ISBN.

**Base URL:** `/api/books`

## Endpoints

### 1. List all books

- **Method:** GET
- **Path:** `/api/books`
- **Description:** Returns a list of all books in the library.
- **Success status:** `200 OK`
- **Example request body:** None required.

### 2. Get one book

- **Method:** GET
- **Path:** `/api/books/{id}`
- **Description:** Returns the details of a book with the specified ID.
- **Success status:** `200 OK`
- **Example request body:** None required.

### 3. Create a book

- **Method:** POST
- **Path:** `/api/books`
- **Description:** Adds a new book to the library.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publicationYear": 1958,
  "isbn": "9780385474542"
}
```

- **Success status:** `201 Created`

### 4. Update a book

- **Method:** PUT
- **Path:** `/api/books/{id}`
- **Description:** Replaces the details of an existing book.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publicationYear": 1958,
  "isbn": "9780385474542"
}
```

- **Success status:** `200 OK`

### 5. Delete a book

- **Method:** DELETE
- **Path:** `/api/books/{id}`
- **Description:** Removes the specified book from the library.
- **Success status:** `204 No Content`
- **Example request body:** None required.

### 6. List books by author

- **Method:** GET
- **Path:** `/api/books?author=Chinua%20Achebe`
- **Description:** Returns books written by the specified author.
- **Success status:** `200 OK`
- **Example request body:** None required. The author is provided as a query parameter.

## Error Status Codes

### 400 Bad Request

Returned when the request is invalid or contains missing or incorrect data.

**Example:** A client tries to create a book without providing the required title.

### 404 Not Found

Returned when the requested book does not exist.

**Example:** A client requests `/api/books/9999`, but no book has ID `9999`.
