<!-- GET -->

function UserList() {
const { data, isLoading, error } = useApiQuery<User[]>(
['users'], // Query key for caching
'/users', // API endpoint
{ enabled: true } // Optional: enable the query
);

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

return (

<ul>
{data?.map(user => <li key={user.id}>{user.name}</li>)}
</ul>
);
}

<!-- POST -->

function CreateUser() {
const mutation = useApiMutation<User, { name: string }>(
['createUser'],
'/users',
'POST',
{ onSuccess: () => alert('User created!') }
);

const handleSubmit = () => {
mutation.mutate({ name: 'New User' });
};

return (

<div>
<button onClick={handleSubmit}>Create User</button>
</div>
);
}

<!-- PUT -->

function UpdateUser({ userId }: { userId: string }) {
const mutation = useApiMutation<User, { name: string }>(
['updateUser'],
`/users/${userId}`,
'PUT',
{ onSuccess: () => alert('User updated!') }
);

const handleUpdate = () => {
mutation.mutate({ name: 'Updated Name' });
};

return (

<div>
<button onClick={handleUpdate}>Update</button>
</div>
);
}

<!-- PATCH -->

function PatchUser({ userId }: { userId: string }) {
const mutation = useApiMutation<User, { name?: string }>(
['patchUser'],
`/users/${userId}`,
'PATCH',
{ onSuccess: () => alert('User patched!') }
);

const handlePatch = () => {
mutation.mutate({ name: 'Patched Name' });
};

return (

<div>
<button onClick={handlePatch}>Patch</button>
</div>
);
}
