# TicketHub: Ticket Sales System Design

## 1. Requirements

TicketHub is a website where users discover concerts and events, view seat availability, reserve seats, pay for tickets, and access their purchased tickets. The system must support 2 million registered users and remain reliable when a popular concert goes on sale.

### Functional requirements

1. **User accounts:** Users can register, sign in, and view their profiles.
2. **Browse events:** Users can view upcoming concerts, search for events, and filter by date or location.
3. **View seats:** Users can view a seating plan and see which seats are available, temporarily held, or sold.
4. **Hold seats:** Users can temporarily reserve available seats while completing checkout.
5. **Purchase tickets:** Users can pay for held seats and receive confirmation after successful payment.
6. **View tickets:** Users can view their confirmed purchases and access their ticket details.
7. **Manage events:** Administrators can create events, configure seats and prices, and monitor sales.

### Non-functional requirements

- **Performance:** Event listings and seating information should load within 2 seconds under normal conditions. During a major sale, the system should prioritise correctness and keep requests responsive, even if users must wait in a queue.
- **Correctness:** A seat must never be sold to two different customers. Payments and ticket confirmations must be consistent with the final order state.
- **Fairness:** Users should enter a virtual waiting room during exceptionally busy sales. Requests should be processed in queue order where practical, with rate limits to reduce automated abuse. Users must not gain an unfair advantage by repeatedly refreshing.
- **Availability:** The website should remain usable if an application server fails.
- **Security:** Users must access only their own orders and tickets. Payment details must be handled by a trusted payment provider rather than stored directly by TicketHub.
- **Scalability:** The system must scale to handle millions of registered users and sudden increases in traffic.
- **Reliability:** Failed payments, expired holds, and interrupted background jobs must be handled without creating duplicate orders or tickets.

## 2. Traffic and Capacity Estimates

The estimates below use the supplied figures. Where information is missing, assumptions are stated explicitly.

### Normal daily traffic

Given:
- Registered users: 2,000,000
- Daily visitors: 50,000
- Pages viewed per visitor: 10
- Tickets sold per day: 5,000

**Daily page views**

50,000 visitors × 10 pages = 500,000 page views per day.

**Average page requests per second**

500,000 ÷ 86,400 seconds ≈ 5.8 requests per second.

Assuming peak traffic is three times the daily average:

5.8 × 3 ≈ 17.4 page requests per second.

**Average ticket sales rate**

5,000 ÷ 86,400 ≈ 0.058 tickets per second.

This averages approximately one ticket sold every 17 seconds. Actual sales will be uneven throughout the day.

### Popular concert sale

Given:
- People attempting to buy tickets: 200,000
- Available seats: 20,000
- Time window: 10 minutes, or 600 seconds.

**Average purchase attempts per second**

200,000 ÷ 600 ≈ 333 attempts per second.

**Maximum tickets available per second, averaged across the sale**

20,000 ÷ 600 ≈ 33 tickets per second.

**Competition for seats**

200,000 people ÷ 20,000 seats = 10 people competing for every seat.

Only 10% of the people attempting to purchase can obtain a seat if all 20,000 seats are sold individually to different customers.

### Comparing normal traffic and the big sale

| Measurement | Normal day | Popular concert sale |
|---|---:|---:|
| People or visitors | 50,000 per day | 200,000 in 10 minutes |
| Average page or purchase requests | 5.8 page requests/second | 333 purchase attempts/second |
| Peak assumption | 17.4 page requests/second | At least 333 attempts/second on average |
| Tickets available or sold | 5,000 sold per day | 20,000 seats available |
| Main challenge | Efficient browsing | Traffic spikes and seat contention |

The popular sale's average purchase-attempt rate is approximately 57 times the normal daily average page-request rate. This is an indicative comparison because page views and purchase attempts are different types of requests. The actual peak may be higher if many users arrive at the same moment.

The system should therefore use a virtual waiting room, rate limiting, caching for public event information, and multiple application servers. Seat availability and checkout must still be confirmed by the database because cached information can become outdated.

## 3. API Design

TicketHub exposes a REST API using HTTP methods and JSON request and response bodies. The API requires authentication for account-specific operations.

| Method and endpoint | Purpose | Success status |
|---|---|---|
| `GET /events` | List events, with optional date, location, and search filters | 200 OK |
| `GET /events/{eventId}` | Retrieve event details | 200 OK |
| `GET /events/{eventId}/seats` | Retrieve seat labels, prices, and availability | 200 OK |
| `POST /seat-holds` | Temporarily hold selected seats for an authenticated user | 201 Created |
| `DELETE /seat-holds/{holdId}` | Release a user's active hold | 204 No Content |
| `POST /orders` | Create an order for seats covered by a valid hold | 201 Created |
| `POST /orders/{orderId}/payment` | Initiate or confirm payment through a payment provider | 200 OK |
| `GET /me/tickets` | List tickets belonging to the authenticated user | 200 OK |
| `GET /orders/{orderId}` | View an order owned by the authenticated user | 200 OK |

### Example: Holding seats

Request:

```http
POST /seat-holds
Content-Type: application/json
Authorization: Bearer <access-token>
```

```json
{
  "eventId": 42,
  "seatIds": [105, 106]
}
```

Example successful response:

```json
{
  "holdId": "hold-abc123",
  "status": "active",
  "expiresAt": "2026-11-01T10:10:00Z",
  "seats": [105, 106]
}
```

The server must atomically claim both seats or reject the request if either seat is unavailable. The expiration timestamp is illustrative; the production system would define the hold duration.

### Example: Listing events

Request:

```http
GET /events?date=2026-11-01
```

Example response:

```json
{
  "events": [
    {
      "id": 42,
      "name": "Live Music Night",
      "venue": "City Arena",
      "date": "2026-11-01",
      "status": "on_sale"
    }
  ]
}
```

### API error handling

The API should return consistent error responses.

- `400 Bad Request`: Invalid request data.
- `401 Unauthorized`: The user is not authenticated.
- `403 Forbidden`: The user lacks permission.
- `404 Not Found`: The requested event, seat, or order does not exist or is not accessible.
- `409 Conflict`: A seat is already held or sold, or the hold has expired.
- `429 Too Many Requests`: The user has exceeded a rate limit.
- `500 Internal Server Error`: An unexpected server failure occurred.

Example conflict response:

```json
{
  "error": {
    "code": "SEAT_UNAVAILABLE",
    "message": "One or more selected seats are no longer available."
  }
}
```

For payment operations, the client should supply an idempotency key so that retrying a request does not accidentally create duplicate charges or orders.

## 4. Data Model

TicketHub uses a relational database such as PostgreSQL because purchasing seats requires reliable transactions, relationships, and uniqueness constraints.

### Main tables

**Users**
- `id`: Primary key.
- `name`: User's name.
- `email`: User's unique email address.
- `password_hash`: Securely stored password hash.
- `created_at`: Account creation timestamp.

**Events**
- `id`: Primary key.
- `name`: Event name.
- `venue`: Venue name.
- `event_date`: Date and time of the event.
- `status`: Event status, such as draft, on sale, or cancelled.

**Seats**
- `id`: Primary key.
- `event_id`: Foreign key referencing `events.id`.
- `seat_label`: Seat identifier within the venue, such as A-10.
- `price`: Ticket price.
- `status`: Available, held, or sold.
- `held_by_user_id`: Nullable foreign key referencing `users.id`.
- `hold_expires_at`: Nullable timestamp indicating when a temporary hold expires.
- `order_id`: Nullable foreign key referencing `orders.id` once allocated to an order.

A unique constraint on `(event_id, seat_label)` prevents duplicate seat records for the same event.

**Orders**
- `id`: Primary key.
- `user_id`: Foreign key referencing `users.id`.
- `status`: Pending, paid, failed, cancelled, or expired.
- `total_amount`: Total amount due.
- `payment_reference`: Unique reference from the payment provider, when available.
- `created_at`: Order creation timestamp.

**Order_Items**
- `id`: Primary key.
- `order_id`: Foreign key referencing `orders.id`.
- `seat_id`: Foreign key referencing `seats.id`.
- `price_at_purchase`: Price recorded at checkout.

A unique constraint on `order_items.seat_id` ensures a seat cannot appear in multiple order items. Historical order items should be retained rather than deleted when an order fails; the seat allocation must be released safely.

### Relationships

- One user can have many orders.
- One event has many seats.
- One order contains one or more order items.
- Each order item refers to one seat.
- A seat can be temporarily held by one user at a time and allocated to at most one successful order.

### How the tables work together

When a user selects seats, the application records a temporary hold on the relevant seat rows. When payment succeeds, the application finalises the order and marks the seats as sold within a transaction. If payment fails or the hold expires, the system releases the seats only after checking that they have not already been sold or allocated to another valid order.

### Preventing two people from buying the same seat

TicketHub combines **atomic database transactions, row-level locking, conditional updates, and uniqueness constraints**.

1. When a user requests seats, the server begins a database transaction.
2. It locks the selected seat rows using `SELECT ... FOR UPDATE`, or uses an equivalent atomic conditional update.
3. It checks that every requested seat is available and that no unexpired hold or confirmed sale exists.
4. If every seat is available, it marks all selected seats as held by that user and sets the hold expiration time. If any seat is unavailable, it rejects the whole request.
5. It commits the transaction. A competing request must then recheck the updated seat state and cannot claim the same seats.
6. During checkout, the server validates the hold and creates or updates the order. After confirmed payment, it marks the seats as sold and commits the final allocation.
7. Unique constraints provide an additional database-level safeguard against duplicate seat allocation, even if application code has a bug.

The application must not keep a database transaction open while waiting for a customer to pay. Holds are short-lived, and payment processing occurs outside the seat-locking transaction. After payment is confirmed, the server finalises the order in a new transaction, verifying that the hold is still valid.

Payment confirmation should be idempotent. If the payment provider sends the same confirmation more than once, TicketHub must not create duplicate tickets or charge the customer again. If payment succeeds after a hold has expired and another customer has legitimately acquired the seat, the system must follow a defined recovery process, such as refunding the payment or offering an alternative seat.

This approach prevents double-booking because the database, rather than the browser or a cached availability display, is the final authority on seat ownership.

## 5. System Architecture

### Architecture diagram

```text
                         Customers
                             |
                             v
                    [DNS / Domain Routing]
                             |
                             v
                         [CDN / WAF]
                      /              \
                     v                v
             Static Website      [Virtual Waiting Room]
                                      |
                                      v
                              [Load Balancer]
                               /           \
                              v             v
                       [App Server 1] [App Server 2]
                               \           /
                                \         /
                                 v       v
                         [Application Services]
                          /       |        \
                         v        v         v
                    [Cache]  [Primary DB] [Message Queue]
                                |               |
                                v               v
                          [Read Replica]   [Background Workers]
```

### Component explanations

- **DNS:** Directs users to TicketHub's domain.
- **CDN:** Serves static assets such as images, stylesheets, and scripts from locations closer to users. It reduces the load on application servers.
- **Web Application Firewall (WAF):** Filters common malicious traffic and helps protect the website.
- **Virtual waiting room:** Controls the flow of users entering a high-demand sale. It issues queue positions or access tokens and limits how quickly customers reach checkout.
- **Load balancer:** Distributes incoming requests across healthy application servers.
- **Application servers:** Run the API and business logic for browsing, seat holds, orders, and checkout. They are stateless so additional servers can be added when traffic increases.
- **Cache:** Stores frequently accessed public event information and other safe-to-cache data. It must not be treated as the final authority for seat ownership.
- **Primary database:** Stores authoritative event, seat, hold, order, and payment state. Transactions and constraints protect correctness.
- **Read replica:** Handles suitable read-heavy queries, such as event browsing, reducing read pressure on the primary database. Critical seat availability and checkout decisions must use authoritative, sufficiently consistent data.
- **Message queue:** Holds asynchronous jobs such as email confirmations, analytics, and post-purchase processing.
- **Background workers:** Process queued jobs independently of the customer-facing request. Retries and dead-letter handling help recover from failures.

### Request flow: Browsing an event

1. A customer requests the TicketHub website.
2. DNS resolves the domain, and the CDN serves static website assets where possible.
3. The customer requests the event list or event details.
4. The load balancer forwards the API request to a healthy application server.
5. The application checks the cache for public event information.
6. If the information is not cached, the application reads from the appropriate database or read replica.
7. The application returns the event details to the customer.

Public event information can be cached briefly. Seat availability should be refreshed from an authoritative source when a user is about to hold seats or pay.

### Request flow: Buying a seat during a major sale

1. Customers enter the virtual waiting room. The system limits the rate at which they proceed to checkout.
2. When admitted, a customer selects seats and sends a hold request.
3. The load balancer routes the request to an application server.
4. The application opens a short database transaction and atomically claims the requested seats only if they remain available.
5. The transaction commits the hold and expiration time. If another customer already claimed a seat, the request fails with `409 Conflict`.
6. The customer proceeds to the payment provider without holding database locks open.
7. Once payment is confirmed, TicketHub verifies the hold and finalises the order and seat allocation in a database transaction.
8. The application returns the order result. It publishes a confirmation job to the message queue, and a background worker sends the ticket confirmation.
9. If the hold expires or payment fails, the system releases the seats safely, provided they have not been sold.

### Handling the big sale

The design uses several strategies to remain stable when 200,000 people attempt to buy 20,000 seats:

- **Admission control:** The virtual waiting room prevents every visitor from reaching the purchase API simultaneously.
- **Horizontal scaling:** Additional stateless application servers can be started to handle increased traffic.
- **Caching:** Event descriptions and other public data are served without repeatedly querying the primary database.
- **Database protection:** Seat allocation is transactional, and requests for the same seats are serialised by row-level locks or equivalent atomic operations.
- **Rate limiting:** Excessive requests are slowed or rejected to protect the service.
- **Asynchronous processing:** Email and other non-critical work is moved to background workers.
- **Retries and monitoring:** Failed jobs can be retried safely, and metrics and alerts help operators identify database saturation, queue delays, and application errors.

The waiting room improves traffic control, but it does not replace database correctness. Even if two requests arrive simultaneously, only one can successfully claim the same seat.

## 6. Architecture Trade-offs

### Trade-off 1: Immediate consistency versus faster reads

Using a read replica and cache improves browsing performance and reduces the workload on the primary database. However, replicas can lag behind recent writes, and cached seat information can be stale.

**Decision:** Use caching and replicas for public event browsing, but use the primary database and transactional checks for seat holds, order finalisation, and other critical purchase decisions. This balances performance with correctness.

### Trade-off 2: Fairness versus checkout speed

A virtual waiting room protects the system from sudden traffic spikes and gives customers an orderly way to enter a sale. However, customers may have to wait even when some seats are still available.

**Decision:** Use a controlled queue during high-demand sales and provide clear queue status to users. This adds waiting time but improves stability and reduces the advantage gained by refreshing repeatedly or sending excessive requests.

### Trade-off 3: Synchronous versus asynchronous confirmation

Sending confirmation emails during the checkout request can delay the customer's response and make a successful purchase depend on the email service being available. Sending emails through a queue makes checkout faster, but confirmation messages may arrive later.

**Decision:** Confirm the purchase only after the order and seat allocation are safely committed. Send emails asynchronously, with retries and a dead-letter queue for jobs that repeatedly fail. The customer can view their confirmed ticket in the application even if email delivery is delayed.

## 7. Database Schema and Seat-Locking Transactions

This section provides PostgreSQL schema definitions and example SQL transactions for implementing TicketHub's seat reservation process.

### 7.1 Database schema

The database uses primary keys to identify records, foreign keys to maintain relationships, and unique constraints to prevent duplicate seat allocations.

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    venue VARCHAR(200) NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('draft', 'on_sale', 'cancelled', 'completed'))
);

CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    idempotency_key VARCHAR(100) NOT NULL,
    payment_reference VARCHAR(200) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, idempotency_key)
);

CREATE TABLE seats (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id),
    seat_label VARCHAR(30) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'held', 'sold')),
    held_by_user_id BIGINT REFERENCES users(id),
    hold_expires_at TIMESTAMPTZ,
    UNIQUE (event_id, seat_label)
);

CREATE TABLE order_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    seat_id BIGINT NOT NULL REFERENCES seats(id),
    price_at_purchase NUMERIC(12, 2) NOT NULL
        CHECK (price_at_purchase >= 0),
    UNIQUE (seat_id)
);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_seats_event_status ON seats(event_id, status);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
```

**Why these constraints matter:**

- `UNIQUE (event_id, seat_label)` prevents duplicate records for the same physical seat at an event.
- `UNIQUE (seat_id)` in `order_items` prevents the same seat from being allocated to two different order items, including across different orders.
- Foreign keys ensure that seats belong to existing events, orders belong to existing users, and order items reference valid seats and orders.
- The idempotency key prevents a client retry from creating duplicate orders for the same user and operation.
- The seat status and expiration timestamp represent temporary holds separately from confirmed sales.

The `UNIQUE (seat_id)` constraint is a final safeguard, but it is not enough by itself. The application must also manage temporary holds and payment confirmation correctly.

### 7.2 Transaction for holding seats

Suppose user `17` wants seats `105` and `106` for event `42`. Each hold lasts ten minutes.

The application begins a transaction and locks the requested seat rows in a consistent order:

```sql
BEGIN;

SELECT id, status, held_by_user_id, hold_expires_at
FROM seats
WHERE event_id = 42
  AND id IN (105, 106)
ORDER BY id
FOR UPDATE;
```

`FOR UPDATE` locks the selected rows until the transaction commits or rolls back. If another transaction is modifying one of these rows, the competing transaction must wait for the lock to be released.

The application then attempts to hold only seats that are available or whose previous holds have expired:

```sql
UPDATE seats
SET status = 'held',
    held_by_user_id = 17,
    hold_expires_at = CURRENT_TIMESTAMP + INTERVAL '10 minutes'
WHERE event_id = 42
  AND id IN (105, 106)
  AND (
      status = 'available'
      OR (
          status = 'held'
          AND hold_expires_at <= CURRENT_TIMESTAMP
      )
  )
RETURNING id;
```

**The application must check the result before committing.**

- If exactly two rows are returned, both requested seats were held successfully. The application commits the transaction.
- If fewer than two rows are returned, at least one seat was missing or unavailable. The application rolls back the transaction so that it does not leave a partial hold.

Successful case:

```sql
COMMIT;
```

Failure case:

```sql
ROLLBACK;
```

The row locks and conditional update prevent two concurrent requests from successfully claiming the same available seat. The transaction ensures that a request for multiple seats succeeds as a group or fails as a group.

The application should also verify that the number of selected rows matches the number of distinct requested seat IDs. The examples use fixed IDs for clarity; production code should use parameterised queries.

### 7.3 Transaction for confirming a purchase

Payment must be processed through the payment provider without keeping database locks open while waiting for a network response.

Once the payment provider confirms payment, the application starts a new transaction. It locks the seats and verifies that they are still held by the purchasing user and that the hold has not expired.

```sql
BEGIN;

SELECT id, status, held_by_user_id, hold_expires_at
FROM seats
WHERE id IN (105, 106)
ORDER BY id
FOR UPDATE;
```

The application checks that both seats are held by user `17` and that both holds remain valid. If either check fails, the transaction must not mark the seats as sold.

The application then changes the seat states conditionally:

```sql
UPDATE seats
SET status = 'sold',
    held_by_user_id = NULL,
    hold_expires_at = NULL
WHERE id IN (105, 106)
  AND status = 'held'
  AND held_by_user_id = 17
  AND hold_expires_at > CURRENT_TIMESTAMP
RETURNING id;
```

Only if both seats are returned does the application insert the order items and mark the order as paid:

```sql
INSERT INTO order_items (order_id, seat_id, price_at_purchase)
VALUES
    (9001, 105, 2500.00),
    (9001, 106, 2500.00);

UPDATE orders
SET status = 'paid'
WHERE id = 9001
  AND user_id = 17
  AND status = 'pending';

COMMIT;
```

These statements represent the success path. The application must verify that both seats were updated and exactly one pending order was updated. If any check fails, it must roll back the entire transaction rather than commit a partial result. The example assumes order `9001` was created previously and that the payment provider has confirmed the corresponding payment.

### 7.4 Handling concurrency and failures

If two users request the same seat simultaneously, the first transaction to lock and successfully hold that seat wins. The second transaction waits, then checks the updated state and cannot acquire the same seat while the first hold remains valid.

If a hold expires, another user can acquire the seat through the same locking and conditional-update process. Expiration alone does not release a seat; the next hold request or a background cleanup process must update its state safely.

If payment fails, the application releases seats only after checking that they are still held by the relevant user and have not been sold. Payment confirmations must be idempotent, and the system needs a recovery process for cases where payment succeeds but order finalisation fails.

The application must never hold a database transaction open while a customer is completing payment. This reduces lock contention during the popular sale and allows more customers to compete for seats safely.

**Conclusion:** TicketHub combines row-level locking, short transactions, conditional updates, expiration checks, unique constraints, and idempotent payment handling. The database is the authority on seat ownership, ensuring that concurrent requests cannot successfully sell the same seat twice.

### Conclusion

TicketHub must handle ordinary browsing efficiently while protecting seat allocation and payments during sudden demand spikes. The key design principle is to scale read-heavy operations independently while relying on database transactions and constraints for purchase correctness. A waiting room controls traffic, but only an atomic and consistent seat-allocation process can reliably prevent double-booking.