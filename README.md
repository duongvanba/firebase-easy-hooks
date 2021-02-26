## Firebase hookm for react

# 1. Install 
```bash
yarn add firebase-easy-hooks
```

# 2. Using

### Auth
```typescript
import { useAuth } from 'firebase-easy-hooks'
const { user, loading, claims } = useAuth()
```

### Render collection
```typescript
import { useCollectionData } from 'firebase-easy-hooks'
const { data, loading, error, fetch_more, has_more, empty, add } = useCollectionData('users/random_user_id/payments')

// data: List items array
// loading: boolean
// fetch_more: Load more data
// has_more: boolean 
// empty == true if no items in list
// add : Add new document to collections
```

### Render document
```typescript
import { useDocumentData } from 'firebase-easy-hooks'
const { data, loading, error  } = useDocumentData('users/random_user_id/payments/paymentX')

// data: List items array
// loading: boolean
```