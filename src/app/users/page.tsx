async function getUsers() {
    const res = await fetch('https://api.spider.asapp-it.de/projects')
    if (!res.ok) throw new Error('Failed to fetch users')
    return res.json()
  }
  
  export default async function UsersPage() {
    const users = await getUsers()
    
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        <ul className="space-y-2">
          {users.map((user: any) => (
            <div key={user.id}>
              
              <li>
                {user}
              </li>
            </div>
          ))}
        </ul>
      </div>
    )
  }