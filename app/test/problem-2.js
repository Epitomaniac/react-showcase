import { useEffect, useState } from "react";

function UserList({ users }) {
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const result = users.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredUsers(result);
  }, [query]);

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
