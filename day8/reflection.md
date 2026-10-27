# Day 8 Reflection

## 1. What was the most difficult concept, and how did you overcome it?

The most difficult concept for me was system scaling, especially understanding how to estimate traffic and design a system that can handle sudden increases in users. At first, the calculations seemed like separate numbers, but I gradually understood how daily activity, requests per second, peak traffic, and storage requirements influence architectural decisions. I overcame this by breaking problems into smaller calculations, stating my assumptions, and connecting the results to components such as load balancers, caches, databases, and message queues. The feedback on my photo-sharing system design also taught me that correct calculations are not enough; I must explain the complete request flow and justify my design decisions.

## 2. Which part of your capstone would you improve based on feedback?

I would improve the completeness and clarity of my system design documentation. Based on the feedback I received, my calculations and architecture diagram were good, but I left out important explanations about the upload process, component responsibilities, and architectural trade-offs. I would improve this by documenting each step of a request, explaining how failures are handled, and discussing the advantages and disadvantages of my decisions. I would also use a final checklist to ensure that every required section is complete before submitting my work.

## 3. What will you learn next?

Next, I want to strengthen my understanding of databases, transactions, and backend development. I would like to practise building APIs that use a real database, implement authentication, and handle concurrent requests safely. I also want to learn more about testing, monitoring, and deploying applications so I can connect system design concepts to working software.