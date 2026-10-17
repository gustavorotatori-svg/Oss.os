# Security Specification: OSS.OS Firestore Security

This document outlines the data invariants, potential attack vectors (the "Dirty Dozen"), and rule verification specifications for the OSS.OS social/commerce client-side platform.

## 1. Data Invariants

1. **User Profile (`/users/{userId}`)**: 
   - A user profile must be created only by the authenticated owner (`request.auth.uid == userId`).
   - The user's points must be a non-negative integer and initialized gracefully.
   - Users cannot edit another user's profile.

2. **Wishlist (`/users/{userId}/wishlist/{productId}`)**:
   - Only the authenticated owner can access, add to, modify, or clear their own wishlist.
   - Any external user or malicious attacker attempting to read or write entries inside another athlete's wishlist must be strictly rejected with `PERMISSION_DENIED`.

3. **Reviews (`/products/{productId}/reviews/{reviewId}`)**:
   - Read access is public.
   - Write access is restricted to authenticated users.
   - The `userId` property inside the review document MUST match `request.auth.uid` to prevent identity spoofing.
   - Only the owner (`userId`) of a review can update or delete it.

4. **Products & Offers (`/products/{productId}`)**:
   - Products are publicly visible, but writes (create, update, delete) must be performed strictly by authenticated portal users.
   - Pricing comparison offers (`/products/{productId}/offers/{offerId}`) can be viewed by anyone, but writes must be protected.

5. **Academies (`/academies/{academyId}`)**:
   - Academies are visible to everyone.
   - Any authenticated user can register a new academy to support local BJJ affiliate schools, but writes must follow strict schema validation to prevent spam or malicious payloads.

---

## 2. The "Dirty Dozen" Attack Payloads

Below are the 12 specific JSON payloads designed to breach Identity, Integrity, or State, which our Firestore rules must mathematically reject:

### Attack 1: User Profile - Spoofing Owner ID
- **Target Path**: `/users/legit_user_123`
- **Request Auth**: `uid: "attacker_456", email_verified: true`
- **Payload**:
```json
{
  "displayName": "Júnior Attacker",
  "points": 50000
}
```
- **Reason to Reject**: The document ID (`legit_user_123`) does not match the requester's actual UID (`attacker_456`).

### Attack 2: User Profile - Self-Allocating Points
- **Target Path**: `/users/legit_user_123`
- **Request Auth**: `uid: "legit_user_123", email_verified: true`
- **Payload**:
```json
{
  "displayName": "Legit User",
  "points": -100
}
```
- **Reason to Reject**: Points cannot be negative.

### Attack 3: Wishlist - Unauthorized Data Exfiltration
- **Target Path**: `/users/victim_789/wishlist/kimono_atama`
- **Request Auth**: `uid: "attacker_456", email_verified: true`
- **Operation**: `get` / `read`
- **Reason to Reject**: Attacker is attempting to read another athlete's private wishlist document.

### Attack 4: Wishlist - Poisoning Another Athlete's Wishlist
- **Target Path**: `/users/victim_789/wishlist/premium_gi`
- **Request Auth**: `uid: "attacker_456", email_verified: true`
- **Payload**:
```json
{
  "alertEnabled": true,
  "addedAt": "2026-06-13T00:00:00Z"
}
```
- **Reason to Reject**: Attacker is attempting to insert entries into another user's parent path.

### Attack 5: Reviews - Identity Spoofing (Review Posting as Another User)
- **Target Path**: `/products/kimono_challenger/reviews/rev_999`
- **Request Auth**: `uid: "attacker_456", email_verified: true`
- **Payload**:
```json
{
  "userName": "Mestre Inocente",
  "rating": 5,
  "comment": "Kimono excelente, muito resistente!",
  "date": "13/06/2026",
  "userId": "victim_789"
}
```
- **Reason to Reject**: The payload `userId` field is set to `victim_789` but the authenticated user is `attacker_456`.

### Attack 6: Reviews - Out-of-Bound Rating
- **Target Path**: `/products/kimono_challenger/reviews/rev_999`
- **Request Auth**: `uid: "viewer_111", email_verified: true`
- **Payload**:
```json
{
  "userName": "Viewer One",
  "rating": 6,
  "comment": "Muito bom!",
  "date": "13/06/2026",
  "userId": "viewer_111"
}
```
- **Reason to Reject**: The rating value (6) is outside the mandatory [1, 5] range.

### Attack 7: Reviews - Character Overflow Spam
- **Target Path**: `/products/kimono_challenger/reviews/rev_999`
- **Request Auth**: `uid: "viewer_111", email_verified: true`
- **Payload**:
```json
{
  "userName": "V",
  "rating": 4,
  "comment": "...[10,000 characters of random junk text to flood storage and memory]...",
  "date": "13/06/2026",
  "userId": "viewer_111"
}
```
- **Reason to Reject**: The userName (1 character) is too short (min 2), and/or the comment exceeds the 3000-character boundary limits.

### Attack 8: Reviews - Unauthorized Modification of reviews
- **Target Path**: `/products/kimono_challenger/reviews/rev_legit`
- **Request Auth**: `uid: "attacker_456", email_verified: true`
- **Payload (Update)**:
```json
{
  "comment": "This product is a scam! Attacker edited this."
}
```
- **Reason to Reject**: Attacker does not own the original review (`existing().userId != request.auth.uid`).

### Attack 9: Academies - Unauthenticated Registration Spam
- **Target Path**: `/academies/aca_spam_1`
- **Request Auth**: `null` (Anonymous/Unauthenticated)
- **Payload**:
```json
{
  "name": "Fake Academy",
  "professor": "Ghost",
  "location": "Nowhere"
}
```
- **Reason to Reject**: User must be fully signed in (`isSignedIn()`) to register or update academies.

### Attack 10: Academies - Malicious Input injection
- **Target Path**: `/academies/aca_legit`
- **Request Auth**: `uid: "attacker_456", email_verified: true`
- **Payload**:
```json
{
  "name": "A",
  "professor": "Mestre <script>alert('xss')</script>",
  "location": "SP"
}
```
- **Reason to Reject**: Name size 'A' is below the minimum length of 2 characters, or fields fail safe boundaries.

### Attack 11: Products - Creating products without proper schema (Shadow Field Attempt)
- **Target Path**: `/products/prod_exploit`
- **Request Auth**: `uid: "attacker_456", email_verified: true`
- **Payload**:
```json
{
  "title": "Exploit Belt",
  "price": 10.0,
  "imageUrl": "https://attack.com/img.png",
  "affiliateUrl": "https://attack.com",
  "platform": "ScamMarket",
  "category": "Faixas",
  "isSecretPrivilegedAdmin": true
}
```
- **Reason to Reject**: Excess key `isSecretPrivilegedAdmin` is treated as a shadow field (ghost field) and must be blocked by strict length or validation structures.

### Attack 12: Products - Malicious Document ID Poisoning
- **Target Path**: `/products/invalid/doc/id_poisoning/attempt`
- **Request Auth**: `uid: "attacker_456", email_verified: true`
- **Payload**:
```json
{
  "title": "Poisoned Gi",
  "price": 299.99,
  "imageUrl": "https://img.png",
  "affiliateUrl": "https://affiliate.com",
  "platform": "Centauro",
  "category": "Kimonos"
}
```
- **Reason to Reject**: Invalid ID path variable structure or invalid characters (slashes / placeholders) being injected into identifiers.
