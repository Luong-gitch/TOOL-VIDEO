# Security Specification & Test Payloads

## Data Invariants
1. A user can only access, create, update, or read documents in their own `/users/{userId}` path and subcollections (`/users/{userId}/tasks/{taskId}`, `/users/{userId}/projects/{projectId}`).
2. An unauthenticated user cannot read or write any user records, tasks, or projects.
3. Top-level tasks can only be updated/deleted by the creator matching `userId`.
4. Document IDs must be valid alphanumeric strings adhering to regex `^[a-zA-Z0-9_\\-]+$` and `<= 128` characters.
5. All string fields have bounded maximum length to prevent resource exhaustion attacks.

## The "Dirty Dozen" Malicious / Invalid Test Payloads
1. **Unauthenticated Read on User Profile**: `GET /users/user_123` with `auth: null` -> EXPECT: `PERMISSION_DENIED`.
2. **Cross-User Profile Hijack**: `SET /users/victim_user` with `auth.uid = attacker_user` -> EXPECT: `PERMISSION_DENIED`.
3. **Cross-User Task Injection**: `SET /users/victim_user/tasks/task_1` with `auth.uid = attacker_user` -> EXPECT: `PERMISSION_DENIED`.
4. **Cross-User Project Read / List**: `LIST /users/victim_user/projects` with `auth.uid = attacker_user` -> EXPECT: `PERMISSION_DENIED`.
5. **Oversized String Bomb**: `SET /users/attacker/tasks/task_1` with `prompt = 'A'.repeat(500000)` -> EXPECT: `PERMISSION_DENIED`.
6. **Path Traversal / Junk Document ID**: `SET /users/user_123/tasks/../../bad_doc` -> EXPECT: `PERMISSION_DENIED`.
7. **Unverified Email Privilege Escalation**: Setting admin / elevated roles without verified credentials -> EXPECT: `PERMISSION_DENIED`.
8. **Shadow Field Injection**: `SET /users/user_123` with unexpected system exploit fields -> EXPECT: `PERMISSION_DENIED`.
9. **Negative Credits Injection**: `SET /users/user_123` with `credits = -999999` -> EXPECT: `PERMISSION_DENIED`.
10. **Top-Level Task Ownership Tamper**: `UPDATE /tasks/task_1` where `resource.data.userId != request.auth.uid` -> EXPECT: `PERMISSION_DENIED`.
11. **Malicious Task ID Injection**: `SET /users/user_123/tasks/<script>alert(1)</script>` -> EXPECT: `PERMISSION_DENIED`.
12. **Catch-All Arbitrary Collection Read**: `GET /random_secret_collection/secret_doc` -> EXPECT: `PERMISSION_DENIED`.
