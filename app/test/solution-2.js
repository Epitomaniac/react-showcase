"use client";

import { useState } from "react";

// issue:
// - the useEffect and useState for filteredUsers are redundant; the value can
//   just be derived from existing state
// - the component should guard against a null or non-array users prop; in a production
//   app TypeScript should be able to take care of it

function UserList({ users }) {
  const [query, setQuery] = useState("");
  const filteredUsers = Array.isArray(users)
    ? users.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search users"
      />

      <ul>
        {filteredUsers.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
