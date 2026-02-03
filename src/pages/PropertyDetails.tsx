import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PropertyDetailsView as PropertyDetailsContent } from '@/views/PropertyDetailsView';
import { useAuth } from '@/hooks/useAuth';
import { useProperties } from '@/hooks/useProperties';
import { Property } from '@/types';
import { PageLoader } from '@/lib/routes';

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties, updateProperty, deleteProperty, isLoading } = useProperties(user?.id);

  const property = properties.find(p => p.id === id);

  const handleBack = () => {
    navigate('/properties');
  };

  const handleUpdate = (updatedProperty: Property) => {
    updateProperty(updatedProperty);
  };

  const handleDelete = (propertyId: string) => {
    deleteProperty(propertyId);
    navigate('/properties');
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!property) {
    navigate('/properties');
    return null;
  }

  return (
    <MobileLayout showNav={false}>
      <PropertyDetailsContent
        property={property}
        onBack={handleBack}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </MobileLayout>
  );
}
