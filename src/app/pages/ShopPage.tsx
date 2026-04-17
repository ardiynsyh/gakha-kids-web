import { useParams } from 'react-router';

export function ShopPage() {
  const { categoryId } = useParams();
  
  return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <h1>Shop Page</h1>
      <p>Category: {categoryId}</p>
      <div style={{ padding: '20px', border: '1px solid black' }}>
        If you see this, the routing is working!
      </div>
    </div>
  );
}
