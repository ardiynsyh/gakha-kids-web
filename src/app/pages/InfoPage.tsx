import { useParams } from 'react-router';

export function InfoPage() {
  const { id } = useParams();
  
  return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <h1>Info Page</h1>
      <p>Page ID: {id}</p>
    </div>
  );
}
